-- ============================================================================
-- PROYECTO OPENRENTAL - BASE DE DATOS I (UTEC)
-- Archivo: 06_seed_data.sql
-- Descripción: Dataset sintético mínimo, coherente y representativo para poblar
--              la base de datos en Supabase / PostgreSQL.
--              Cubre las 12 tablas del modelo relacional cumpliendo todas las
--              restricciones de integridad (FK, UNIQUE, CHECK), disparadores
--              (TRIGGERS) y casos de negocio para alimentar las 7 vistas y las
--              3 consultas analíticas complejas.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 0. LIMPIEZA PREVIA (IDEMPOTENCIA)
-- ----------------------------------------------------------------------------
TRUNCATE TABLE
    mantenimiento,
    pago,
    conductor_adicional,
    inspeccion,
    alquiler,
    reserva,
    vehiculo,
    categoria,
    empleado,
    cliente,
    persona,
    sucursal
RESTART IDENTITY CASCADE;

-- ----------------------------------------------------------------------------
-- 1. SUCURSAL (Sedes físicas)
-- ----------------------------------------------------------------------------
INSERT INTO sucursal (id_sucursal, nombre, ciudad, direccion, telefono, activo)
OVERRIDING SYSTEM VALUE VALUES
(1, 'Sede Central Lima Centro', 'Lima',     'Av. Javier Prado Este 1050, La Victoria', '+51 1 421 8000', TRUE),
(2, 'Sede Miraflores',          'Lima',     'Av. Jose Larco 850, Miraflores',           '+51 1 242 5500', TRUE),
(3, 'Sede Aeropuerto Callao',    'Lima',     'Av. Elmer Faucett s/n, Callao',            '+51 1 517 3500', TRUE),
(4, 'Sede Arequipa Cayma',       'Arequipa', 'Av. Cayma 405, Cayma',                     '+51 54 254 000', TRUE),
(5, 'Sede Cusco Wanchaq',        'Cusco',    'Av. El Sol 920, Wanchaq',                  '+51 84 223 100', TRUE);

-- ----------------------------------------------------------------------------
-- 2. PERSONA (Supertipo común)
-- ----------------------------------------------------------------------------
INSERT INTO persona (id_persona, tipo_documento, nro_documento, nombres, apellidos, telefono, email, activo)
OVERRIDING SYSTEM VALUE VALUES
-- Empleados (1 al 6)
(1,  'DNI', '45892134', 'Carlos Alberto',   'Mendoza Vega',       '+51 987654321', 'carlos.mendoza@openrental.pe',     TRUE),
(2,  'DNI', '70123456', 'Fiorella Beatriz', 'Quispe Ramos',       '+51 987654322', 'fiorella.quispe@openrental.pe',    TRUE),
(3,  'DNI', '46789012', 'Jorge Luis',       'Flores Castillo',    '+51 987654323', 'jorge.flores@openrental.pe',       TRUE),
(4,  'DNI', '41234567', 'Andrea Sofia',     'Rodriguez Sanchez',  '+51 987654324', 'andrea.rodriguez@openrental.pe',   TRUE),
(5,  'DNI', '44556677', 'Pedro Pablo',      'Mamani Huaman',      '+51 987654325', 'pedro.mamani@openrental.pe',       TRUE),
(6,  'DNI', '48991122', 'Roberto Carlos',   'Vargas Diaz',        '+51 987654326', 'roberto.vargas@openrental.pe',      TRUE),
-- Clientes (7 al 15)
(7,  'DNI', '72345678', 'Juan Diego',       'Perez Castro',       '+51 991234561', 'juan.perez@gmail.com',             TRUE),
(8,  'DNI', '73456789', 'Maria Elena',      'Garcia Morales',     '+51 991234562', 'maria.garcia@outlook.com',         TRUE),
(9,  'DNI', '74567890', 'Luis Fernando',    'Sanchez Torres',     '+51 991234563', 'luis.sanchez@yahoo.com',           TRUE),
(10, 'PASAPORTE', 'PAS998877', 'John Michael', 'Smith Taylor',   '+1 555 234 5678', 'john.smith@gmail.com',           TRUE),
(11, 'DNI', '75678901', 'Claudia Patricia', 'Torres Alvarez',     '+51 991234565', 'claudia.torres@hotmail.com',       TRUE),
(12, 'DNI', '76789012', 'David Alejandro',  'Chavez Romero',      '+51 991234566', 'david.chavez@gmail.com',           TRUE),
(13, 'CARNET_EXTRANJERIA', 'CE0012345', 'Sophie Marie', 'Dubois Laurent', '+33 612 345 678', 'sophie.dubois@free.fr', TRUE),
(14, 'DNI', '77890123', 'Victor Manuel',    'Espinoza Paredes',   '+51 991234568', 'victor.espinoza@gmail.com',        TRUE),
(15, 'DNI', '78901234', 'Diana Valeria',    'Gutierrez Rojas',    '+51 991234569', 'diana.gutierrez@outlook.com',      TRUE),
-- Persona no especializada (16: contacto / solicitante previo)
(16, 'DNI', '79012345', 'Gabriel Eduardo',  'Ramirez Vasquez',    '+51 991234570', 'gabriel.ramirez@gmail.com',        TRUE);

