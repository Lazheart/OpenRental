-- =========================================================
-- OPENRENTAL - MIGRACIÓN DE AUTENTICACIÓN (09)
-- Integración ampliada auth.users ↔ tablas operativas
-- Ejecutar DESPUÉS de SupabaseAuth.sql
-- =========================================================


-- =========================================================
-- SECCIÓN 1: VINCULAR auth.users CON TABLA persona
-- =========================================================

-- 1.1 Agregar columna auth_user_id a persona (si no existe)
ALTER TABLE public.persona
    ADD COLUMN IF NOT EXISTS auth_user_id UUID
        REFERENCES auth.users(id) ON DELETE SET NULL;

-- 1.2 Índice único para garantizar relación 1-a-1
CREATE UNIQUE INDEX IF NOT EXISTS persona_auth_user_id_unique
    ON public.persona (auth_user_id)
    WHERE auth_user_id IS NOT NULL;

-- 1.3 Función: vincular manualmente un auth.users con una persona existente
--     Solo ADMINISTRADOR debería ejecutarla (control vía RLS/grants).
CREATE OR REPLACE FUNCTION public.link_auth_to_persona(
    p_auth_id   UUID,
    p_id_persona INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Verificar que la persona existe
    IF NOT EXISTS (
        SELECT 1 FROM public.persona WHERE id_persona = p_id_persona
    ) THEN
        RAISE EXCEPTION 'La persona con id_persona=% no existe.', p_id_persona;
    END IF;

    -- Verificar que el auth.users existe (evita FK violation explícita)
    IF NOT EXISTS (
        SELECT 1 FROM auth.users WHERE id = p_auth_id
    ) THEN
        RAISE EXCEPTION 'El usuario auth con id=% no existe.', p_auth_id;
    END IF;

    UPDATE public.persona
    SET    auth_user_id = p_auth_id
    WHERE  id_persona   = p_id_persona;
END;
$$;

-- 1.4 Función: obtener id_persona del usuario autenticado actualmente
CREATE OR REPLACE FUNCTION public.get_my_persona_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT id_persona
    FROM   public.persona
    WHERE  auth_user_id = auth.uid()
    LIMIT  1;
$$;

-- 1.5 Función: obtener el rol del perfil del usuario autenticado actualmente
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT role
    FROM   public.profiles
    WHERE  id = auth.uid()
    LIMIT  1;
$$;


-- =========================================================
-- SECCIÓN 2: HABILITAR RLS EN TABLAS OPERATIVAS
-- =========================================================

ALTER TABLE public.vehiculo      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categoria     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursal      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserva       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alquiler      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pago          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspeccion    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mantenimiento ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- SECCIÓN 3: POLÍTICAS — vehiculo
-- SELECT público (anon + authenticated)
-- Escritura: solo agentes autenticados
-- =========================================================

DROP POLICY IF EXISTS "vehiculo_select_public"    ON public.vehiculo;
DROP POLICY IF EXISTS "vehiculo_insert_agentes"   ON public.vehiculo;
DROP POLICY IF EXISTS "vehiculo_update_agentes"   ON public.vehiculo;
DROP POLICY IF EXISTS "vehiculo_delete_agentes"   ON public.vehiculo;

CREATE POLICY "vehiculo_select_public"
    ON public.vehiculo FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "vehiculo_insert_agentes"
    ON public.vehiculo FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
    );

CREATE POLICY "vehiculo_update_agentes"
    ON public.vehiculo FOR UPDATE
    TO authenticated
    USING  (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'))
    WITH CHECK (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));

CREATE POLICY "vehiculo_delete_agentes"
    ON public.vehiculo FOR DELETE
    TO authenticated
    USING (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));


-- =========================================================
-- SECCIÓN 4: POLÍTICAS — categoria
-- =========================================================

DROP POLICY IF EXISTS "categoria_select_public"  ON public.categoria;
DROP POLICY IF EXISTS "categoria_insert_agentes" ON public.categoria;
DROP POLICY IF EXISTS "categoria_update_agentes" ON public.categoria;
DROP POLICY IF EXISTS "categoria_delete_agentes" ON public.categoria;

