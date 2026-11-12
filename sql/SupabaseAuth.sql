-- =========================================================
-- OPENRENTAL - PERFILES Y AUTENTICACIÓN
-- Supabase Auth + public.profiles
-- =========================================================

-- 1. Tabla de perfiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    username TEXT,
    display_name TEXT,

    role TEXT NOT NULL DEFAULT 'CLIENTE'
        CHECK (role IN (
            'ADMINISTRADOR',
            'SUPERVISOR',
            'RECEPCIONISTA',
            'MECANICO',
            'CLIENTE'
        )),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Username único, sin distinguir mayúsculas y minúsculas
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
ON public.profiles (LOWER(username))
WHERE username IS NOT NULL;

-- 2. Crear automáticamente el perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        role
    )
    VALUES (
        NEW.id,
        NULLIF(LOWER(TRIM(NEW.raw_user_meta_data ->> 'username')), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data ->> 'display_name'), ''),
        'CLIENTE'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- 3. Trigger de registro
DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();

-- 4. Seguridad de perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON TABLE public.profiles TO authenticated;

GRANT UPDATE (username, display_name)
ON TABLE public.profiles TO authenticated;

-- Cada usuario solamente puede consultar su perfil
DROP POLICY IF EXISTS "Users can view own profile"
ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

-- Cada usuario puede modificar únicamente sus datos editables
DROP POLICY IF EXISTS "Users can update own profile"
ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- 5. Proteger las siete vistas
DO $$
DECLARE
    vista RECORD;
BEGIN
    FOR vista IN
        SELECT schemaname, viewname
        FROM pg_views
        WHERE schemaname = 'public'
        AND viewname LIKE 'vw_%'
    LOOP
        EXECUTE format(
            'REVOKE ALL PRIVILEGES ON TABLE %I.%I FROM anon, authenticated',
            vista.schemaname,
            vista.viewname
        );
    END LOOP;
END $$;

-- Solamente estas dos vistas serán públicas
GRANT SELECT ON
    public.vw_ficha_vehiculo,
    public.vw_vehiculos_disponibles
TO anon, authenticated;

-- 6. Actualizar esquema REST
NOTIFY pgrst, 'reload schema';