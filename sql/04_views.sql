-- ============================================================================
-- PROYECTO OPENRENTAL - BASE DE DATOS I (UTEC)
-- Archivo: 04_views.sql
-- Descripción: Definición de vistas del sistema OpenRental. Cada vista
--              encapsula una consulta recurrente del dominio, simplificando
--              el acceso a información operativa, analítica y de auditoría.
-- ============================================================================

-- ============================================================================
-- VISTA 1: FICHA COMPLETA DEL VEHÍCULO CON CATEGORÍA Y SUCURSAL
-- Propósito: Proporcionar una vista unificada de cada unidad de la flota con
--            su categoría, sucursal actual, tarifa aplicable (resolviendo el
--            COALESCE entre tarifa específica y tarifa base) y estado operativo.
-- Usuarios: Recepcionista, Administrador, Supervisor.
-- ============================================================================
CREATE OR REPLACE VIEW vw_ficha_vehiculo AS
SELECT
    v.id_vehiculo,
    v.placa,
    v.marca,
    v.modelo,
    v.anio,
    v.color,
    v.transmision::TEXT        AS transmision,
    v.combustible::TEXT        AS combustible,
    v.capacidad_pasajeros,
    v.kilometraje_actual,
    v.estado::TEXT              AS estado_vehiculo,
    v.activo                   AS vehiculo_activo,
    -- Tarifa efectiva: prioriza la tarifa propia del vehículo sobre la base
    COALESCE(v.tarifa_diaria, c.tarifa_base_diaria) AS tarifa_efectiva,
    c.id_categoria,
    c.nombre                   AS categoria_nombre,
    c.tarifa_base_diaria,
    c.monto_garantia_base,
    s.id_sucursal,
    s.nombre                   AS sucursal_nombre,
    s.ciudad                   AS sucursal_ciudad
FROM vehiculo v
JOIN categoria c ON v.id_categoria = c.id_categoria
JOIN sucursal  s ON v.id_sucursal_actual = s.id_sucursal;


-- ============================================================================
-- VISTA 2: DISPONIBILIDAD REAL DE LA FLOTA
-- Propósito: Exponer únicamente los vehículos activos cuyo estado operativo
--            es 'DISPONIBLE', listos para ser asignados a una nueva reserva.
--            Complementa la lógica anti-double-booking al ofrecer un filtro
--            rápido previo a la verificación de solapamiento.
-- Usuarios: Recepcionista.
-- ============================================================================
CREATE OR REPLACE VIEW vw_vehiculos_disponibles AS
SELECT
    fv.*
FROM vw_ficha_vehiculo fv
WHERE fv.estado_vehiculo = 'DISPONIBLE'
  AND fv.vehiculo_activo = TRUE;


-- ============================================================================
-- VISTA 3: HISTORIAL COMPLETO DE ALQUILERES
-- Propósito: Consolidar en una sola proyección toda la información del ciclo
--            de vida de un alquiler: datos del contrato, reserva de origen,
--            vehículo asignado, cliente titular, empleados de entrega y
--            devolución, inspección asociada y resumen financiero.
-- Usuarios: Administrador, Supervisor, Recepcionista.
-- ============================================================================
CREATE OR REPLACE VIEW vw_historial_alquiler AS
SELECT
    -- Contrato
    a.id_alquiler,
    a.nro_contrato,
    a.estado::TEXT                          AS estado_alquiler,
    a.fecha_entrega,
    a.fecha_dev_prevista,
    a.fecha_dev_real,
    a.tarifa_diaria_aplicada,
    a.costo_total_final,
    -- Reserva de origen
    r.id_reserva,
    r.codigo_reserva,
    r.estado::TEXT                          AS estado_reserva,
    r.fecha_inicio                         AS reserva_fecha_inicio,
    r.fecha_fin                            AS reserva_fecha_fin,
    r.tarifa_diaria_pactada,
    r.total_estimado,
    -- Cliente titular
    r.id_cliente,
    pe.nombres || ' ' || pe.apellidos      AS cliente_nombre_completo,
    pe.nro_documento                       AS cliente_documento,
    cl.nro_licencia                        AS cliente_licencia,
    -- Vehículo
    a.id_vehiculo,
    v.placa,
    v.marca || ' ' || v.modelo             AS vehiculo_descripcion,
    c.nombre                               AS categoria,
    -- Sucursales
    sr.nombre                              AS sucursal_retiro,
    sd.nombre                              AS sucursal_devolucion,
    -- Empleados
    a.id_empleado_entrega,
    pe_ent.nombres || ' ' || pe_ent.apellidos AS empleado_entrega,
    a.id_empleado_devolucion,
    pe_dev.nombres || ' ' || pe_dev.apellidos AS empleado_devolucion,
    -- Inspección
    i.km_salida,
    i.km_retorno,
    i.combustible_salida::TEXT             AS combustible_salida,
    i.combustible_retorno::TEXT            AS combustible_retorno,
    i.danos_salida,
    i.danos_retorno,
    i.cargos_adicionales