CREATE POLICY "categoria_select_public"
    ON public.categoria FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "categoria_insert_agentes"
    ON public.categoria FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
    );

CREATE POLICY "categoria_update_agentes"
    ON public.categoria FOR UPDATE
    TO authenticated
    USING  (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'))
    WITH CHECK (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));

CREATE POLICY "categoria_delete_agentes"
    ON public.categoria FOR DELETE
    TO authenticated
    USING (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));


-- =========================================================
-- SECCIÓN 5: POLÍTICAS — sucursal
-- =========================================================

DROP POLICY IF EXISTS "sucursal_select_public"  ON public.sucursal;
DROP POLICY IF EXISTS "sucursal_insert_agentes" ON public.sucursal;
DROP POLICY IF EXISTS "sucursal_update_agentes" ON public.sucursal;
DROP POLICY IF EXISTS "sucursal_delete_agentes" ON public.sucursal;

CREATE POLICY "sucursal_select_public"
    ON public.sucursal FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "sucursal_insert_agentes"
    ON public.sucursal FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
    );

CREATE POLICY "sucursal_update_agentes"
    ON public.sucursal FOR UPDATE
    TO authenticated
    USING  (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'))
    WITH CHECK (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));

CREATE POLICY "sucursal_delete_agentes"
    ON public.sucursal FOR DELETE
    TO authenticated
    USING (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));


-- =========================================================
-- SECCIÓN 6: POLÍTICAS — reserva
-- SELECT: propias (CLIENTE) o agente
-- INSERT: CLIENTE con su propio id_cliente, o agente
-- UPDATE: solo agentes
-- DELETE: solo ADMINISTRADOR
-- =========================================================

DROP POLICY IF EXISTS "reserva_select_propia_o_agente" ON public.reserva;
DROP POLICY IF EXISTS "reserva_insert_cliente_o_agente" ON public.reserva;
DROP POLICY IF EXISTS "reserva_update_agentes"          ON public.reserva;
DROP POLICY IF EXISTS "reserva_delete_admin"            ON public.reserva;

CREATE POLICY "reserva_select_propia_o_agente"
    ON public.reserva FOR SELECT
    TO authenticated
    USING (
        -- El cliente ve solo sus propias reservas
        id_cliente = public.get_my_persona_id()
        OR
        -- Los agentes ven todas
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
    );

CREATE POLICY "reserva_insert_cliente_o_agente"
    ON public.reserva FOR INSERT
    TO authenticated
    WITH CHECK (
        -- CLIENTE solo puede insertar con su propio id_cliente
        (public.get_my_role() = 'CLIENTE'
            AND id_cliente = public.get_my_persona_id())
        OR
        -- Agentes pueden insertar cualquier reserva
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
    );

CREATE POLICY "reserva_update_agentes"
    ON public.reserva FOR UPDATE
    TO authenticated
    USING  (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'))
    WITH CHECK (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));

CREATE POLICY "reserva_delete_admin"
    ON public.reserva FOR DELETE
    TO authenticated
    USING (public.get_my_role() = 'ADMINISTRADOR');


-- =========================================================
-- SECCIÓN 7: POLÍTICAS — alquiler
-- Agentes: SELECT + INSERT + UPDATE completo
-- CLIENTE: SELECT de alquileres vinculados a sus reservas
-- =========================================================

DROP POLICY IF EXISTS "alquiler_select_agente_o_cliente" ON public.alquiler;
DROP POLICY IF EXISTS "alquiler_insert_agentes"          ON public.alquiler;
DROP POLICY IF EXISTS "alquiler_update_agentes"          ON public.alquiler;

CREATE POLICY "alquiler_select_agente_o_cliente"
    ON public.alquiler FOR SELECT
    TO authenticated
    USING (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
        OR
        -- CLIENTE ve alquileres cuya reserva le pertenece
        EXISTS (
            SELECT 1 FROM public.reserva r
            WHERE  r.id_reserva = alquiler.id_reserva
            AND    r.id_cliente = public.get_my_persona_id()
        )
    );