-- ----------------------------------------------------------------------------
-- 3. CLIENTE (Subtipo de Persona)
-- ----------------------------------------------------------------------------
INSERT INTO cliente (id_persona, nro_licencia, licencia_vencimiento, pais_licencia, direccion, fecha_registro)
VALUES
(7,  'Q-72345678', '2028-09-15', 'Peru',           'Calle Los Pinos 142, San Isidro, Lima',   '2026-01-10 10:00:00'),
(8,  'Q-73456789', '2029-03-20', 'Peru',           'Av. Angamos Oeste 780, Miraflores, Lima', '2026-02-14 11:30:00'),
(9,  'Q-74567890', '2028-11-05', 'Peru',           'Jr. Junin 320, Cercado, Arequipa',        '2026-03-01 09:15:00'),
(10, 'USA-DL4458', '2029-08-30', 'Estados Unidos', '1240 Market St, San Francisco, CA',       '2026-04-12 16:40:00'),
(11, 'Q-75678901', '2028-06-18', 'Peru',           'Av. Salaverry 2150, Jesus Maria, Lima',   '2026-05-20 14:00:00'),
(12, 'Q-76789012', '2029-12-10', 'Peru',           'Calle San Agustin 115, Cusco',            '2026-06-05 10:20:00'),
(13, 'FRA-992381', '2030-01-25', 'Francia',        '15 Rue de Rivoli, Paris',                 '2026-07-18 12:10:00'),
(14, 'Q-77890123', '2028-10-14', 'Peru',           'Av. Brasil 1450, Pueblo Libre, Lima',     '2026-08-02 08:45:00'),
(15, 'Q-78901234', '2029-05-08', 'Peru',           'Calle Bolivar 450, Yanahuara, Arequipa',  '2026-09-11 15:30:00');

-- ----------------------------------------------------------------------------
-- 4. EMPLEADO (Subtipo de Persona)
-- ----------------------------------------------------------------------------
INSERT INTO empleado (id_persona, id_sucursal, cargo, usuario, password_hash)
VALUES
(1, 1, 'ADMINISTRADOR', 'cmendoza',   '$2a$12$e8Y7c81sA9Bw1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1'),
(2, 1, 'SUPERVISOR',    'fquispe',    '$2a$12$e8Y7c81sA9Bw1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V2'),
(3, 1, 'RECEPCIONISTA', 'jflores',    '$2a$12$e8Y7c81sA9Bw1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V3'),
(4, 2, 'RECEPCIONISTA', 'arodriguez', '$2a$12$e8Y7c81sA9Bw1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V4'),
(5, 1, 'MECANICO',      'pmamani',    '$2a$12$e8Y7c81sA9Bw1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V5'),
(6, 4, 'MECANICO',      'rvargas',    '$2a$12$e8Y7c81sA9Bw1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V6');

