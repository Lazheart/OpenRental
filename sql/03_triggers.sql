-- ============================================================================
-- PROYECTO OPENRENTAL - BASE DE DATOS I (UTEC)
-- Archivo: 03_triggers.sql
-- Descripción: Implementación de 10 disparadores (triggers) y sus funciones
--              asociadas en PL/pgSQL para garantizar las reglas de negocio,
--              máquinas de estado, integridad temporal y consistencia física.
-- ============================================================================

-- ============================================================================
-- TRIGGER 1: PREVENCIÓN DE DOBLE ASIGNACIÓN / SOLAPAMIENTO DE VEHÍCULO (ANTI DOUBLE-BOOKING)
-- Regla: Un vehículo no puede tener dos reservas confirmadas ni un alquiler en
--        curso/atrasado en intervalos de tiempo concurrentes.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_anti_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_conflicto_reserva  INTEGER;
    v_conflicto_alquiler INTEGER;
BEGIN
    -- Solo aplica si la reserva cuenta con un vehículo asignado y está confirmada
    IF NEW.id_vehiculo IS NOT NULL AND NEW.estado = 'CONFIRMADA' THEN
        -- 1. Verificar solapamiento con otra reserva confirmada
        SELECT id_reserva INTO v_conflicto_reserva
        FROM reserva
        WHERE id_vehiculo = NEW.id_vehiculo
          AND estado = 'CONFIRMADA'
          AND id_reserva <> COALESCE(NEW.id_reserva, -1)
          AND (NEW.fecha_inicio < fecha_fin AND NEW.fecha_fin > fecha_inicio)
        LIMIT 1;

        IF v_conflicto_reserva IS NOT NULL THEN
            RAISE EXCEPTION 'Conflicto de disponibilidad: El vehículo % ya cuenta con la reserva confirmada ID % en el intervalo solicitado.',
                NEW.id_vehiculo, v_conflicto_reserva;
        END IF;

        -- 2. Verificar solapamiento con un alquiler activo
        SELECT id_alquiler INTO v_conflicto_alquiler
        FROM alquiler
        WHERE id_vehiculo = NEW.id_vehiculo
          AND estado IN ('EN_CURSO', 'ATRASADO')
          AND (NEW.fecha_inicio < fecha_dev_prevista AND NEW.fecha_fin > fecha_entrega)
        LIMIT 1;

        IF v_conflicto_alquiler IS NOT NULL THEN
            RAISE EXCEPTION 'Conflicto de disponibilidad: El vehículo % se encuentra actualmente en el alquiler activo ID %.',
                NEW.id_vehiculo, v_conflicto_alquiler;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_anti_double_booking ON reserva;
CREATE TRIGGER trg_anti_double_booking
    BEFORE INSERT OR UPDATE OF id_vehiculo, fecha_inicio, fecha_fin, estado
    ON reserva
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_anti_double_booking();


-- ============================================================================
-- TRIGGER 2: ACTUALIZACIÓN AUTOMÁTICA DEL ODÓMETRO DE VEHÍCULO TRAS DEVOLUCIÓN
-- Regla: Al registrar el kilometraje de retorno en la inspección, se actualiza
--        de inmediato el odómetro actual del vehículo.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_actualizar_odometro_vehiculo()
RETURNS TRIGGER AS $$
DECLARE
    v_id_vehiculo INTEGER;
BEGIN
    -- Se dispara cuando se consigna o actualiza el kilometraje de retorno
    IF NEW.km_retorno IS NOT NULL AND (OLD.km_retorno IS NULL OR OLD.km_retorno <> NEW.km_retorno) THEN
        SELECT a.id_vehiculo INTO v_id_vehiculo
        FROM alquiler a
        WHERE a.id_alquiler = NEW.id_alquiler;

        IF v_id_vehiculo IS NOT NULL THEN
            UPDATE vehiculo
            SET kilometraje_actual = NEW.km_retorno
            WHERE id_vehiculo = v_id_vehiculo;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_odometro_vehiculo ON inspeccion;
CREATE TRIGGER trg_actualizar_odometro_vehiculo
    AFTER INSERT OR UPDATE OF km_retorno
    ON inspeccion
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_actualizar_odometro_vehiculo();