CREATE POLICY "alquiler_insert_agentes"
    ON public.alquiler FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
    );

CREATE POLICY "alquiler_update_agentes"
    ON public.alquiler FOR UPDATE
    TO authenticated
    USING  (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'))
    WITH CHECK (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));


-- =========================================================
-- SECCIÓN 8: POLÍTICAS — pago
-- Agentes: SELECT + INSERT + UPDATE completo
-- CLIENTE: SELECT de pagos vinculados a sus alquileres/reservas
-- =========================================================

DROP POLICY IF EXISTS "pago_select_agente_o_cliente" ON public.pago;
DROP POLICY IF EXISTS "pago_insert_agentes"          ON public.pago;
DROP POLICY IF EXISTS "pago_update_agentes"          ON public.pago;

CREATE POLICY "pago_select_agente_o_cliente"
    ON public.pago FOR SELECT
    TO authenticated
    USING (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
        OR
        -- CLIENTE ve pagos cuya reserva le pertenece
        EXISTS (
            SELECT 1
            FROM   public.alquiler a
            JOIN   public.reserva  r ON r.id_reserva = a.id_reserva
            WHERE  a.id_alquiler  = pago.id_alquiler
            AND    r.id_cliente   = public.get_my_persona_id()
        )
    );

CREATE POLICY "pago_insert_agentes"
    ON public.pago FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
    );

CREATE POLICY "pago_update_agentes"
    ON public.pago FOR UPDATE
    TO authenticated
    USING  (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'))
    WITH CHECK (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));


-- =========================================================
-- SECCIÓN 9: POLÍTICAS — inspeccion
-- Agentes: SELECT + INSERT + UPDATE completo
-- CLIENTE: SELECT de inspecciones vinculadas a sus alquileres/reservas
-- =========================================================

DROP POLICY IF EXISTS "inspeccion_select_agente_o_cliente" ON public.inspeccion;
DROP POLICY IF EXISTS "inspeccion_insert_agentes"          ON public.inspeccion;
DROP POLICY IF EXISTS "inspeccion_update_agentes"          ON public.inspeccion;

CREATE POLICY "inspeccion_select_agente_o_cliente"
    ON public.inspeccion FOR SELECT
    TO authenticated
    USING (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
        OR
        EXISTS (
            SELECT 1
            FROM   public.alquiler a
            JOIN   public.reserva  r ON r.id_reserva = a.id_reserva
            WHERE  a.id_alquiler  = inspeccion.id_alquiler
            AND    r.id_cliente   = public.get_my_persona_id()
        )
    );

CREATE POLICY "inspeccion_insert_agentes"
    ON public.inspeccion FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA')
    );

CREATE POLICY "inspeccion_update_agentes"
    ON public.inspeccion FOR UPDATE
    TO authenticated
    USING  (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'))
    WITH CHECK (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'RECEPCIONISTA'));


-- =========================================================
-- SECCIÓN 10: POLÍTICAS — mantenimiento
-- Solo MECANICO, SUPERVISOR, ADMINISTRADOR
-- =========================================================

DROP POLICY IF EXISTS "mantenimiento_select_staff" ON public.mantenimiento;
DROP POLICY IF EXISTS "mantenimiento_insert_staff" ON public.mantenimiento;
DROP POLICY IF EXISTS "mantenimiento_update_staff" ON public.mantenimiento;
DROP POLICY IF EXISTS "mantenimiento_delete_staff" ON public.mantenimiento;

CREATE POLICY "mantenimiento_select_staff"
    ON public.mantenimiento FOR SELECT
    TO authenticated
    USING (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'MECANICO')
    );

CREATE POLICY "mantenimiento_insert_staff"
    ON public.mantenimiento FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'MECANICO')
    );