-- ----------------------------------------------------------------------------
-- 5. CATEGORIA (Tarifas y fianzas base)
-- Nota: id_categoria = 3 corresponde a 'SUV' para alinearse con Consulta 1
-- ----------------------------------------------------------------------------
INSERT INTO categoria (id_categoria, nombre, descripcion, tarifa_base_diaria, monto_garantia_base)
OVERRIDING SYSTEM VALUE VALUES
(1, 'ECONOMICO', 'Autos compactos de bajo consumo ideales para transito urbano',                80.00,  800.00),
(2, 'COMPACTO',  'Hatchbacks agiles y comodos para ciudad y rutas cortas',                     110.00, 1000.00),
(3, 'SUV',       'Camionetas SUV versatiles y espaciosas para viajes familiares y turismo',    220.00, 2200.00),
(4, 'SEDAN',     'Sedanes ejecutivos con gran confort de marcha y maletero amplio',            150.00, 1500.00),
(5, 'CAMIONETA', 'Pick-up 4x4 robustas con capacidad de carga para rutas exigentes',           280.00, 2800.00),
(6, 'PREMIUM',   'Vehiculos de alta gama con maximo lujo, tecnologia y confort',               450.00, 4500.00);

-- ----------------------------------------------------------------------------
-- 6. VEHICULO (Flota operativa)
-- ----------------------------------------------------------------------------
INSERT INTO vehiculo (
    id_vehiculo, placa, id_categoria, id_sucursal_actual,
    marca, modelo, anio, color, transmision, combustible,
    capacidad_pasajeros, kilometraje_actual, tarifa_diaria, estado, activo
)
OVERRIDING SYSTEM VALUE VALUES
(1,  'ABC-101', 1, 1, 'Kia',        'Picanto',          2022, 'Rojo',           'MECANICA',   'GASOLINA', 5, 25400,  85.00, 'DISPONIBLE',      TRUE),
(2,  'ABC-102', 2, 2, 'Toyota',     'Yaris Hatchback',  2023, 'Blanco',         'AUTOMATICA', 'GASOLINA', 5, 18200, 115.00, 'DISPONIBLE',      TRUE),
(3,  'SUV-301', 3, 1, 'Toyota',     'RAV4 Hybrid',      2023, 'Gris Plata',     'AUTOMATICA', 'HIBRIDO',  5, 31200, 230.00, 'DISPONIBLE',      TRUE),
(4,  'SUV-302', 3, 1, 'Honda',      'CR-V Touring',     2022, 'Negro',          'AUTOMATICA', 'GASOLINA', 5, 42000, 225.00, 'DISPONIBLE',      TRUE),
(5,  'SUV-303', 3, 4, 'Hyundai',    'Tucson',           2023, 'Azul Marino',    'AUTOMATICA', 'DIESEL',   5, 28600, 220.00, 'ALQUILADO',        TRUE),
(6,  'SED-401', 4, 1, 'Toyota',     'Corolla XEI',      2023, 'Negro',          'AUTOMATICA', 'GASOLINA', 5, 19500, 160.00, 'ALQUILADO',        TRUE),
(7,  'SED-402', 4, 2, 'Nissan',     'Sentra Advance',   2022, 'Blanco',         'MECANICA',   'GASOLINA', 5, 34000, 150.00, 'DISPONIBLE',      TRUE),
(8,  'CAM-501', 5, 5, 'Toyota',     'Hilux 4x4',        2023, 'Blanco',         'MECANICA',   'DIESEL',   5, 45100, 290.00, 'DISPONIBLE',      TRUE),
(9,  'CAM-502', 5, 1, 'Ford',       'Ranger 4x4',       2022, 'Gris Oscuro',    'AUTOMATICA', 'DIESEL',   5, 52300, 280.00, 'EN_MANTENIMIENTO', TRUE),
(10, 'PRM-601', 6, 2, 'Audi',       'Q5 S-Line',        2024, 'Azul Noche',     'AUTOMATICA', 'GASOLINA', 5, 12400, 480.00, 'ALQUILADO',        TRUE),
(11, 'PRM-602', 6, 1, 'BMW',        '320i Sport',       2023, 'Blanco Mineral', 'AUTOMATICA', 'GASOLINA', 5, 21800, 450.00, 'RESERVADO',        TRUE),
(12, 'ABC-103', 1, 3, 'Hyundai',    'Grand i10',        2021, 'Plateado',       'MECANICA',   'GASOLINA', 5, 68900,  80.00, 'DISPONIBLE',      TRUE);

