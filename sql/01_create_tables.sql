-- ============================================================================
-- PROYECTO OPENRENTAL - BASE DE DATOS I (UTEC)
-- Archivo: 01_create_tables.sql
-- Descripción: Creación de tipos enumerados (ENUM) y definición de las 12 tablas
--              principales del modelo relacional con sus claves primarias (PK),
--              tipos de datos nativos de PostgreSQL y valores por defecto.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. LIMPIEZA DE TABLAS Y TIPOS PREVIOS (ORDEN DE DEPENDENCIAS INVERSAS)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS mantenimiento CASCADE;
DROP TABLE IF EXISTS pago CASCADE;
DROP TABLE IF EXISTS conductor_adicional CASCADE;
DROP TABLE IF EXISTS inspeccion CASCADE;
DROP TABLE IF EXISTS alquiler CASCADE;
DROP TABLE IF EXISTS reserva CASCADE;
DROP TABLE IF EXISTS vehiculo CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS empleado CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS persona CASCADE;
DROP TABLE IF EXISTS sucursal CASCADE;

DROP TYPE IF EXISTS estado_mantenimiento_enum CASCADE;
DROP TYPE IF EXISTS tipo_mantenimiento_enum CASCADE;
DROP TYPE IF EXISTS estado_pago_enum CASCADE;
DROP TYPE IF EXISTS metodo_pago_enum CASCADE;
DROP TYPE IF EXISTS tipo_transaccion_pago_enum CASCADE;
DROP TYPE IF EXISTS parentesco_enum CASCADE;
DROP TYPE IF EXISTS combustible_nivel_enum CASCADE;
DROP TYPE IF EXISTS estado_alquiler_enum CASCADE;
DROP TYPE IF EXISTS estado_reserva_enum CASCADE;
DROP TYPE IF EXISTS estado_vehiculo_enum CASCADE;
DROP TYPE IF EXISTS combustible_enum CASCADE;
DROP TYPE IF EXISTS transmision_enum CASCADE;
DROP TYPE IF EXISTS cargo_empleado_enum CASCADE;
DROP TYPE IF EXISTS tipo_documento_enum CASCADE;

-- ----------------------------------------------------------------------------
-- 2. TIPOS ENUMERADOS (DOMINIOS CERRADOS DEL SISTEMA)
-- ----------------------------------------------------------------------------

-- Tipo de documento de identidad
CREATE TYPE tipo_documento_enum AS ENUM (
    'DNI',
    'PASAPORTE',
    'CARNET_EXTRANJERIA'
);

-- Cargos operativos y administrativos de empleados
CREATE TYPE cargo_empleado_enum AS ENUM (
    'RECEPCIONISTA',
    'MECANICO',
    'ADMINISTRADOR',
    'SUPERVISOR'
);

-- Tipo de transmisión vehicular
CREATE TYPE transmision_enum AS ENUM (
    'MECANICA',
    'AUTOMATICA'
);

-- Tipo de combustible / propulsión
CREATE TYPE combustible_enum AS ENUM (
    'GASOLINA',
    'DIESEL',
    'HIBRIDO',
    'ELECTRICO',
    'GLP'
);

-- Máquina de estados del vehículo
CREATE TYPE estado_vehiculo_enum AS ENUM (
    'DISPONIBLE',
    'RESERVADO',
    'ALQUILADO',
    'EN_MANTENIMIENTO',
    'FUERA_DE_SERVICIO'
);

-- Máquina de estados de la reserva
CREATE TYPE estado_reserva_enum AS ENUM (
    'PENDIENTE',
    'CONFIRMADA',
    'CANCELADA',
    'NO_SHOW',
    'COMPLETADA'
);

-- Máquina de estados del contrato de alquiler
CREATE TYPE estado_alquiler_enum AS ENUM (
    'EN_CURSO',
    'FINALIZADO',
    'ATRASADO',
    'EN_DISPUTA'
);

-- Nivel de combustible para las actas de inspección
CREATE TYPE combustible_nivel_enum AS ENUM (
    'VACIO',
    '1/4',
    '1/2',
    '3/4',
    'LLENO'
);

-- Parentesco / vínculo del conductor adicional con el titular
CREATE TYPE parentesco_enum AS ENUM (
    'CONYUGE',
    'FAMILIAR',
    'COLEGA',
    'OTRO'
);

-- Tipo de transacción financiera
CREATE TYPE tipo_transaccion_pago_enum AS ENUM (
    'ANTICIPO',
    'PAGO_ALQUILER',
    'DEPOSITO_GARANTIA',
    'DEVOLUCION_GARANTIA',
    'PENALIDAD'
);

-- Método de pago aceptado
CREATE TYPE metodo_pago_enum AS ENUM (
    'EFECTIVO',
    'TARJETA_CREDITO',
    'TARJETA_DEBITO',
    'TRANSFERENCIA'
);