-- ============================================================================
-- TRIGGER 3: SINCRONIZACIÓN DE ESTADO DEL VEHÍCULO AL CREAR ALQUILER
-- Regla: Cuando se entrega el vehículo y se genera el contrato (Check-out),
--        el vehículo transiciona automáticamente al estado 'ALQUILADO'.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_sincronizar_vehiculo_alquiler()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'EN_CURSO' THEN
        UPDATE vehiculo
        SET estado = 'ALQUILADO'
        WHERE id_vehiculo = NEW.id_vehiculo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sincronizar_vehiculo_alquiler ON alquiler;
CREATE TRIGGER trg_sincronizar_vehiculo_alquiler
    AFTER INSERT
    ON alquiler
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_sincronizar_vehiculo_alquiler();


-- ============================================================================
-- TRIGGER 4: SINCRONIZACIÓN DE ESTADO Y UBICACIÓN TRAS INSPECCIÓN DE RETORNO
-- Regla: Si el Check-in reporta daños, el auto pasa a 'EN_MANTENIMIENTO'; si está
--        conforme, regresa a 'DISPONIBLE'. Además, se actualiza la sucursal actual.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_sincronizar_devolucion_vehiculo()
RETURNS TRIGGER AS $$
DECLARE
    v_id_vehiculo           INTEGER;
    v_id_sucursal_devolucion INTEGER;
    v_nuevo_estado          estado_vehiculo_enum;
BEGIN
    -- Validar si se está concretando el retorno del vehículo
    IF NEW.km_retorno IS NOT NULL AND (OLD.km_retorno IS NULL OR OLD.km_retorno <> NEW.km_retorno) THEN
        -- Obtener vehículo y sucursal de devolución pactada en la reserva
        SELECT a.id_vehiculo, r.id_sucursal_devolucion
        INTO v_id_vehiculo, v_id_sucursal_devolucion
        FROM alquiler a
        JOIN reserva r ON a.id_reserva = r.id_reserva
        WHERE a.id_alquiler = NEW.id_alquiler;

        -- Determinar estado según presencia de daños detectados
        IF NEW.danos_retorno IS NOT NULL AND LENGTH(TRIM(NEW.danos_retorno)) > 0 THEN
            v_nuevo_estado := 'EN_MANTENIMIENTO';
        ELSE
            v_nuevo_estado := 'DISPONIBLE';
        END IF;

        -- Actualizar estado y sede física del vehículo
        UPDATE vehiculo
        SET estado = v_nuevo_estado,
            id_sucursal_actual = COALESCE(v_id_sucursal_devolucion, id_sucursal_actual)
        WHERE id_vehiculo = v_id_vehiculo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sincronizar_devolucion_vehiculo ON inspeccion;
CREATE TRIGGER trg_sincronizar_devolucion_vehiculo
    AFTER UPDATE OF km_retorno, danos_retorno, combustible_retorno
    ON inspeccion
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_sincronizar_devolucion_vehiculo();


-- ============================================================================
-- TRIGGER 5: VALIDACIÓN DE LICENCIA VIGENTE DEL TITULAR AL REGISTRAR CONTRATO
-- Regla: No se puede generar un alquiler si la licencia del cliente está vencida
--        o vence antes de la fecha prevista de devolución.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_validar_licencia_titular()
RETURNS TRIGGER AS $$
DECLARE
    v_licencia_vencimiento DATE;
    v_id_cliente           INTEGER;
BEGIN
    SELECT r.id_cliente, c.licencia_vencimiento
    INTO v_id_cliente, v_licencia_vencimiento
    FROM reserva r
    JOIN cliente c ON r.id_cliente = c.id_persona
    WHERE r.id_reserva = NEW.id_reserva;

    IF v_licencia_vencimiento IS NULL THEN
        RAISE EXCEPTION 'No se encontró la ficha de cliente para la reserva ID %.', NEW.id_reserva;
    END IF;

    IF v_licencia_vencimiento < CURRENT_DATE THEN
        RAISE EXCEPTION 'Operación rechazada: La licencia de conducir del cliente titular (ID %) está vencida (Vencimiento: %).',
            v_id_cliente, v_licencia_vencimiento;
    END IF;

    IF v_licencia_vencimiento < NEW.fecha_dev_prevista::DATE THEN
        RAISE EXCEPTION 'Operación rechazada: La licencia del cliente titular vence el %, antes de la fecha prevista de devolución (%).',
            v_licencia_vencimiento, NEW.fecha_dev_prevista::DATE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_licencia_titular ON alquiler;