-- ----------------------------------------------------------------------------
-- 7. RESERVA (Planificación y pre-asignación)
-- ----------------------------------------------------------------------------
INSERT INTO reserva (
    id_reserva, codigo_reserva, id_cliente, id_categoria, id_vehiculo,
    id_sucursal_retiro, id_sucursal_devolucion,
    fecha_inicio, fecha_fin, tarifa_diaria_pactada, total_estimado, estado
)
OVERRIDING SYSTEM VALUE VALUES
-- Reservas autónomas (no convertidas a alquiler: PENDIENTE, CONFIRMADA, CANCELADA, NO_SHOW)
(1,  'RES-2026-001', 7,  3, NULL, 1, 1, '2026-11-25 09:00:00', '2026-11-28 18:00:00', 220.00,  660.00, 'PENDIENTE'),
(2,  'RES-2026-002', 8,  6, 11,   1, 1, '2026-11-20 10:00:00', '2026-11-23 10:00:00', 450.00, 1350.00, 'CONFIRMADA'),
(3,  'RES-2026-003', 9,  2, NULL, 2, 2, '2026-10-15 08:00:00', '2026-10-18 20:00:00', 110.00,  330.00, 'CANCELADA'),
(4,  'RES-2026-004', 14, 4, NULL, 1, 1, '2026-10-20 09:00:00', '2026-10-22 18:00:00', 150.00,  300.00, 'NO_SHOW'),
-- Reserva solapada con rango 2026-11-01 a 2026-11-05 para vehiculo 4 (demuestra anti-unión de Consulta 1)
(5,  'RES-2026-005', 10, 3, 4,    1, 1, '2026-11-02 09:00:00', '2026-11-04 18:00:00', 225.00,  450.00, 'CONFIRMADA'),

-- Reservas que originan contratos de alquiler (al insertar alquiler transicionan a 'COMPLETADA')
(6,  'RES-2026-010', 7,  1, 1,    1, 1, '2026-10-01 08:00:00', '2026-10-05 18:00:00',  85.00,  340.00, 'CONFIRMADA'),
(7,  'RES-2026-011', 8,  2, 2,    2, 2, '2026-10-10 09:00:00', '2026-10-15 12:00:00', 115.00,  575.00, 'CONFIRMADA'),
(8,  'RES-2026-012', 14, 3, 3,    1, 1, '2026-10-18 10:00:00', '2026-10-22 18:00:00', 230.00,  920.00, 'CONFIRMADA'),
(9,  'RES-2026-013', 10, 5, 8,    5, 5, '2026-10-25 08:30:00', '2026-10-29 17:00:00', 290.00, 1160.00, 'CONFIRMADA'),
(10, 'RES-2026-014', 11, 4, 6,    1, 1, '2026-11-08 09:00:00', '2026-11-15 18:00:00', 160.00, 1120.00, 'CONFIRMADA'),
(11, 'RES-2026-015', 12, 3, 5,    4, 4, '2026-11-01 10:00:00', '2026-11-08 10:00:00', 220.00, 1540.00, 'CONFIRMADA'),
(12, 'RES-2026-016', 13, 6, 10,   2, 2, '2026-11-05 14:00:00', '2026-11-12 14:00:00', 480.00, 3360.00, 'CONFIRMADA'),
(13, 'RES-2026-017', 15, 4, 7,    2, 2, '2026-10-05 10:00:00', '2026-10-09 18:00:00', 150.00,  600.00, 'CONFIRMADA');

-- ----------------------------------------------------------------------------
-- 8. ALQUILER (Contratos de arrendamiento en ejecución o históricos)
-- ----------------------------------------------------------------------------
INSERT INTO alquiler (
    id_alquiler, nro_contrato, id_reserva, id_vehiculo,
    id_empleado_entrega, id_empleado_devolucion,
    fecha_entrega, fecha_dev_prevista, fecha_dev_real,
    tarifa_diaria_aplicada, costo_total_final, estado
)
OVERRIDING SYSTEM VALUE VALUES
-- Octubre 2026: Contratos finalizados
(1, 'CTR-2026-1001', 6,  1,  3, 3,    '2026-10-01 08:30:00', '2026-10-05 18:00:00', '2026-10-05 17:30:00',  85.00,  340.00, 'FINALIZADO'),
(2, 'CTR-2026-1002', 7,  2,  4, 4,    '2026-10-10 09:15:00', '2026-10-15 12:00:00', '2026-10-15 11:45:00', 115.00,  575.00, 'FINALIZADO'),
(3, 'CTR-2026-1003', 8,  3,  3, 3,    '2026-10-18 10:10:00', '2026-10-22 18:00:00', '2026-10-23 11:30:00', 230.00, 1470.00, 'FINALIZADO'), -- Dev. tardía + siniestro (cliente 14)
(4, 'CTR-2026-1004', 9,  8,  3, 3,    '2026-10-25 08:45:00', '2026-10-29 17:00:00', '2026-10-29 16:30:00', 290.00, 1160.00, 'FINALIZADO'),
(8, 'CTR-2026-1008', 13, 7,  4, 4,    '2026-10-05 10:30:00', '2026-10-09 18:00:00', '2026-10-09 17:50:00', 150.00,  600.00, 'FINALIZADO'),