-- Estado de la transacción de pago
CREATE TYPE estado_pago_enum AS ENUM (
    'APROBADO',
    'PENDIENTE',
    'RECHAZADO',
    'REEMBOLSADO'
);

-- Tipo de intervención mecánica
CREATE TYPE tipo_mantenimiento_enum AS ENUM (
    'PREVENTIVO',
    'CORRECTIVO',
    'INSPECCION_TECNICA'
);

-- Estado de la orden de mantenimiento
CREATE TYPE estado_mantenimiento_enum AS ENUM (
    'PROGRAMADO',
    'EN_TALLER',
    'COMPLETADO'
);

-- ----------------------------------------------------------------------------
-- 3. CREACIÓN DE TABLAS (ESTRUCTURA Y LLAVES PRIMARIAS)
-- ----------------------------------------------------------------------------

-- Tabla 1: SUCURSAL
-- Sedes físicas de la empresa desde las cuales se retiran y devuelven vehículos.
CREATE TABLE sucursal (
    id_sucursal         INTEGER GENERATED ALWAYS AS IDENTITY,
    nombre              VARCHAR(50)  NOT NULL,
    ciudad              VARCHAR(50)  NOT NULL,
    direccion           VARCHAR(150) NOT NULL,
    telefono            VARCHAR(20)  NULL,
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_sucursal PRIMARY KEY (id_sucursal)
);

-- Tabla 2: PERSONA (Supertipo)
-- Concentra los datos de identidad y contacto comunes a clientes y empleados.
CREATE TABLE persona (
    id_persona          INTEGER GENERATED ALWAYS AS IDENTITY,
    tipo_documento      tipo_documento_enum NOT NULL,
    nro_documento       VARCHAR(20)         NOT NULL,
    nombres             VARCHAR(60)         NOT NULL,
    apellidos           VARCHAR(60)         NOT NULL,
    telefono            VARCHAR(20)         NOT NULL,
    email               VARCHAR(100)        NOT NULL,
    activo              BOOLEAN             NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_persona PRIMARY KEY (id_persona)
);

-- Tabla 3: CLIENTE (Subtipo de Persona)
-- Requisitos legales para contratar el servicio y conducir vehículos.
CREATE TABLE cliente (
    id_persona          INTEGER      NOT NULL,
    nro_licencia        VARCHAR(20)  NOT NULL,
    licencia_vencimiento DATE        NOT NULL,
    pais_licencia       VARCHAR(50)  NOT NULL,
    direccion           VARCHAR(150) NOT NULL,
    fecha_registro      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cliente PRIMARY KEY (id_persona)
);

-- Tabla 4: EMPLEADO (Subtipo de Persona)
-- Personal operativo y administrativo que despacha, recibe y supervisa operaciones.
CREATE TABLE empleado (
    id_persona          INTEGER      NOT NULL,
    id_sucursal         INTEGER      NOT NULL,
    cargo               cargo_empleado_enum NOT NULL,
    usuario             VARCHAR(30)  NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    CONSTRAINT pk_empleado PRIMARY KEY (id_persona)
);

-- Tabla 5: CATEGORIA
-- Segmenta la flota por gama y fija la tarifa base diaria y fianza de referencia.
CREATE TABLE categoria (
    id_categoria        INTEGER GENERATED ALWAYS AS IDENTITY,
    nombre              VARCHAR(40)   NOT NULL,
    descripcion         TEXT          NULL,
    tarifa_base_diaria  NUMERIC(10,2) NOT NULL,
    monto_garantia_base NUMERIC(10,2) NOT NULL,
    CONSTRAINT pk_categoria PRIMARY KEY (id_categoria)
);

-- Tabla 6: VEHICULO
-- Unidades físicas de la flota con ficha técnica, ubicación y estado operativo.
CREATE TABLE vehiculo (
    id_vehiculo         INTEGER GENERATED ALWAYS AS IDENTITY,
    placa               VARCHAR(10)          NOT NULL,
    id_categoria        INTEGER              NOT NULL,
    id_sucursal_actual  INTEGER              NOT NULL,
    marca               VARCHAR(30)          NOT NULL,
    modelo              VARCHAR(30)          NOT NULL,
    anio                SMALLINT             NOT NULL,
    color               VARCHAR(20)          NOT NULL,
    transmision         transmision_enum     NOT NULL,
    combustible         combustible_enum     NOT NULL,
    capacidad_pasajeros SMALLINT             NOT NULL,
    kilometraje_actual  INTEGER              NOT NULL DEFAULT 0,
    tarifa_diaria       NUMERIC(10,2)        NULL,
    estado              estado_vehiculo_enum NOT NULL DEFAULT 'DISPONIBLE',
    activo              BOOLEAN              NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_vehiculo PRIMARY KEY (id_vehiculo)
);