CREATE TRIGGER trg_validar_licencia_titular
    BEFORE INSERT OR UPDATE OF id_reserva, fecha_dev_prevista
    ON alquiler
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_validar_licencia_titular();


-- ============================================================================
-- TRIGGER 6: VALIDACIÓN DE CONDUCTORES ADICIONALES
-- Regla: El conductor adicional no puede ser el cliente titular y su licencia
--        debe estar vigente durante todo el período del contrato.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_validar_conductor_adicional()
RETURNS TRIGGER AS $$
DECLARE
    v_id_titular           INTEGER;
    v_fecha_dev_prevista   TIMESTAMP;
    v_licencia_vencimiento DATE;
BEGIN
    -- 1. Obtener cliente titular y fecha de retorno del contrato
    SELECT r.id_cliente, a.fecha_dev_prevista
    INTO v_id_titular, v_fecha_dev_prevista
    FROM alquiler a
    JOIN reserva r ON a.id_reserva = r.id_reserva
    WHERE a.id_alquiler = NEW.id_alquiler;

    -- Comprobar que no coincida con el titular
    IF NEW.id_cliente = v_id_titular THEN
        RAISE EXCEPTION 'Regla violada: El conductor adicional (ID %) no puede ser el mismo cliente titular del contrato.',
            NEW.id_cliente;
    END IF;

    -- 2. Validar vigencia de la licencia del conductor adicional
    SELECT c.licencia_vencimiento
    INTO v_licencia_vencimiento
    FROM cliente c
    WHERE c.id_persona = NEW.id_cliente;

    IF v_licencia_vencimiento IS NULL THEN
        RAISE EXCEPTION 'No se encontró registro de cliente o licencia para el conductor adicional ID %.', NEW.id_cliente;
    END IF;

    IF v_licencia_vencimiento < CURRENT_DATE OR v_licencia_vencimiento < v_fecha_dev_prevista::DATE THEN
        RAISE EXCEPTION 'Regla violada: La licencia del conductor adicional ID % está vencida o caduca antes del término del contrato (Vencimiento: %, Retorno previsto: %).',
            NEW.id_cliente, v_licencia_vencimiento, v_fecha_dev_prevista::DATE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_conductor_adicional ON conductor_adicional;
CREATE TRIGGER trg_validar_conductor_adicional
    BEFORE INSERT OR UPDATE OF id_alquiler, id_cliente
    ON conductor_adicional
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_validar_conductor_adicional();


-- ============================================================================
-- TRIGGER 7: VALIDACIÓN DE FINALIZACIÓN DE ALQUILER Y LIQUIDACIÓN DE FIANZA
-- Regla: El contrato no puede pasar a 'FINALIZADO' sin registrar la devolución real,
--        la inspección de retorno con odómetro y la devolución/penalidad de la fianza.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_validar_cierre_alquiler()
RETURNS TRIGGER AS $$
DECLARE
    v_km_retorno        INTEGER;
    v_garantia_liquidada INTEGER;
BEGIN
    IF NEW.estado = 'FINALIZADO' AND (OLD.estado IS NULL OR OLD.estado <> 'FINALIZADO') THEN
        -- 1. Verificar fecha real de devolución
        IF NEW.fecha_dev_real IS NULL THEN
            RAISE EXCEPTION 'Cierre incompleto: No se puede finalizar el contrato % sin registrar la fecha real de retorno.',
                NEW.nro_contrato;
        END IF;

        -- 2. Verificar inspección de retorno completa
        SELECT km_retorno INTO v_km_retorno
        FROM inspeccion
        WHERE id_alquiler = NEW.id_alquiler;

        IF v_km_retorno IS NULL THEN
            RAISE EXCEPTION 'Cierre incompleto: El contrato % no cuenta con la inspección de retorno (km_retorno) registrada.',
                NEW.nro_contrato;
        END IF;

        -- 3. Verificar liquidación del depósito de garantía
        SELECT COUNT(*) INTO v_garantia_liquidada
        FROM pago
        WHERE id_alquiler = NEW.id_alquiler
          AND tipo_transaccion IN ('DEVOLUCION_GARANTIA', 'PENALIDAD')
          AND estado = 'APROBADO';

        IF v_garantia_liquidada = 0 THEN
            RAISE EXCEPTION 'Cierre incompleto: El contrato % no registra la transacción de liquidación (DEVOLUCION_GARANTIA o PENALIDAD aprobada).',
                NEW.nro_contrato;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_cierre_alquiler ON alquiler;