-- Noviembre 2026: Contratos vigentes, atrasados o en disputa (Alertas operativas)
(5, 'CTR-2026-1105', 10, 6,  3, NULL, '2026-11-08 09:30:00', '2026-11-15 18:00:00', NULL,                  160.00,    NULL, 'EN_CURSO'),
(6, 'CTR-2026-1106', 11, 5,  4, NULL, '2026-11-01 10:20:00', '2026-11-08 10:00:00', NULL,                  220.00,    NULL, 'ATRASADO'),  -- Dev. prevista vencida
(7, 'CTR-2026-1107', 12, 10, 4, NULL, '2026-11-05 14:30:00', '2026-11-12 14:00:00', NULL,                  480.00,    NULL, 'EN_DISPUTA'); -- Conflicto de pago / devolución

-- ----------------------------------------------------------------------------
-- 9. INSPECCION (Check-out y Check-in)
-- ----------------------------------------------------------------------------
INSERT INTO inspeccion (
    id_inspeccion, id_alquiler,
    km_salida, km_retorno,
    combustible_salida, combustible_retorno,
    danos_salida, danos_retorno, cargos_adicionales
)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 25000, 25400, 'LLENO', 'LLENO', NULL, NULL,                                                                        0.00),
(2, 2, 17800, 18200, 'LLENO', 'LLENO', NULL, NULL,                                                                        0.00),
(3, 3, 30500, 31200, 'LLENO', '1/2',   NULL, 'Raspon en parachoque posterior lateral derecho y combustible menor al pactado', 350.00),
(4, 4, 44200, 45100, 'LLENO', 'LLENO', NULL, NULL,                                                                        0.00),
(5, 5, 19500, NULL,  'LLENO', NULL,    NULL, NULL,                                                                        0.00),
(6, 6, 28000, NULL,  'LLENO', NULL,    NULL, NULL,                                                                        0.00),
(7, 7, 12400, NULL,  'LLENO', NULL,    NULL, NULL,                                                                        0.00),
(8, 8, 33400, 34000, 'LLENO', 'LLENO', NULL, NULL,                                                                        0.00);

-- ----------------------------------------------------------------------------
-- 10. CONDUCTOR_ADICIONAL (Conductores autorizados extra)
-- ----------------------------------------------------------------------------
INSERT INTO conductor_adicional (id_alquiler, id_cliente, parentesco, licencia_verificada, recargo, fecha_registro)
VALUES
(1, 8,  'CONYUGE',  TRUE, 25.00, '2026-10-01 08:35:00'),
(3, 11, 'COLEGA',   TRUE, 30.00, '2026-10-18 10:15:00'),
(5, 7,  'COLEGA',   TRUE, 25.00, '2026-11-08 09:35:00'),
(8, 9,  'FAMILIAR', TRUE, 20.00, '2026-10-05 10:35:00');

-- ----------------------------------------------------------------------------
-- 11. PAGO (Transacciones económicas del alquiler)
-- ----------------------------------------------------------------------------
INSERT INTO pago (
    id_pago, id_alquiler, tipo_transaccion, monto, metodo_pago,
    referencia_operacion, fecha_pago, estado
)
OVERRIDING SYSTEM VALUE VALUES
-- Contrato 1 (Liquidado conforme)
(1,  1, 'ANTICIPO',            100.00, 'TARJETA_CREDITO', 'OP-1001-ANT', '2026-10-01 08:35:00', 'APROBADO'),
(2,  1, 'DEPOSITO_GARANTIA',   800.00, 'TARJETA_CREDITO', 'OP-1001-GAR', '2026-10-01 08:36:00', 'APROBADO'),
(3,  1, 'PAGO_ALQUILER',       240.00, 'TARJETA_CREDITO', 'OP-1001-REN', '2026-10-05 17:40:00', 'APROBADO'),
(4,  1, 'DEVOLUCION_GARANTIA', 800.00, 'TARJETA_CREDITO', 'OP-1001-DEV', '2026-10-05 17:45:00', 'APROBADO'),