FROM alquiler a
JOIN reserva             r     ON a.id_reserva              = r.id_reserva
JOIN cliente             cl    ON r.id_cliente               = cl.id_persona
JOIN persona             pe    ON cl.id_persona              = pe.id_persona
JOIN vehiculo            v     ON a.id_vehiculo              = v.id_vehiculo
JOIN categoria           c     ON v.id_categoria             = c.id_categoria
JOIN sucursal            sr    ON r.id_sucursal_retiro       = sr.id_sucursal
JOIN sucursal            sd    ON r.id_sucursal_devolucion   = sd.id_sucursal
JOIN persona             pe_ent ON a.id_empleado_entrega     = pe_ent.id_persona
LEFT JOIN persona        pe_dev ON a.id_empleado_devolucion  = pe_dev.id_persona
LEFT JOIN inspeccion     i      ON a.id_alquiler             = i.id_alquiler;


-- ============================================================================
-- VISTA 4: RESUMEN FINANCIERO POR ALQUILER
-- Propósito: Agregar las transacciones de pago por contrato, desglosando los
--            montos por tipo de transacción y exponiendo el balance de la
--            garantía (depósito vs. devolución/penalidad).
-- Usuarios: Administrador, Supervisor.
-- ============================================================================
CREATE OR REPLACE VIEW vw_resumen_financiero_alquiler AS
SELECT
    a.id_alquiler,
    a.nro_contrato,
    a.estado::TEXT                         AS estado_alquiler,
    -- Desglose por tipo de transacción (solo pagos aprobados)
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'ANTICIPO'            AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_anticipos,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'PAGO_ALQUILER'       AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_pago_alquiler,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'DEPOSITO_GARANTIA'   AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_deposito_garantia,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'DEVOLUCION_GARANTIA' AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_devolucion_garantia,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'PENALIDAD'           AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_penalidades,
    -- Ingreso neto = pagos de alquiler + penalidades (sin incluir garantías)
    COALESCE(SUM(CASE WHEN p.tipo_transaccion IN ('PAGO_ALQUILER', 'PENALIDAD') AND p.estado = 'APROBADO' THEN p.monto END), 0) AS ingreso_neto,
    -- Conteo de transacciones
    COUNT(CASE WHEN p.estado = 'APROBADO' THEN 1 END)   AS transacciones_aprobadas,
    COUNT(CASE WHEN p.estado = 'PENDIENTE' THEN 1 END)   AS transacciones_pendientes,
    COUNT(CASE WHEN p.estado = 'RECHAZADO' THEN 1 END)   AS transacciones_rechazadas
FROM alquiler a
LEFT JOIN pago p ON a.id_alquiler = p.id_alquiler
GROUP BY a.id_alquiler, a.nro_contrato, a.estado;


-- ============================================================================
-- VISTA 5: HISTORIAL DE MANTENIMIENTO CON DATOS DEL VEHÍCULO Y RESPONSABLE
-- Propósito: Unificar la información de las órdenes de mantenimiento con los
--            datos del vehículo intervenido y el empleado responsable, para
--            facilitar consultas de trazabilidad técnica de la flota.
-- Usuarios: Mecánico, Supervisor.
-- ============================================================================
CREATE OR REPLACE VIEW vw_historial_mantenimiento AS
SELECT
    m.id_mantenimiento,
    m.tipo::TEXT                            AS tipo_mantenimiento,
    m.estado::TEXT                          AS estado_mantenimiento,
    m.descripcion,
    m.taller,
    m.km_al_servicio,
    m.costo,
    m.fecha_inicio,
    m.fecha_fin,
    -- Vehículo
    v.id_vehiculo,
    v.placa,
    v.marca || ' ' || v.modelo             AS vehiculo_descripcion,
    c.nombre                               AS categoria,
    v.kilometraje_actual,
    -- Empleado responsable
    m.id_empleado,
    pe.nombres || ' ' || pe.apellidos      AS empleado_responsable,
    e.cargo::TEXT                           AS cargo_empleado,
    -- Sucursal del vehículo al momento de la consulta
    s.nombre                               AS sucursal_actual
FROM mantenimiento m
JOIN vehiculo    v   ON m.id_vehiculo   = v.id_vehiculo
JOIN categoria   c   ON v.id_categoria  = c.id_categoria
JOIN empleado    e   ON m.id_empleado   = e.id_persona
JOIN persona     pe  ON e.id_persona    = pe.id_persona
JOIN sucursal    s   ON v.id_sucursal_actual = s.id_sucursal;