-- Tabla 7: RESERVA
-- Intención previa de alquiler. Permite reservar por categoría antes de asignar placa.
CREATE TABLE reserva (
    id_reserva              INTEGER GENERATED ALWAYS AS IDENTITY,
    codigo_reserva          VARCHAR(12)          NOT NULL,
    id_cliente              INTEGER              NOT NULL,
    id_categoria            INTEGER              NOT NULL,
    id_vehiculo             INTEGER              NULL,
    id_sucursal_retiro      INTEGER              NOT NULL,
    id_sucursal_devolucion  INTEGER              NOT NULL,
    fecha_inicio            TIMESTAMP            NOT NULL,
    fecha_fin               TIMESTAMP            NOT NULL,
    tarifa_diaria_pactada   NUMERIC(10,2)        NOT NULL,
    total_estimado          NUMERIC(10,2)        NOT NULL,
    estado                  estado_reserva_enum  NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT pk_reserva PRIMARY KEY (id_reserva)
);

-- Tabla 8: ALQUILER
-- Contrato legal de tenencia física del vehículo en ejecución (1:1 con Reserva).
CREATE TABLE alquiler (
    id_alquiler             INTEGER GENERATED ALWAYS AS IDENTITY,
    nro_contrato            VARCHAR(20)          NOT NULL,
    id_reserva              INTEGER              NOT NULL,
    id_vehiculo             INTEGER              NOT NULL,
    id_empleado_entrega     INTEGER              NOT NULL,
    id_empleado_devolucion  INTEGER              NULL,
    fecha_entrega           TIMESTAMP            NOT NULL,
    fecha_dev_prevista      TIMESTAMP            NOT NULL,
    fecha_dev_real          TIMESTAMP            NULL,
    tarifa_diaria_aplicada  NUMERIC(10,2)        NOT NULL,
    costo_total_final       NUMERIC(10,2)        NULL,
    estado                  estado_alquiler_enum NOT NULL DEFAULT 'EN_CURSO',
    CONSTRAINT pk_alquiler PRIMARY KEY (id_alquiler)
);

-- Tabla 9: INSPECCION
-- Acta técnica de check-out y check-in del vehículo (1:1 con Alquiler).
CREATE TABLE inspeccion (
    id_inspeccion           INTEGER GENERATED ALWAYS AS IDENTITY,
    id_alquiler             INTEGER                NOT NULL,
    km_salida               INTEGER                NOT NULL,
    km_retorno              INTEGER                NULL,
    combustible_salida      combustible_nivel_enum NOT NULL,
    combustible_retorno     combustible_nivel_enum NULL,
    danos_salida            TEXT                   NULL,
    danos_retorno           TEXT                   NULL,
    cargos_adicionales      NUMERIC(10,2)          NOT NULL DEFAULT 0.00,
    CONSTRAINT pk_inspeccion PRIMARY KEY (id_inspeccion)
);

-- Tabla 10: CONDUCTOR_ADICIONAL
-- Relación intermedia M:N que autoriza a otros clientes a conducir el vehículo.
CREATE TABLE conductor_adicional (
    id_alquiler         INTEGER         NOT NULL,
    id_cliente          INTEGER         NOT NULL,
    parentesco          parentesco_enum NOT NULL,
    licencia_verificada BOOLEAN         NOT NULL DEFAULT FALSE,
    recargo             NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    fecha_registro      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_conductor_adicional PRIMARY KEY (id_alquiler, id_cliente)
);

-- Tabla 11: PAGO
-- Transacciones financieras vinculadas a anticipos, rentas, fianzas y penalidades.
CREATE TABLE pago (
    id_pago                 INTEGER GENERATED ALWAYS AS IDENTITY,
    id_alquiler             INTEGER                    NOT NULL,
    tipo_transaccion        tipo_transaccion_pago_enum NOT NULL,
    monto                   NUMERIC(10,2)              NOT NULL,
    metodo_pago             metodo_pago_enum           NOT NULL,
    referencia_operacion    VARCHAR(50)                NULL,
    fecha_pago              TIMESTAMP                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado                  estado_pago_enum           NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT pk_pago PRIMARY KEY (id_pago)
);

-- Tabla 12: MANTENIMIENTO
-- Órdenes de servicio preventivo, correctivo e inspecciones mecánicas por unidad.
CREATE TABLE mantenimiento (
    id_mantenimiento    INTEGER GENERATED ALWAYS AS IDENTITY,
    id_vehiculo         INTEGER                   NOT NULL,
    id_empleado         INTEGER                   NOT NULL,
    taller              VARCHAR(80)               NOT NULL,
    tipo                tipo_mantenimiento_enum   NOT NULL,
    descripcion         TEXT                      NOT NULL,
    km_al_servicio      INTEGER                   NOT NULL,
    costo               NUMERIC(10,2)             NOT NULL DEFAULT 0.00,
    fecha_inicio        DATE                      NOT NULL,
    fecha_fin           DATE                      NULL,
    estado              estado_mantenimiento_enum NOT NULL DEFAULT 'PROGRAMADO',
    CONSTRAINT pk_mantenimiento PRIMARY KEY (id_mantenimiento)
);
