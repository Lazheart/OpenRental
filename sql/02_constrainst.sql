-- ============================================================================
-- PROYECTO OPENRENTAL - BASE DE DATOS I (UTEC)
-- Archivo: 02_constrainst.sql
-- Descripción: Definición de restricciones de integridad referencial (FOREIGN KEY),
--              claves candidatas de unicidad (UNIQUE) y restricciones de dominio (CHECK)
--              conforme a las especificaciones y reglas semánticas del sistema.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLAVES FORÁNEAS (FOREIGN KEYS) - INTEGRIDAD REFERENCIAL
-- ----------------------------------------------------------------------------

-- Jerarquía de especialización: CLIENTE es subtipo de PERSONA
ALTER TABLE cliente
    ADD CONSTRAINT fk_cliente_persona
    FOREIGN KEY (id_persona) REFERENCES persona (id_persona)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Jerarquía de especialización: EMPLEADO es subtipo de PERSONA
ALTER TABLE empleado
    ADD CONSTRAINT fk_empleado_persona
    FOREIGN KEY (id_persona) REFERENCES persona (id_persona)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Asignación de empleado a su sucursal base
ALTER TABLE empleado
    ADD CONSTRAINT fk_empleado_sucursal
    FOREIGN KEY (id_sucursal) REFERENCES sucursal (id_sucursal)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relación Vehículo -> Categoría
ALTER TABLE vehiculo
    ADD CONSTRAINT fk_vehiculo_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relación Vehículo -> Sucursal donde se encuentra físicamente
ALTER TABLE vehiculo
    ADD CONSTRAINT fk_vehiculo_sucursal_actual
    FOREIGN KEY (id_sucursal_actual) REFERENCES sucursal (id_sucursal)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relaciones de RESERVA
ALTER TABLE reserva
    ADD CONSTRAINT fk_reserva_cliente
    FOREIGN KEY (id_cliente) REFERENCES cliente (id_persona)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE reserva
    ADD CONSTRAINT fk_reserva_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE reserva
    ADD CONSTRAINT fk_reserva_vehiculo
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculo (id_vehiculo)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE reserva
    ADD CONSTRAINT fk_reserva_sucursal_retiro
    FOREIGN KEY (id_sucursal_retiro) REFERENCES sucursal (id_sucursal)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE reserva
    ADD CONSTRAINT fk_reserva_sucursal_devolucion
    FOREIGN KEY (id_sucursal_devolucion) REFERENCES sucursal (id_sucursal)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relaciones de ALQUILER
ALTER TABLE alquiler
    ADD CONSTRAINT fk_alquiler_reserva
    FOREIGN KEY (id_reserva) REFERENCES reserva (id_reserva)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE alquiler
    ADD CONSTRAINT fk_alquiler_vehiculo
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculo (id_vehiculo)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE alquiler
    ADD CONSTRAINT fk_alquiler_empleado_entrega
    FOREIGN KEY (id_empleado_entrega) REFERENCES empleado (id_persona)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE alquiler
    ADD CONSTRAINT fk_alquiler_empleado_devolucion
    FOREIGN KEY (id_empleado_devolucion) REFERENCES empleado (id_persona)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Relación 1:1 de INSPECCION con ALQUILER
ALTER TABLE inspeccion
    ADD CONSTRAINT fk_inspeccion_alquiler
    FOREIGN KEY (id_alquiler) REFERENCES alquiler (id_alquiler)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relación M:N de CONDUCTOR_ADICIONAL (Alquiler <-> Cliente)
ALTER TABLE conductor_adicional
    ADD CONSTRAINT fk_conductor_adicional_alquiler
    FOREIGN KEY (id_alquiler) REFERENCES alquiler (id_alquiler)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE conductor_adicional
    ADD CONSTRAINT fk_conductor_adicional_cliente
    FOREIGN KEY (id_cliente) REFERENCES cliente (id_persona)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relación de PAGO con ALQUILER
ALTER TABLE pago
    ADD CONSTRAINT fk_pago_alquiler
    FOREIGN KEY (id_alquiler) REFERENCES alquiler (id_alquiler)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Relaciones de MANTENIMIENTO
ALTER TABLE mantenimiento
    ADD CONSTRAINT fk_mantenimiento_vehiculo
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculo (id_vehiculo)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE mantenimiento
    ADD CONSTRAINT fk_mantenimiento_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado (id_persona)
    ON DELETE RESTRICT ON UPDATE CASCADE;


-- ----------------------------------------------------------------------------
-- 2. RESTRICCIONES DE UNICIDAD (UNIQUE CONSTRAINTS / CLAVES CANDIDATAS)
-- ----------------------------------------------------------------------------

-- SUCURSAL: Nombre de sede único
ALTER TABLE sucursal
    ADD CONSTRAINT uq_sucursal_nombre
    UNIQUE (nombre);

-- PERSONA: Documento de identidad único por tipo y correo electrónico único
ALTER TABLE persona
    ADD CONSTRAINT uq_persona_tipo_nro_documento
    UNIQUE (tipo_documento, nro_documento);

ALTER TABLE persona
    ADD CONSTRAINT uq_persona_email
    UNIQUE (email);

-- CLIENTE: Licencia de conducir única
ALTER TABLE cliente
    ADD CONSTRAINT uq_cliente_nro_licencia
    UNIQUE (nro_licencia);

-- EMPLEADO: Usuario de login único
ALTER TABLE empleado
    ADD CONSTRAINT uq_empleado_usuario
    UNIQUE (usuario);

-- CATEGORIA: Denominación comercial única
ALTER TABLE categoria
    ADD CONSTRAINT uq_categoria_nombre
    UNIQUE (nombre);

