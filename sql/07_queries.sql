-- ============================================================================
-- PROYECTO OPENRENTAL - BASE DE DATOS I (UTEC)
-- Archivo: 07_queries.sql
-- Descripción: Tres consultas relevantes para la operación y análisis del
--              sistema OpenRental. Cada consulta está diseñada para resolver
--              una pregunta concreta de negocio, involucra múltiples relaciones
--              y utiliza técnicas intermedias de SQL (JOINs, subconsultas,
--              funciones de ventana, agregaciones condicionales y CTEs).
-- ============================================================================


-- ============================================================================
-- CONSULTA 1: DISPONIBILIDAD REAL DE LA FLOTA (CON ANTI-SOLAPAMIENTO)
-- ============================================================================
-- Usuario:     Recepcionista.
-- Pregunta:    ¿Qué vehículos de una categoría determinada puede ofrecer una
--              sucursal para el período que solicita el cliente?
-- Resultado:   Listado de unidades disponibles con placa, modelo, tarifa
--              aplicable, excluyendo aquellas con reserva confirmada o alquiler
--              activo que se solape con el intervalo solicitado.
-- Relaciones:  Vehiculo, Categoria, Sucursal, Reserva, Alquiler.
-- Técnicas:    JOINs, NOT EXISTS (anti-unión), COALESCE, filtros compuestos.
-- ============================================================================

-- Parámetros de ejemplo:
--   Categoría buscada:      id_categoria = 3 (ej: SUV)
--   Sucursal de retiro:     id_sucursal  = 1 (ej: Lima Centro)
--   Período solicitado:     2026-11-01 09:00  →  2026-11-05 09:00

SELECT
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
WHERE v.id_categoria      = 3                                       -- Filtro por categoría
  AND v.id_sucursal_actual = 1                                      -- Filtro por sucursal
  AND v.estado             = 'DISPONIBLE'                           -- Solo unidades operativas
  AND v.activo             = TRUE                                   -- Solo unidades activas
  -- Anti-unión 1: Excluir vehículos con reserva confirmada solapada
  AND NOT EXISTS (
      SELECT 1
      FROM reserva r
      WHERE r.id_vehiculo = v.id_vehiculo
        AND r.estado      = 'CONFIRMADA'
        AND r.fecha_inicio < TIMESTAMP '2026-11-05 09:00:00'        -- Solapamiento: inicio_reserva < fin_solicitado
        AND r.fecha_fin    > TIMESTAMP '2026-11-01 09:00:00'        --               fin_reserva    > inicio_solicitado
  )
  -- Anti-unión 2: Excluir vehículos con alquiler activo solapado
  AND NOT EXISTS (
      SELECT 1
      FROM alquiler a
      WHERE a.id_vehiculo = v.id_vehiculo
        AND a.estado      IN ('EN_CURSO', 'ATRASADO')
        AND a.fecha_entrega     < TIMESTAMP '2026-11-05 09:00:00'
        AND a.fecha_dev_prevista > TIMESTAMP '2026-11-01 09:00:00'
  )
ORDER BY tarifa_aplicable ASC, v.kilometraje_actual ASC;


-- ============================================================================
-- CONSULTA 2: UTILIZACIÓN E INGRESOS DE LA FLOTA POR CATEGORÍA Y MES
-- ============================================================================
-- Usuario:     Administrador de la empresa.
-- Pregunta:    ¿Cuál fue el rendimiento de cada categoría de vehículos
--              mes a mes durante un período determinado?
-- Resultado:   Cuadro agrupado por mes y categoría con número de contratos,
--              días alquilados, ingreso total, ticket promedio y ranking
--              de ingreso por mes.
-- Relaciones:  Alquiler, Vehiculo, Categoria, Pago.
-- Técnicas:    JOINs, agregación con GROUP BY, CASE + SUM condicional,
--              funciones de fecha (DATE_TRUNC, EXTRACT), RANK() OVER
--              (función de ventana), CTE.
-- ============================================================================

WITH ingresos_por_contrato AS (
    -- Pre-agregar los pagos aprobados de tipo ingreso por contrato
    SELECT
        p.id_alquiler,
        SUM(p.monto) AS ingreso
    FROM pago p
    WHERE p.tipo_transaccion IN ('PAGO_ALQUILER', 'PENALIDAD')
      AND p.estado = 'APROBADO'
    GROUP BY p.id_alquiler
)
SELECT
    DATE_TRUNC('month', a.fecha_entrega)::DATE                     AS mes,
    c.id_categoria,
    c.nombre                                                       AS categoria,
    -- Métricas operativas
    COUNT(DISTINCT a.id_alquiler)                                  AS total_contratos,
    SUM(
        GREATEST(1, CEIL(
            EXTRACT(EPOCH FROM (
                COALESCE(a.fecha_dev_real, a.fecha_dev_prevista) - a.fecha_entrega
            )) / 86400.0
        ))
    )::INTEGER                                                     AS dias_alquilados,
    -- Métricas financieras
    COALESCE(SUM(ipc.ingreso), 0)                                  AS ingreso_total,
    ROUND(
        COALESCE(SUM(ipc.ingreso), 0) /
        NULLIF(COUNT(DISTINCT a.id_alquiler), 0), 2
    )                                                              AS ticket_promedio,
    -- Ranking: categoría con mayor ingreso dentro de cada mes
    RANK() OVER (
        PARTITION BY DATE_TRUNC('month', a.fecha_entrega)
        ORDER BY COALESCE(SUM(ipc.ingreso), 0) DESC
    )                                                              AS ranking_ingreso_mes