-- Contrato 2 (Liquidado conforme)
(5,  2, 'DEPOSITO_GARANTIA',  1000.00, 'TRANSFERENCIA',   'OP-1002-GAR', '2026-10-10 09:20:00', 'APROBADO'),
(6,  2, 'PAGO_ALQUILER',       575.00, 'TRANSFERENCIA',   'OP-1002-REN', '2026-10-15 11:50:00', 'APROBADO'),
(7,  2, 'DEVOLUCION_GARANTIA',1000.00, 'TRANSFERENCIA',   'OP-1002-DEV', '2026-10-15 11:55:00', 'APROBADO'),

-- Contrato 3 (Liquidado con penalidad retenida de garantía: cliente 14)
(8,  3, 'ANTICIPO',            300.00, 'TARJETA_CREDITO', 'OP-1003-ANT', '2026-10-18 10:15:00', 'APROBADO'),
(9,  3, 'DEPOSITO_GARANTIA',  2200.00, 'TARJETA_CREDITO', 'OP-1003-GAR', '2026-10-18 10:16:00', 'APROBADO'),
(10, 3, 'PAGO_ALQUILER',       820.00, 'TARJETA_CREDITO', 'OP-1003-REN', '2026-10-23 11:40:00', 'APROBADO'),
(11, 3, 'PENALIDAD',           350.00, 'TARJETA_CREDITO', 'OP-1003-PEN', '2026-10-23 11:45:00', 'APROBADO'),
(12, 3, 'DEVOLUCION_GARANTIA',1850.00, 'TARJETA_CREDITO', 'OP-1003-DEV', '2026-10-23 11:50:00', 'APROBADO'),

-- Contrato 4 (Liquidado conforme)
(13, 4, 'DEPOSITO_GARANTIA',  2800.00, 'TRANSFERENCIA',   'OP-1004-GAR', '2026-10-25 08:50:00', 'APROBADO'),
(14, 4, 'PAGO_ALQUILER',      1160.00, 'TRANSFERENCIA',   'OP-1004-REN', '2026-10-29 16:35:00', 'APROBADO'),
(15, 4, 'DEVOLUCION_GARANTIA',2800.00, 'TRANSFERENCIA',   'OP-1004-DEV', '2026-10-29 16:40:00', 'APROBADO'),

-- Contrato 8 (Liquidado conforme)
(16, 8, 'DEPOSITO_GARANTIA',  1500.00, 'TARJETA_DEBITO',  'OP-1008-GAR', '2026-10-05 10:35:00', 'APROBADO'),
(17, 8, 'PAGO_ALQUILER',       600.00, 'TARJETA_DEBITO',  'OP-1008-REN', '2026-10-09 17:55:00', 'APROBADO'),
(18, 8, 'DEVOLUCION_GARANTIA',1500.00, 'TARJETA_DEBITO',  'OP-1008-DEV', '2026-10-09 18:00:00', 'APROBADO'),

-- Contrato 5 (En curso: anticipo y garantía aprobados, saldo pendiente)
(19, 5, 'ANTICIPO',            300.00, 'TARJETA_CREDITO', 'OP-1105-ANT', '2026-11-08 09:35:00', 'APROBADO'),
(20, 5, 'DEPOSITO_GARANTIA',  1500.00, 'TARJETA_CREDITO', 'OP-1105-GAR', '2026-11-08 09:36:00', 'APROBADO'),
(21, 5, 'PAGO_ALQUILER',       820.00, 'TARJETA_CREDITO', 'OP-1105-REN', '2026-11-08 09:37:00', 'PENDIENTE'),

