export interface SqlItem {
  id: string;
  name: string;
  viewOrType: "VISTA" | "QUERY_ESPECIFICA";
  target: string;
  roles: string[];
  purpose: string;
  sql: string;
}

export const SQL_DEFINITIONS: SqlItem[] = [
  {
    id: "vw_ficha_vehiculo",
    name: "Ficha Completa de Vehículo",
    viewOrType: "VISTA",
    target: "vw_ficha_vehiculo",
    roles: ["Recepcionista", "Administrador", "Supervisor"],
    purpose:
      "Proporciona una vista unificada de cada unidad de la flota con su categoría, sucursal actual, tarifa aplicable (resolviendo el COALESCE) y estado operativo.",
    sql: `CREATE OR REPLACE VIEW vw_ficha_vehiculo AS
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
JOIN sucursal  s ON v.id_sucursal_actual = s.id_sucursal;`,
  },
  {
    id: "vw_vehiculos_disponibles",
    name: "Disponibilidad Real de la Flota",
    viewOrType: "VISTA",
    target: "vw_vehiculos_disponibles",
    roles: ["Recepcionista"],
    purpose:
      "Expone únicamente los vehículos activos cuyo estado operativo es 'DISPONIBLE', listos para asignación inmediata a nuevas reservas.",
    sql: `CREATE OR REPLACE VIEW vw_vehiculos_disponibles AS
SELECT
    fv.*
FROM vw_ficha_vehiculo fv
WHERE fv.estado_vehiculo = 'DISPONIBLE'
  AND fv.vehiculo_activo = TRUE;`,
  },
  {
    id: "vw_historial_alquiler",
    name: "Historial Completo de Alquileres",
    viewOrType: "VISTA",
    target: "vw_historial_alquiler",
    roles: ["Administrador", "Supervisor", "Recepcionista"],
    purpose:
      "Consolida el ciclo de vida del alquiler: contrato, reserva origen, vehículo asignado, cliente titular, inspectores y empleados de entrega/devolución.",
    sql: `CREATE OR REPLACE VIEW vw_historial_alquiler AS
SELECT
    a.id_alquiler,
    a.nro_contrato,
    a.estado::TEXT                          AS estado_alquiler,
    a.fecha_entrega,
    a.fecha_dev_prevista,
    a.fecha_dev_real,
    a.tarifa_diaria_aplicada,
    a.costo_total_final,
    r.id_reserva,
    r.codigo_reserva,
    r.estado::TEXT                          AS estado_reserva,
    r.fecha_inicio                         AS reserva_fecha_inicio,
    r.fecha_fin                            AS reserva_fecha_fin,
    r.tarifa_diaria_pactada,
    r.total_estimado,
    r.id_cliente,
    pe.nombres || ' ' || pe.apellidos      AS cliente_nombre_completo,
    pe.nro_documento                       AS cliente_documento,
    cl.nro_licencia                        AS cliente_licencia,
    a.id_vehiculo,
    v.placa,
    v.marca || ' ' || v.modelo             AS vehiculo_descripcion,
    c.nombre                               AS categoria,
    sr.nombre                              AS sucursal_retiro,
    sd.nombre                              AS sucursal_devolucion,
    a.id_empleado_entrega,
    pe_ent.nombres || ' ' || pe_ent.apellidos AS empleado_entrega,
    a.id_empleado_devolucion,
    pe_dev.nombres || ' ' || pe_dev.apellidos AS empleado_devolucion,
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
LEFT JOIN inspeccion     i      ON a.id_alquiler             = i.id_alquiler;`,
  },
  {
    id: "vw_resumen_financiero_alquiler",
    name: "Resumen Financiero por Contrato",
    viewOrType: "VISTA",
    target: "vw_resumen_financiero_alquiler",
    roles: ["Administrador", "Supervisor"],
    purpose:
      "Agrega las transacciones por contrato, desglosando anticipos, alquiler, garantías, penalidades e ingreso neto.",
    sql: `CREATE OR REPLACE VIEW vw_resumen_financiero_alquiler AS
SELECT
    a.id_alquiler,
    a.nro_contrato,
    a.estado::TEXT                         AS estado_alquiler,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'ANTICIPO'            AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_anticipos,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'PAGO_ALQUILER'       AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_pago_alquiler,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'DEPOSITO_GARANTIA'   AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_deposito_garantia,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'DEVOLUCION_GARANTIA' AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_devolucion_garantia,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion = 'PENALIDAD'           AND p.estado = 'APROBADO' THEN p.monto END), 0) AS total_penalidades,
    COALESCE(SUM(CASE WHEN p.tipo_transaccion IN ('PAGO_ALQUILER', 'PENALIDAD') AND p.estado = 'APROBADO' THEN p.monto END), 0) AS ingreso_neto,
    COUNT(CASE WHEN p.estado = 'APROBADO' THEN 1 END)   AS transacciones_aprobadas,
    COUNT(CASE WHEN p.estado = 'PENDIENTE' THEN 1 END)   AS transacciones_pendientes,
    COUNT(CASE WHEN p.estado = 'RECHAZADO' THEN 1 END)   AS transacciones_rechazadas
FROM alquiler a
LEFT JOIN pago p ON a.id_alquiler = p.id_alquiler
GROUP BY a.id_alquiler, a.nro_contrato, a.estado;`,
  },
  {
    id: "vw_historial_mantenimiento",
    name: "Historial de Mantenimiento",
    viewOrType: "VISTA",
    target: "vw_historial_mantenimiento",
    roles: ["Mecánico", "Supervisor"],
    purpose:
      "Unifica órdenes técnicas de mantenimiento con la unidad intervenida, el mecánico responsable y la sucursal actual.",
    sql: `CREATE OR REPLACE VIEW vw_historial_mantenimiento AS
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
    v.id_vehiculo,
    v.placa,
    v.marca || ' ' || v.modelo             AS vehiculo_descripcion,
    c.nombre                               AS categoria,
    v.kilometraje_actual,
    m.id_empleado,
    pe.nombres || ' ' || pe.apellidos      AS empleado_responsable,
    e.cargo::TEXT                           AS cargo_empleado,
    s.nombre                               AS sucursal_actual
FROM mantenimiento m
JOIN vehiculo    v   ON m.id_vehiculo   = v.id_vehiculo
JOIN categoria   c   ON v.id_categoria  = c.id_categoria
JOIN empleado    e   ON m.id_empleado   = e.id_persona
JOIN persona     pe  ON e.id_persona    = pe.id_persona
JOIN sucursal    s   ON v.id_sucursal_actual = s.id_sucursal;`,
  },
  {
    id: "vw_perfil_cliente",
    name: "Perfil y Métricas de Cliente",
    viewOrType: "VISTA",
    target: "vw_perfil_cliente",
    roles: ["Administrador", "Supervisor"],
    purpose:
      "Consolida indicadores clave: total de reservas, completadas, canceladas, no-show, alquileres activos y facturación total acumulada.",
    sql: `CREATE OR REPLACE VIEW vw_perfil_cliente AS
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
    COUNT(DISTINCT r.id_reserva)                                                     AS total_reservas,
    COUNT(DISTINCT r.id_reserva) FILTER (WHERE r.estado = 'COMPLETADA')              AS reservas_completadas,
    COUNT(DISTINCT r.id_reserva) FILTER (WHERE r.estado = 'CANCELADA')               AS reservas_canceladas,
    COUNT(DISTINCT r.id_reserva) FILTER (WHERE r.estado = 'NO_SHOW')                 AS reservas_no_show,
    COUNT(DISTINCT a.id_alquiler)                                                    AS total_alquileres,
    COUNT(DISTINCT a.id_alquiler) FILTER (WHERE a.estado = 'FINALIZADO')             AS alquileres_finalizados,
    COUNT(DISTINCT a.id_alquiler) FILTER (WHERE a.estado IN ('EN_CURSO','ATRASADO')) AS alquileres_activos,
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
    cl.direccion, cl.fecha_registro;`,
  },
  {
    id: "vw_alquileres_pendientes",
    name: "Alquileres Atrasados y en Disputa",
    viewOrType: "VISTA",
    target: "vw_alquileres_pendientes",
    roles: ["Recepcionista", "Supervisor"],
    purpose:
      "Panel de alertas inmediatas: contratos con entrega demorada o disputa, días de mora y contacto de titular.",
    sql: `CREATE OR REPLACE VIEW vw_alquileres_pendientes AS
SELECT
    a.id_alquiler,
    a.nro_contrato,
    a.estado::TEXT                          AS estado_alquiler,
    a.fecha_entrega,
    a.fecha_dev_prevista,
    GREATEST(0, EXTRACT(DAY FROM (CURRENT_TIMESTAMP - a.fecha_dev_prevista)))::INTEGER AS dias_retraso,
    pe.nombres || ' ' || pe.apellidos      AS cliente_nombre,
    pe.telefono                            AS cliente_telefono,
    pe.email                               AS cliente_email,
    v.placa,
    v.marca || ' ' || v.modelo             AS vehiculo,
    c.nombre                               AS categoria,
    sd.nombre                              AS sucursal_devolucion
FROM alquiler a
JOIN reserva   r   ON a.id_reserva             = r.id_reserva
JOIN persona   pe  ON r.id_cliente             = pe.id_persona
JOIN vehiculo  v   ON a.id_vehiculo            = v.id_vehiculo
JOIN categoria c   ON v.id_categoria           = c.id_categoria
JOIN sucursal  sd  ON r.id_sucursal_devolucion = sd.id_sucursal
WHERE a.estado IN ('ATRASADO', 'EN_DISPUTA', 'EN_CURSO')
  AND a.fecha_dev_real IS NULL
  AND a.fecha_dev_prevista < CURRENT_TIMESTAMP;`,
  },
  {
    id: "query_disponibilidad_anti_solapamiento",
    name: "Consulta 1: Disponibilidad Anti-Solapamiento",
    viewOrType: "QUERY_ESPECIFICA",
    target: "sql/07_queries.sql",
    roles: ["Recepcionista"],
    purpose:
      "Verificación precisa de unidades disponibles excluyendo solapamientos en reservas confirmadas o contratos en curso en un rango de fechas.",
    sql: `SELECT
    v.id_vehiculo,
    v.placa,
    v.marca,
    v.modelo,
    v.anio,
    v.color,
    v.transmision::TEXT                                  AS transmision,
    v.combustible::TEXT                                  AS combustible,
    v.capacidad_pasajeros,
    v.kilometraje_actual,
    COALESCE(v.tarifa_diaria, c.tarifa_base_diaria)      AS tarifa_aplicable,
    c.nombre                                             AS categoria,
    s.nombre                                             AS sucursal
FROM vehiculo v
JOIN categoria c ON v.id_categoria     = c.id_categoria
JOIN sucursal  s ON v.id_sucursal_actual = s.id_sucursal
WHERE v.id_categoria      = $1
  AND v.id_sucursal_actual = $2
  AND v.estado             = 'DISPONIBLE'
  AND v.activo             = TRUE
  AND NOT EXISTS (
      SELECT 1 FROM reserva r
      WHERE r.id_vehiculo = v.id_vehiculo
        AND r.estado      = 'CONFIRMADA'
        AND r.fecha_inicio < $4
        AND r.fecha_fin    > $3
  )
  AND NOT EXISTS (
      SELECT 1 FROM alquiler a
      WHERE a.id_vehiculo = v.id_vehiculo
        AND a.estado      IN ('EN_CURSO', 'ATRASADO')
        AND a.fecha_entrega     < $4
        AND a.fecha_dev_prevista > $3
  )
ORDER BY tarifa_aplicable ASC, v.kilometraje_actual ASC;`,
  },
  {
    id: "query_utilizacion_ingresos_mes",
    name: "Consulta 2: Utilización e Ingresos por Categoría y Mes",
    viewOrType: "QUERY_ESPECIFICA",
    target: "sql/07_queries.sql",
    roles: ["Administrador"],
    purpose:
      "Agregación mensual por categoría con volumen de contratos, días acumulados, ticket promedio y ranking de ingresos con función de ventana RANK().",
    sql: `WITH ingresos_por_contrato AS (
    SELECT p.id_alquiler, SUM(p.monto) AS ingreso
    FROM pago p
    WHERE p.tipo_transaccion IN ('PAGO_ALQUILER', 'PENALIDAD')
      AND p.estado = 'APROBADO'
    GROUP BY p.id_alquiler
)
SELECT
    DATE_TRUNC('month', a.fecha_entrega)::DATE AS mes,
    c.id_categoria,
    c.nombre AS categoria,
    COUNT(DISTINCT a.id_alquiler) AS total_contratos,
    SUM(GREATEST(1, CEIL(EXTRACT(EPOCH FROM (COALESCE(a.fecha_dev_real, a.fecha_dev_prevista) - a.fecha_entrega)) / 86400.0)))::INTEGER AS dias_alquilados,
    COALESCE(SUM(ipc.ingreso), 0) AS ingreso_total,
    ROUND(COALESCE(SUM(ipc.ingreso), 0) / NULLIF(COUNT(DISTINCT a.id_alquiler), 0), 2) AS ticket_promedio,
    RANK() OVER (
        PARTITION BY DATE_TRUNC('month', a.fecha_entrega)
        ORDER BY COALESCE(SUM(ipc.ingreso), 0) DESC
    ) AS ranking_ingreso_mes
FROM alquiler a
JOIN vehiculo v ON a.id_vehiculo = v.id_vehiculo
JOIN categoria c ON v.id_categoria = c.id_categoria
LEFT JOIN ingresos_por_contrato ipc ON a.id_alquiler = ipc.id_alquiler
GROUP BY DATE_TRUNC('month', a.fecha_entrega), c.id_categoria, c.nombre
ORDER BY mes DESC, ingreso_total DESC;`,
  },
  {
    id: "query_clientes_siniestralidad",
    name: "Consulta 3: Clientes con Siniestralidad Superior al Promedio",
    viewOrType: "QUERY_ESPECIFICA",
    target: "sql/07_queries.sql",
    roles: ["Administrador", "Supervisor"],
    purpose:
      "Detecta clientes con cargos de inspección + penalidades superiores al promedio general mediante subconsulta correlacionada en cláusula HAVING.",
    sql: `SELECT
    cl.id_persona AS id_cliente,
    pe.nombres || ' ' || pe.apellidos AS nombre_completo,
    pe.nro_documento,
    pe.email,
    cl.nro_licencia,
    COUNT(DISTINCT a.id_alquiler) AS total_contratos,
    COUNT(DISTINCT a.id_alquiler) FILTER (WHERE a.fecha_dev_real > a.fecha_dev_prevista) AS devoluciones_tardias,
    COUNT(DISTINCT r.id_reserva) FILTER (WHERE r.estado = 'NO_SHOW') AS reservas_no_show,
    COALESCE(SUM(DISTINCT i.cargos_adicionales), 0) AS total_cargos_inspeccion,
    COALESCE(SUM(p.monto) FILTER (WHERE p.tipo_transaccion = 'PENALIDAD' AND p.estado = 'APROBADO'), 0) AS total_penalidades,
    COALESCE(SUM(DISTINCT i.cargos_adicionales), 0) +
    COALESCE(SUM(p.monto) FILTER (WHERE p.tipo_transaccion = 'PENALIDAD' AND p.estado = 'APROBADO'), 0) AS siniestralidad_total
FROM cliente cl
JOIN persona pe ON cl.id_persona = pe.id_persona
LEFT JOIN reserva r ON cl.id_persona = r.id_cliente
LEFT JOIN alquiler a ON r.id_reserva = a.id_reserva
LEFT JOIN inspeccion i ON a.id_alquiler = i.id_alquiler
LEFT JOIN pago p ON a.id_alquiler = p.id_alquiler
GROUP BY cl.id_persona, pe.nombres, pe.apellidos, pe.nro_documento, pe.email, cl.nro_licencia
HAVING (
    COALESCE(SUM(DISTINCT i.cargos_adicionales), 0) +
    COALESCE(SUM(p.monto) FILTER (WHERE p.tipo_transaccion = 'PENALIDAD' AND p.estado = 'APROBADO'), 0)
) > (
    SELECT COALESCE(AVG(siniestro_cliente), 0)
    FROM (
        SELECT cl2.id_persona,
               COALESCE(SUM(DISTINCT i2.cargos_adicionales), 0) +
               COALESCE(SUM(p2.monto) FILTER (WHERE p2.tipo_transaccion = 'PENALIDAD' AND p2.estado = 'APROBADO'), 0) AS siniestro_cliente
        FROM cliente cl2
        LEFT JOIN reserva r2 ON cl2.id_persona = r2.id_cliente
        LEFT JOIN alquiler a2 ON r2.id_reserva = a2.id_reserva
        LEFT JOIN inspeccion i2 ON a2.id_alquiler = i2.id_alquiler
        LEFT JOIN pago p2 ON a2.id_alquiler = p2.id_alquiler
        GROUP BY cl2.id_persona
    ) sub
)
ORDER BY siniestralidad_total DESC;`,
  },
  {
    id: "query_rentabilidad_unidad",
    name: "Consulta 4: Rentabilidad por Unidad de Flota",
    viewOrType: "QUERY_ESPECIFICA",
    target: "Proyecto_Base_de_Datos.md (Cap. 3.5)",
    roles: ["Supervisor"],
    purpose:
      "Calcula margen neto acumulado por vehículo: ingresos por alquiler menos costos de mantenimiento completado, con ranking interno en la categoría.",
    sql: `WITH ingresos AS (
    SELECT a.id_vehiculo, COALESCE(SUM(p.monto), 0) AS total_ingresos
    FROM alquiler a
    JOIN pago p ON a.id_alquiler = p.id_alquiler
    WHERE p.tipo_transaccion = 'PAGO_ALQUILER' AND p.estado = 'APROBADO'
    GROUP BY a.id_vehiculo
),
costos AS (
    SELECT m.id_vehiculo, COALESCE(SUM(m.costo), 0) AS total_costos
    FROM mantenimiento m
    WHERE m.estado = 'COMPLETADO'
    GROUP BY m.id_vehiculo
)
SELECT
    v.id_vehiculo,
    v.placa,
    v.marca || ' ' || v.modelo AS vehiculo_descripcion,
    c.nombre AS categoria,
    COALESCE(i.total_ingresos, 0) AS ingresos_totales,
    COALESCE(co.total_costos, 0) AS costos_mantenimiento,
    (COALESCE(i.total_ingresos, 0) - COALESCE(co.total_costos, 0)) AS margen_neto,
    RANK() OVER (PARTITION BY v.id_categoria ORDER BY (COALESCE(i.total_ingresos, 0) - COALESCE(co.total_costos, 0)) DESC) AS ranking_categoria
FROM vehiculo v
JOIN categoria c ON v.id_categoria = c.id_categoria
LEFT JOIN ingresos i ON v.id_vehiculo = i.id_vehiculo
LEFT JOIN costos co ON v.id_vehiculo = co.id_vehiculo
ORDER BY margen_neto DESC;`,
  },
  {
    id: "query_auditoria_incompletos",
    name: "Consulta 5: Auditoría de Contratos Cerrados Incompletos",
    viewOrType: "QUERY_ESPECIFICA",
    target: "Proyecto_Base_de_Datos.md (Cap. 3.5)",
    roles: ["Supervisor"],
    purpose:
      "Detecta contratos con estado 'FINALIZADO' que carecen de registro de inspección de retorno (km_retorno nulo) o sin resolución de garantía.",
    sql: `SELECT
    a.id_alquiler,
    a.nro_contrato,
    pe.nombres || ' ' || pe.apellidos AS cliente,
    v.placa,
    a.fecha_entrega,
    a.fecha_dev_real,
    CASE
        WHEN i.km_retorno IS NULL THEN 'Falta registro de kilometraje retorno en inspección'
        WHEN NOT EXISTS (
            SELECT 1 FROM pago p
            WHERE p.id_alquiler = a.id_alquiler
              AND p.tipo_transaccion IN ('DEVOLUCION_GARANTIA', 'PENALIDAD')
              AND p.estado = 'APROBADO'
        ) THEN 'Depósito de garantía no liquidado (sin devolución ni penalidad)'
        ELSE 'Inconsistencia no especificada'
    END AS motivo_inconsistencia
FROM alquiler a
JOIN reserva r ON a.id_reserva = r.id_reserva
JOIN cliente cl ON r.id_cliente = cl.id_persona
JOIN persona pe ON cl.id_persona = pe.id_persona
JOIN vehiculo v ON a.id_vehiculo = v.id_vehiculo
LEFT JOIN inspeccion i ON a.id_alquiler = i.id_alquiler
WHERE a.estado = 'FINALIZADO'
  AND (
      i.km_retorno IS NULL
      OR NOT EXISTS (
          SELECT 1 FROM pago p
          WHERE p.id_alquiler = a.id_alquiler
            AND p.tipo_transaccion IN ('DEVOLUCION_GARANTIA', 'PENALIDAD')
            AND p.estado = 'APROBADO'
      )
  )
ORDER BY a.fecha_dev_real DESC NULLS LAST;`,
  },
];