CREATE TRIGGER trg_validar_cierre_alquiler
    BEFORE UPDATE OF estado
    ON alquiler
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_validar_cierre_alquiler();


-- ============================================================================
-- TRIGGER 8: CONGELAMIENTO AUTOMÁTICO DE TARIFA Y ESTIMACIÓN EN RESERVAS
-- Regla: Si no se especifica tarifa pactada o total estimado, se congela la
--        tarifa de la categoría/vehículo y se calculan los días automáticamente.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_snapshot_tarifa_reserva()
RETURNS TRIGGER AS $$
DECLARE
    v_tarifa_base NUMERIC(10,2);
    v_dias        NUMERIC;
BEGIN
    -- Calcular duración en días (fracciones de 24 horas redondeadas hacia arriba, mínimo 1)
    v_dias := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (NEW.fecha_fin - NEW.fecha_inicio)) / 86400.0));

    -- Obtener tarifa de referencia si no viene definida
    IF NEW.tarifa_diaria_pactada IS NULL OR NEW.tarifa_diaria_pactada <= 0 THEN
        IF NEW.id_vehiculo IS NOT NULL THEN
            SELECT COALESCE(v.tarifa_diaria, c.tarifa_base_diaria)
            INTO v_tarifa_base
            FROM vehiculo v
            JOIN categoria c ON v.id_categoria = c.id_categoria
            WHERE v.id_vehiculo = NEW.id_vehiculo;
        ELSE
            SELECT tarifa_base_diaria
            INTO v_tarifa_base
            FROM categoria
            WHERE id_categoria = NEW.id_categoria;
        END IF;

        NEW.tarifa_diaria_pactada := COALESCE(v_tarifa_base, 0.00);
    END IF;

    -- Calcular total estimado si no viene provisto
    IF NEW.total_estimado IS NULL OR NEW.total_estimado <= 0 THEN
        NEW.total_estimado := ROUND(NEW.tarifa_diaria_pactada * v_dias, 2);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_snapshot_tarifa_reserva ON reserva;
CREATE TRIGGER trg_snapshot_tarifa_reserva
    BEFORE INSERT
    ON reserva
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_snapshot_tarifa_reserva();


-- ============================================================================
-- TRIGGER 9: CONTROL Y SINCRONIZACIÓN DE MANTENIMIENTO VEHICULAR
-- Regla: Al programar o ingresar a taller, el auto pasa a 'EN_MANTENIMIENTO'.
--        Al completar la orden, regresa a 'DISPONIBLE' y se actualiza su odómetro.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_control_mantenimiento_vehiculo()
RETURNS TRIGGER AS $$
BEGIN
    -- Ingreso a taller o servicio programado
    IF NEW.estado IN ('PROGRAMADO', 'EN_TALLER') THEN
        UPDATE vehiculo
        SET estado = 'EN_MANTENIMIENTO'
        WHERE id_vehiculo = NEW.id_vehiculo;

    -- Alta de servicio técnico completado
    ELSIF NEW.estado = 'COMPLETADO' THEN
        UPDATE vehiculo
        SET estado = 'DISPONIBLE',
            kilometraje_actual = GREATEST(kilometraje_actual, NEW.km_al_servicio)
        WHERE id_vehiculo = NEW.id_vehiculo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_control_mantenimiento_vehiculo ON mantenimiento;
CREATE TRIGGER trg_control_mantenimiento_vehiculo
    AFTER INSERT OR UPDATE OF estado, km_al_servicio
    ON mantenimiento
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_control_mantenimiento_vehiculo();


-- ============================================================================
-- TRIGGER 10: ACTUALIZACIÓN DE ESTADO DE RESERVA AL CREAR CONTRATO DE ALQUILER
-- Regla: Cuando se entrega el vehículo y se genera el contrato físico (alquiler),
--        la reserva originaria transiciona de inmediato a 'COMPLETADA'.
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_trg_completar_reserva_por_alquiler()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reserva
    SET estado = 'COMPLETADA',
        id_vehiculo = COALESCE(id_vehiculo, NEW.id_vehiculo)
    WHERE id_reserva = NEW.id_reserva;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_completar_reserva_por_alquiler ON alquiler;
CREATE TRIGGER trg_completar_reserva_por_alquiler
    AFTER INSERT
    ON alquiler
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_completar_reserva_por_alquiler();