-- ============================================================================
-- VISTA 6: PERFIL DE CLIENTE CON MÉTRICAS OPERATIVAS
-- Propósito: Consolidar la ficha de identidad de cada cliente con indicadores
--            clave de su actividad: total de reservas, alquileres, cancelaciones,
--            no-shows y monto total pagado. Permite identificar clientes
--            frecuentes y clientes de riesgo.
-- Usuarios: Administrador, Supervisor.
-- ============================================================================
CREATE OR REPLACE VIEW vw_perfil_cliente AS
SELECT
    cl.id_persona                          AS id_cliente,
    pe.tipo_documento::TEXT                AS tipo_documento,
    pe.nro_documento,
    pe.nombres,
    pe.apellidos,
    pe.nombres || ' ' || pe.apellidos      AS nombre_completo,
    pe.telefono,
    pe.email,
    pe.activo,
    cl.nro_licencia,
    cl.licencia_vencimiento,
    cl.pais_licencia,
    cl.direccion,
    cl.fecha_registro,
    -- Indicadores de actividad
    COUNT(DISTINCT r.id_reserva)                                                     AS total_reservas,
    COUNT(DISTINCT r.id_reserva) FILTER (WHERE r.estado = 'COMPLETADA')              AS reservas_completadas,
    COUNT(DISTINCT r.id_reserva) FILTER (WHERE r.estado = 'CANCELADA')               AS reservas_canceladas,
    COUNT(DISTINCT r.id_reserva) FILTER (WHERE r.estado = 'NO_SHOW')                 AS reservas_no_show,
    COUNT(DISTINCT a.id_alquiler)                                                    AS total_alquileres,
    COUNT(DISTINCT a.id_alquiler) FILTER (WHERE a.estado = 'FINALIZADO')             AS alquileres_finalizados,
    COUNT(DISTINCT a.id_alquiler) FILTER (WHERE a.estado IN ('EN_CURSO','ATRASADO')) AS alquileres_activos,
    -- Resumen financiero del cliente
    COALESCE(SUM(p.monto) FILTER (WHERE p.estado = 'APROBADO'
                AND p.tipo_transaccion IN ('PAGO_ALQUILER','ANTICIPO','PENALIDAD')), 0) AS monto_total_pagado
FROM cliente cl
JOIN persona pe ON cl.id_persona = pe.id_persona
LEFT JOIN reserva  r ON cl.id_persona = r.id_cliente
LEFT JOIN alquiler a ON r.id_reserva  = a.id_reserva
LEFT JOIN pago     p ON a.id_alquiler = p.id_alquiler
GROUP BY
    cl.id_persona, pe.tipo_documento, pe.nro_documento,
    pe.nombres, pe.apellidos, pe.telefono, pe.email, pe.activo,
    cl.nro_licencia, cl.licencia_vencimiento, cl.pais_licencia,
    cl.direccion, cl.fecha_registro;


-- ============================================================================
-- VISTA 7: ALQUILERES ATRASADOS Y EN DISPUTA (PANEL DE ALERTAS)
-- Propósito: Identificar contratos cuya devolución se encuentra vencida o en
--            conflicto, proporcionando los datos de contacto del titular y los
--            días de retraso para la gestión operativa inmediata.
-- Usuarios: Recepcionista, Supervisor.
-- ============================================================================
CREATE OR REPLACE VIEW vw_alquileres_pendientes AS
SELECT
    a.id_alquiler,
    a.nro_contrato,
    a.estado::TEXT                          AS estado_alquiler,
    a.fecha_entrega,
    a.fecha_dev_prevista,
    -- Días de retraso respecto a la fecha prevista
    GREATEST(0, EXTRACT(DAY FROM (CURRENT_TIMESTAMP - a.fecha_dev_prevista)))::INTEGER AS dias_retraso,
    -- Cliente titular
    pe.nombres || ' ' || pe.apellidos      AS cliente_nombre,
    pe.telefono                            AS cliente_telefono,
    pe.email                               AS cliente_email,
    -- Vehículo
    v.placa,
    v.marca || ' ' || v.modelo             AS vehiculo,
    c.nombre                               AS categoria,
    -- Sucursal de devolución pactada
    sd.nombre                              AS sucursal_devolucion
FROM alquiler a
JOIN reserva   r   ON a.id_reserva             = r.id_reserva
JOIN persona   pe  ON r.id_cliente             = pe.id_persona
JOIN vehiculo  v   ON a.id_vehiculo            = v.id_vehiculo
JOIN categoria c   ON v.id_categoria           = c.id_categoria
JOIN sucursal  sd  ON r.id_sucursal_devolucion = sd.id_sucursal
WHERE a.estado IN ('ATRASADO', 'EN_DISPUTA', 'EN_CURSO')
  AND a.fecha_dev_real IS NULL
  AND a.fecha_dev_prevista < CURRENT_TIMESTAMP;
