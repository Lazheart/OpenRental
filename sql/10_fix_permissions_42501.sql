-- ============================================================================
-- PROYECTO OPENRENTAL - FIX PERMISOS (ERROR 42501 / 403 FORBIDDEN)
-- Archivo: 10_fix_permissions_42501.sql
-- Descripción: Otorga los permisos GRANT necesarios al rol 'authenticated'
--              sobre las vistas analíticas, tablas de entidad y secuencias,
--              revocados previamente en SupabaseAuth.sql.
-- ============================================================================

-- 1. Permiso de uso del esquema public
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Permisos en tablas de entidad (para que funcionen los JOINs de clientes/empleados)
GRANT SELECT ON public.persona             TO authenticated;
GRANT SELECT ON public.cliente             TO authenticated;
GRANT SELECT ON public.empleado            TO authenticated;
GRANT SELECT ON public.conductor_adicional TO authenticated;

-- 3. Permisos en tablas operativas y de catálogo
GRANT SELECT ON public.vehiculo  TO anon, authenticated;
GRANT SELECT ON public.categoria TO anon, authenticated;
GRANT SELECT ON public.sucursal  TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reserva       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alquiler      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pago          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspeccion    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mantenimiento TO authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.vehiculo      TO authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.categoria     TO authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.sucursal      TO authenticated;

-- 4. Permisos sobre las 7 vistas del sistema para usuarios autenticados (agentes y clientes)
GRANT SELECT ON public.vw_ficha_vehiculo                TO anon, authenticated;
GRANT SELECT ON public.vw_vehiculos_disponibles         TO anon, authenticated;
GRANT SELECT ON public.vw_historial_alquiler            TO authenticated;
GRANT SELECT ON public.vw_resumen_financiero_alquiler   TO authenticated;
GRANT SELECT ON public.vw_historial_mantenimiento       TO authenticated;
GRANT SELECT ON public.vw_perfil_cliente                TO authenticated;
GRANT SELECT ON public.vw_alquileres_pendientes         TO authenticated;

-- 5. Permiso sobre secuencias (para inserción con autoincrementables/identities)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. Funciones helper
GRANT EXECUTE ON FUNCTION public.get_my_persona_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role()        TO authenticated;

-- 7. Notificar a PostgREST para recargar el esquema de permisos
NOTIFY pgrst, 'reload schema';

