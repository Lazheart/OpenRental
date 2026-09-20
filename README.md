# OpenRental

Este documento presenta las entidades y sus reglas de dominio consideradas en la implementación de la base de datos del Sistema de Alquiler de Vehículos. No incluye DDL — eso corresponde a la etapa de implementación (`sql/`).

## 1. Convenciones generales

- Toda tabla usa `id_<entidad>` como clave primaria entera autoincremental, salvo los subtipos de `PERSONA`, que reutilizan la misma clave (`id_persona`) como PK y FK a la vez.
- `PERSONA` y `VEHICULO` implementan **borrado lógico** con el atributo `activo`.
- Los campos `estado` de `VEHICULO`, `RESERVA` y `ALQUILER` reflejan el ciclo de vida del proceso, no se editan libremente desde afuera.
- Todo atributo de toda tabla es atómico: una celda guarda un único valor, nunca una lista ni varios campos concatenados. Cuando una entidad necesita "varios de algo" (varios pagos por alquiler, por ejemplo), eso se modela como filas adicionales en su propia tabla, no como valores agrupados en una columna.

---

## 2. Entidades, atributos y reglas de dominio

### Generalización / especialización: PERSONA → CLIENTE / EMPLEADO

Un trabajador puede además alquilar un vehículo como cliente. Si `CLIENTE` y `EMPLEADO` fueran tablas independientes, esa persona tendría su dni, nombre y email duplicados en ambas — con riesgo de inconsistencia si se actualiza uno y no el otro.

Se modela como **herencia de tablas (supertipo/subtipo)**:

- `PERSONA` concentra los atributos comunes a cualquier persona del sistema.
- `CLIENTE` y `EMPLEADO` son subtipos: cada uno agrega solo los atributos propios de ese rol, y su PK es también FK hacia `PERSONA` (relación 1:1 opcional).
- Una persona puede no tener rol, tener solo uno, o tener ambos (fila en `CLIENTE` y en `EMPLEADO` apuntando al mismo `id_persona`) — sin duplicar sus datos personales.

#### 2.1 PERSONA

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_persona` | int, PK | Autoincremental |
| `dni` | varchar(8) | Único, solo dígitos |
| `nombres` | varchar(50) | Obligatorio |
| `apellidos` | varchar(50) | Obligatorio |
| `telefono` | varchar(15) | Opcional |
| `email` | varchar(100) | Único, formato de correo válido |
| `activo` | boolean | Default `true`; borrado lógico |

#### 2.2 CLIENTE (subtipo — rol cliente)

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_persona` | int, PK, FK → PERSONA | Comparte clave con `PERSONA` |
| `direccion` | varchar(150) | Opcional |
| `fecha_registro` | date | Fecha en que la persona adquirió el rol de cliente |

#### 2.3 EMPLEADO (subtipo — rol empleado)

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_persona` | int, PK, FK → PERSONA | Comparte clave con `PERSONA` |
| `cargo` | varchar(30) | Ej.: Recepcionista, Supervisor |
| `usuario` | varchar(30) | Único, para autenticación |
| `password_hash` | varchar(255) | Nunca en texto plano |

#### 2.4 CATEGORIA

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_categoria` | int, PK | Autoincremental |
| `nombre` | varchar(30) | Único |
| `tarifa_base` | decimal(8,2) | > 0 |

#### 2.5 VEHICULO

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_vehiculo` | int, PK | Autoincremental |
| `placa` | varchar(7) | Único |
| `marca` | varchar(30) | Obligatorio |
| `modelo` | varchar(30) | Obligatorio |
| `anio` | smallint | Entre 1990 y el año actual |
| `id_categoria` | int, FK → CATEGORIA | Obligatorio |
| `tarifa_diaria` | decimal(8,2) | > 0; puede diferir de `tarifa_base` |
| `estado` | enum | `disponible`, `reservado`, `alquilado`, `en_mantenimiento`, `fuera_de_servicio` |
| `activo` | boolean | Default `true`; borrado lógico |

#### 2.6 RESERVA

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_reserva` | int, PK | Autoincremental |
| `id_cliente` | int, FK → CLIENTE | Obligatorio |
| `id_vehiculo` | int, FK → VEHICULO | Obligatorio |
| `fecha_inicio` | date | Obligatorio |
| `fecha_fin` | date | `fecha_fin > fecha_inicio` |
| `estado` | enum | `activa`, `confirmada`, `cancelada`, `vencida` |

#### 2.7 ALQUILER

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_alquiler` | int, PK | Autoincremental |
| `id_reserva` | int, FK → RESERVA, único, no nulo | Todo alquiler nace de una reserva (aun un walk-in genera una reserva inmediata) |
| `id_empleado` | int, FK → EMPLEADO | Responsable de la entrega |
| `fecha_entrega` | datetime | Obligatorio |
| `fecha_dev_prevista` | datetime | `fecha_dev_prevista > fecha_entrega` |
| `fecha_dev_real` | datetime | Nulo hasta registrar la devolución |
| `estado` | enum | `en_curso`, `finalizado`, `atrasado` |

*Cliente y vehículo del alquiler se obtienen siempre vía `RESERVA` — no se repiten aquí.*

#### 2.8 PAGO

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_pago` | int, PK | Autoincremental |
| `id_alquiler` | int, FK → ALQUILER | Obligatorio |
| `monto` | decimal(8,2) | > 0 |
| `fecha_pago` | datetime | Obligatorio |
| `metodo_pago` | enum | `efectivo`, `tarjeta`, `transferencia` |

#### 2.9 MANTENIMIENTO

| Atributo | Tipo | Regla de dominio |
|---|---|---|
| `id_mantenimiento` | int, PK | Autoincremental |
| `id_vehiculo` | int, FK → VEHICULO | Obligatorio |
| `id_empleado` | int, FK → EMPLEADO | Quien registra |
| `fecha` | date | Obligatorio |
| `tipo` | enum | `preventivo`, `correctivo` |
| `costo` | decimal(8,2) | ≥ 0 |

---

## 3. Relaciones entre entidades

| Relación | Cardinalidad | Participación |
|---|---|---|
| Persona — Cliente | 1:0..1 | Persona parcial, Cliente total |
| Persona — Empleado | 1:0..1 | Persona parcial, Empleado total |
| Categoría — Vehículo | 1:N | Categoría parcial, Vehículo total |
| Cliente — Reserva | 1:N | Cliente parcial, Reserva total |
| Vehículo — Reserva | 1:N | Vehículo parcial, Reserva total |
| Reserva — Alquiler | 1:0..1 | Reserva parcial, Alquiler total |
| Empleado — Alquiler | 1:N | Empleado parcial, Alquiler total |
| Alquiler — Pago | 1:N | Alquiler parcial, Pago total |
| Vehículo — Mantenimiento | 1:N | Vehículo parcial, Mantenimiento total |
| Empleado — Mantenimiento | 1:N | Empleado parcial, Mantenimiento total |