-- Contrato 6 (Atrasado: anticipo y garantía aprobados)
(22, 6, 'ANTICIPO',            400.00, 'EFECTIVO',        'OP-1106-ANT', '2026-11-01 10:25:00', 'APROBADO'),
(23, 6, 'DEPOSITO_GARANTIA',  2200.00, 'TARJETA_DEBITO',  'OP-1106-GAR', '2026-11-01 10:26:00', 'APROBADO'),

-- Contrato 7 (En disputa: pago rechazado)
(24, 7, 'ANTICIPO',           1000.00, 'TARJETA_CREDITO', 'OP-1107-ANT', '2026-11-05 14:35:00', 'APROBADO'),
(25, 7, 'DEPOSITO_GARANTIA',  4500.00, 'TARJETA_CREDITO', 'OP-1107-GAR', '2026-11-05 14:36:00', 'APROBADO'),
(26, 7, 'PAGO_ALQUILER',      2360.00, 'TARJETA_CREDITO', 'OP-1107-REJ', '2026-11-12 14:10:00', 'RECHAZADO');

-- ----------------------------------------------------------------------------
-- 12. MANTENIMIENTO (Intervenciones técnicas de la flota)
-- ----------------------------------------------------------------------------
INSERT INTO mantenimiento (
    id_mantenimiento, id_vehiculo, id_empleado, taller, tipo,
    descripcion, km_al_servicio, costo, fecha_inicio, fecha_fin, estado
)
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 5, 'Taller Central San Isidro',       'PREVENTIVO',         'Mantenimiento preventivo 20,000 km: cambio de aceite 5W-30, filtro de aceite y filtro de aire',  20150, 280.00, '2026-08-10', '2026-08-11', 'COMPLETADO'),
(2, 7, 5, 'Taller Central San Isidro',       'PREVENTIVO',         'Mantenimiento 30,000 km: afinamiento electronico, bujias y rotacion de neumaticos',              30200, 420.00, '2026-09-05', '2026-09-06', 'COMPLETADO'),
(3, 9, 5, 'Taller Especializado Diesel Lima','CORRECTIVO',         'Sustitucion de pastillas de freno delanteras y reparacion de manguera de retorno de turbo',      52300, 950.00, '2026-11-10', NULL,         'EN_TALLER'),
(4, 8, 6, 'Taller Autorizado Toyota Cusco',  'INSPECCION_TECNICA', 'Revision tecnica periodica reglamentaria y calibracion de alineamiento de direccion',           40000, 180.00, '2026-07-22', '2026-07-22', 'COMPLETADO');

-- ----------------------------------------------------------------------------
-- 13. REINICIO Y SINCRONIZACIÓN DE SECUENCIAS DE IDENTIDAD
-- Garantiza que las futuras inserciones automáticas de la aplicación continúen
-- a partir del ID máximo sin generar colisiones ni errores de clave duplicada.
-- ----------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('sucursal',      'id_sucursal'),      COALESCE((SELECT MAX(id_sucursal)      FROM sucursal), 1));
SELECT setval(pg_get_serial_sequence('persona',       'id_persona'),       COALESCE((SELECT MAX(id_persona)       FROM persona), 1));
SELECT setval(pg_get_serial_sequence('categoria',     'id_categoria'),     COALESCE((SELECT MAX(id_categoria)     FROM categoria), 1));
SELECT setval(pg_get_serial_sequence('vehiculo',      'id_vehiculo'),      COALESCE((SELECT MAX(id_vehiculo)      FROM vehiculo), 1));
SELECT setval(pg_get_serial_sequence('reserva',       'id_reserva'),       COALESCE((SELECT MAX(id_reserva)       FROM reserva), 1));
SELECT setval(pg_get_serial_sequence('alquiler',      'id_alquiler'),      COALESCE((SELECT MAX(id_alquiler)      FROM alquiler), 1));
SELECT setval(pg_get_serial_sequence('inspeccion',    'id_inspeccion'),    COALESCE((SELECT MAX(id_inspeccion)    FROM inspeccion), 1));
SELECT setval(pg_get_serial_sequence('pago',          'id_pago'),          COALESCE((SELECT MAX(id_pago)          FROM pago), 1));
SELECT setval(pg_get_serial_sequence('mantenimiento', 'id_mantenimiento'), COALESCE((SELECT MAX(id_mantenimiento) FROM mantenimiento), 1));

COMMIT;