CREATE POLICY "mantenimiento_update_staff"
    ON public.mantenimiento FOR UPDATE
    TO authenticated
    USING  (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'MECANICO'))
    WITH CHECK (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR', 'MECANICO'));

CREATE POLICY "mantenimiento_delete_staff"
    ON public.mantenimiento FOR DELETE
    TO authenticated
    USING (public.get_my_role() IN ('ADMINISTRADOR', 'SUPERVISOR'));


-- =========================================================
-- SECCIÓN 11: GRANTS DE ACCESO A TABLAS OPERATIVAS Y VISTAS
-- Permite que las políticas RLS y consultas se evalúen sin error 42501 (403 Forbidden)
-- =========================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Tablas de lectura pública
GRANT SELECT ON public.vehiculo  TO anon, authenticated;
GRANT SELECT ON public.categoria TO anon, authenticated;
GRANT SELECT ON public.sucursal  TO anon, authenticated;

-- Tablas de entidad (necesarias para JOINs en vistas y reservas)
GRANT SELECT ON public.persona             TO authenticated;
GRANT SELECT ON public.cliente             TO authenticated;
GRANT SELECT ON public.empleado            TO authenticated;
GRANT SELECT ON public.conductor_adicional TO authenticated;

-- Tablas operativas: acceso a authenticated (controlado por RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reserva       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alquiler      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pago          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspeccion    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mantenimiento TO authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.vehiculo      TO authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.categoria     TO authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.sucursal      TO authenticated;

-- Vistas analíticas y operativas del sistema (para agentes/staff autenticados)
GRANT SELECT ON public.vw_ficha_vehiculo                TO anon, authenticated;
GRANT SELECT ON public.vw_vehiculos_disponibles         TO anon, authenticated;
GRANT SELECT ON public.vw_historial_alquiler            TO authenticated;
GRANT SELECT ON public.vw_resumen_financiero_alquiler   TO authenticated;
GRANT SELECT ON public.vw_historial_mantenimiento       TO authenticated;
GRANT SELECT ON public.vw_perfil_cliente                TO authenticated;
GRANT SELECT ON public.vw_alquileres_pendientes         TO authenticated;

-- Permisos sobre secuencias (para INSERT con ID generado)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Acceso a funciones helper para todos los autenticados
GRANT EXECUTE ON FUNCTION public.get_my_persona_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role()        TO authenticated;

-- Solo ADMINISTRADOR debería llamar a link_auth_to_persona
-- (enforcement vía RLS y lógica de aplicación)
GRANT EXECUTE ON FUNCTION public.link_auth_to_persona(UUID, INT) TO authenticated;


-- =========================================================
-- SECCIÓN 12: USUARIOS DEMO
-- =========================================================

-- DEMO: Crear usuarios en Supabase Auth Dashboard (Authentication > Users > Invite)
-- o via Supabase Management API / supabase CLI.
--
-- Usuario cliente demo:
--   Email    : demo@openrental.pe
--   Password : Demo1234!
--   Role     : CLIENTE  (asignado automáticamente por el trigger on_auth_user_created)
--
-- Usuario agente demo:
--   Email    : agente@openrental.pe
--   Password : Agente1234!
--   Role     : RECEPCIONISTA  (ver script de promoción abajo)

-- Script para promover a agente (ejecutar después de crear el usuario en Supabase Auth Dashboard):
-- UPDATE public.profiles
-- SET    role = 'RECEPCIONISTA'
-- WHERE  id = (SELECT id FROM auth.users WHERE email = 'agente@openrental.pe');

-- Para vincular el agente demo con un registro de persona/empleado existente:
-- SELECT public.link_auth_to_persona(
--     (SELECT id FROM auth.users WHERE email = 'agente@openrental.pe'),
--     <id_persona_del_empleado>
-- );

-- Para vincular el cliente demo con un registro de persona/cliente existente:
-- SELECT public.link_auth_to_persona(
--     (SELECT id FROM auth.users WHERE email = 'demo@openrental.pe'),
--     <id_persona_del_cliente>
-- );


-- =========================================================
-- RELOAD SCHEMA (PostgREST)
-- =========================================================

NOTIFY pgrst, 'reload schema';