-- VEHICULO: Placa de rodaje vehicular única
ALTER TABLE vehiculo
    ADD CONSTRAINT uq_vehiculo_placa
    UNIQUE (placa);

-- RESERVA: Código de reserva amigable único
ALTER TABLE reserva
    ADD CONSTRAINT uq_reserva_codigo_reserva
    UNIQUE (codigo_reserva);

-- ALQUILER: Folio legal único y relación 1:1 estricta con RESERVA
ALTER TABLE alquiler
    ADD CONSTRAINT uq_alquiler_nro_contrato
    UNIQUE (nro_contrato);

ALTER TABLE alquiler
    ADD CONSTRAINT uq_alquiler_reserva_1a1
    UNIQUE (id_reserva);

-- INSPECCION: Relación 1:1 estricta con ALQUILER
ALTER TABLE inspeccion
    ADD CONSTRAINT uq_inspeccion_alquiler_1a1
    UNIQUE (id_alquiler);


-- ----------------------------------------------------------------------------
-- 3. RESTRICCIONES DE DOMINIO Y REGLAS DE NEGOCIO (CHECK CONSTRAINTS)
-- ----------------------------------------------------------------------------

-- PERSONA: Validación de formato estándar de correo electrónico
ALTER TABLE persona
    ADD CONSTRAINT chk_persona_email_valido
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- CATEGORIA: Tarifas y fianzas mayores que cero
ALTER TABLE categoria
    ADD CONSTRAINT chk_categoria_tarifa_positiva
    CHECK (tarifa_base_diaria > 0);

ALTER TABLE categoria
    ADD CONSTRAINT chk_categoria_garantia_positiva
    CHECK (monto_garantia_base > 0);

-- VEHICULO: Placa sin espacios, año comercial coherente, capacidad, km y tarifa
ALTER TABLE vehiculo
    ADD CONSTRAINT chk_vehiculo_placa_sin_espacios
    CHECK (placa !~ '\s');

ALTER TABLE vehiculo
    ADD CONSTRAINT chk_vehiculo_anio_valido
    CHECK (anio >= 2010);

ALTER TABLE vehiculo
    ADD CONSTRAINT chk_vehiculo_capacidad_pasajeros
    CHECK (capacidad_pasajeros BETWEEN 2 AND 9);

ALTER TABLE vehiculo
    ADD CONSTRAINT chk_vehiculo_km_no_negativo
    CHECK (kilometraje_actual >= 0);

ALTER TABLE vehiculo
    ADD CONSTRAINT chk_vehiculo_tarifa_positiva
    CHECK (tarifa_diaria IS NULL OR tarifa_diaria > 0);

-- RESERVA: Fecha fin posterior a inicio, tarifa y total estimados no negativos
ALTER TABLE reserva
    ADD CONSTRAINT chk_reserva_rango_fechas
    CHECK (fecha_fin > fecha_inicio);

ALTER TABLE reserva
    ADD CONSTRAINT chk_reserva_tarifa_no_negativa
    CHECK (tarifa_diaria_pactada >= 0);

ALTER TABLE reserva
    ADD CONSTRAINT chk_reserva_total_estimado_no_negativo
    CHECK (total_estimado >= 0);

-- ALQUILER: Fechas de entrega y devolución válidas, tarifas y costos no negativos
ALTER TABLE alquiler
    ADD CONSTRAINT chk_alquiler_fecha_dev_prevista
    CHECK (fecha_dev_prevista >= fecha_entrega);

ALTER TABLE alquiler
    ADD CONSTRAINT chk_alquiler_fecha_dev_real
    CHECK (fecha_dev_real IS NULL OR fecha_dev_real >= fecha_entrega);

ALTER TABLE alquiler
    ADD CONSTRAINT chk_alquiler_tarifa_no_negativa
    CHECK (tarifa_diaria_aplicada >= 0);

ALTER TABLE alquiler
    ADD CONSTRAINT chk_alquiler_costo_final_no_negativo
    CHECK (costo_total_final IS NULL OR costo_total_final >= 0);

-- INSPECCION: Odómetro consistente (retorno >= salida) y cargos no negativos
ALTER TABLE inspeccion
    ADD CONSTRAINT chk_inspeccion_km_salida_no_negativo
    CHECK (km_salida >= 0);

ALTER TABLE inspeccion
    ADD CONSTRAINT chk_inspeccion_km_retorno_coherente
    CHECK (km_retorno IS NULL OR km_retorno >= km_salida);

ALTER TABLE inspeccion
    ADD CONSTRAINT chk_inspeccion_cargos_no_negativos
    CHECK (cargos_adicionales >= 0);

-- CONDUCTOR_ADICIONAL: Recargo diario no negativo
ALTER TABLE conductor_adicional
    ADD CONSTRAINT chk_conductor_recargo_no_negativo
    CHECK (recargo >= 0);

-- PAGO: Monto financiero estrictamente mayor a cero
ALTER TABLE pago
    ADD CONSTRAINT chk_pago_monto_positivo
    CHECK (monto > 0);

-- MANTENIMIENTO: Kilometraje, costos y coherencia cronológica de inicio y fin
ALTER TABLE mantenimiento
    ADD CONSTRAINT chk_mantenimiento_km_no_negativo
    CHECK (km_al_servicio >= 0);

ALTER TABLE mantenimiento
    ADD CONSTRAINT chk_mantenimiento_costo_no_negativo
    CHECK (costo >= 0);

ALTER TABLE mantenimiento
    ADD CONSTRAINT chk_mantenimiento_rango_fechas
    CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio);