FROM alquiler a
JOIN vehiculo           v   ON a.id_vehiculo = v.id_vehiculo
JOIN categoria          c   ON v.id_categoria = c.id_categoria
LEFT JOIN ingresos_por_contrato ipc ON a.id_alquiler = ipc.id_alquiler
GROUP BY
    DATE_TRUNC('month', a.fecha_entrega),
    c.id_categoria,
    c.nombre
ORDER BY mes DESC, ingreso_total DESC;


-- ============================================================================
-- CONSULTA 3: CLIENTES CON SINIESTRALIDAD SUPERIOR AL PROMEDIO
-- ============================================================================
-- Usuario:     Administrador de la empresa.
-- Pregunta:    ¿Qué clientes acumulan cargos adicionales y penalidades por
--              encima del promedio general? ¿Cuál es su historial de
--              devoluciones tardías y reservas no presentadas?
-- Resultado:   Clientes cuyo monto acumulado de cargos (inspección) +
--              penalidades supera el promedio del conjunto, con número de
--              contratos, devoluciones tardías y no-shows.
-- Relaciones:  Cliente, Persona, Reserva, Alquiler, Inspeccion, Pago.
-- Técnicas:    JOINs de 6 relaciones, agregación condicional con FILTER,
--              subconsulta correlacionada (HAVING con subconsulta escalar),
--              COALESCE, CASE WHEN, GROUP BY + HAVING.
-- ============================================================================

SELECT
    cl.id_persona                                                   AS id_cliente,
    pe.nombres || ' ' || pe.apellidos                               AS nombre_completo,
    pe.nro_documento,
    pe.email,
    cl.nro_licencia,
    -- Indicadores operativos
    COUNT(DISTINCT a.id_alquiler)                                   AS total_contratos,
    -- Devoluciones tardías: contratos donde la devolución real superó la prevista
    COUNT(DISTINCT a.id_alquiler) FILTER (
        WHERE a.fecha_dev_real IS NOT NULL
          AND a.fecha_dev_real > a.fecha_dev_prevista
    )                                                               AS devoluciones_tardias,
    -- Reservas no presentadas (NO_SHOW)
    COUNT(DISTINCT r.id_reserva) FILTER (
        WHERE r.estado = 'NO_SHOW'
    )                                                               AS reservas_no_show,
    -- Monto acumulado: cargos adicionales de inspección
    COALESCE(SUM(DISTINCT i.cargos_adicionales), 0)                 AS total_cargos_inspeccion,
    -- Monto acumulado: penalidades aprobadas
    COALESCE(
        SUM(p.monto) FILTER (
            WHERE p.tipo_transaccion = 'PENALIDAD'
              AND p.estado = 'APROBADO'
        ), 0
    )                                                               AS total_penalidades,
    -- Siniestralidad total = cargos de inspección + penalidades
    COALESCE(SUM(DISTINCT i.cargos_adicionales), 0)
        + COALESCE(SUM(p.monto) FILTER (
            WHERE p.tipo_transaccion = 'PENALIDAD'
              AND p.estado = 'APROBADO'
        ), 0)                                                       AS siniestralidad_total
FROM cliente cl
JOIN persona            pe ON cl.id_persona  = pe.id_persona
LEFT JOIN reserva       r  ON cl.id_persona  = r.id_cliente
LEFT JOIN alquiler      a  ON r.id_reserva   = a.id_reserva
LEFT JOIN inspeccion    i  ON a.id_alquiler  = i.id_alquiler
LEFT JOIN pago          p  ON a.id_alquiler  = p.id_alquiler
GROUP BY
    cl.id_persona, pe.nombres, pe.apellidos, pe.nro_documento,
    pe.email, cl.nro_licencia
-- Filtrar solo clientes cuya siniestralidad supera el promedio general
HAVING
    (
        COALESCE(SUM(DISTINCT i.cargos_adicionales), 0)
        + COALESCE(SUM(p.monto) FILTER (
            WHERE p.tipo_transaccion = 'PENALIDAD'
              AND p.estado = 'APROBADO'
        ), 0)
    ) > (
        -- Subconsulta escalar: promedio general de siniestralidad por cliente
        SELECT COALESCE(AVG(siniestro_cliente), 0)
        FROM (
            SELECT
                cl2.id_persona,
                COALESCE(SUM(DISTINCT i2.cargos_adicionales), 0)
                    + COALESCE(SUM(p2.monto) FILTER (
                        WHERE p2.tipo_transaccion = 'PENALIDAD'
                          AND p2.estado = 'APROBADO'
                    ), 0) AS siniestro_cliente
            FROM cliente cl2
            LEFT JOIN reserva   r2 ON cl2.id_persona = r2.id_cliente
            LEFT JOIN alquiler  a2 ON r2.id_reserva  = a2.id_reserva
            LEFT JOIN inspeccion i2 ON a2.id_alquiler = i2.id_alquiler
            LEFT JOIN pago      p2 ON a2.id_alquiler = p2.id_alquiler
            GROUP BY cl2.id_persona
        ) sub
    )
ORDER BY siniestralidad_total DESC;
