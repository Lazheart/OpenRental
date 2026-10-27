# Proyecto Base de Datos I: OpenRental

**UTEC – Universidad de Ingeniería y Tecnología**

Benjamin Adriano Llerena Nuñez
Stephany Fabiola Gutierrez Quezada

27 de octubre de 2026

*Grupo 2*

---

## Índice General

1. [Requisitos](#capítulo-1-requisitos)
   - 1.1. Introducción
   - 1.2. Descripción general del problema
   - 1.3. Necesidad/uso de la base de datos
   - 1.4. ¿Cómo resuelve el problema hoy?
     - 1.4.1. ¿Cómo se almacenan/procesan los datos hoy?
     - 1.4.2. Flujo de datos
   - 1.5. Descripción detallada del sistema
     - 1.5.1. Objetos de información actuales
     - 1.5.2. Características y funcionalidades esperadas
     - 1.5.3. Tipos de usuarios existentes/necesarios
     - 1.5.4. Tipo de consultas, actualizaciones
   - 1.6. Tamaño estimado de la base de datos
     - 1.6.1. Escalamiento para los escenarios de experimentación
   - 1.7. Objetivos del proyecto
     - 1.7.1. Objetivo principal
     - 1.7.2. Objetivos secundarios
   - 1.8. Eventualidades
     - 1.8.1. Problemas que pudieran encontrarse en el proyecto
     - 1.8.2. Límites y alcance del proyecto
2. [Modelo Entidad Relación](#capítulo-2-modelo-entidad-relación)
   - 2.1. Diagrama Entidad-Relación (Modelo Conceptual)
   - 2.2. Reglas semánticas
   - 2.3. Modelo Entidad-Relación
   - 2.4. Multiplicidad y participación de las relaciones
   - 2.5. Jerarquía de especialización
   - 2.6. Especificaciones y consideraciones sobre el proyecto
3. [Modelo Relacional](#capítulo-3-modelo-relacional)
   - 3.1. Transformación del modelo E/R al modelo relacional
     - 3.1.1. Transformación de entidades fuertes
     - 3.1.2. Transformación de la jerarquía de especialización
     - 3.1.3. Transformación de relaciones uno a muchos
     - 3.1.4. Transformación de relaciones uno a uno
     - 3.1.5. Transformación de la relación muchos a muchos
     - 3.1.6. Ausencia de entidades débiles
     - 3.1.7. Transformación de atributos y dominios
   - 3.2. Modelo relacional
     - 3.2.1. Correspondencia de tipos con PostgreSQL
   - 3.3. Diccionario de datos
   - 3.4. Normalización
     - 3.4.1. Dependencias funcionales del esquema
     - 3.4.2. Verificación de las formas normales
     - 3.4.3. Anomalías evitadas
     - 3.4.4. Decisiones de diseño que se apartan de la normalización estricta
   - 3.5. Validación del modelo mediante las consultas previstas
   - 3.6. Referencias del proyecto

---

# Capítulo 1: Requisitos

## 1.1. Introducción

El presente documento expone las especificaciones y requerimientos técnicos para el diseño, desarrollo e implementación de OpenRental, un proyecto de código libre orientado a la gestión integral de empresas dedicadas al alquiler de vehículos. El objetivo principal del proyecto es digitalizar y centralizar los procesos asociados a la operación de una empresa Rent-a-Car, permitiendo gestionar de manera eficiente las reservas, la disponibilidad y asignación de vehículos, el despacho y devolución de unidades, las inspecciones de estado, los depósitos en garantía, los pagos y el mantenimiento de la flota.

Este proyecto busca proporcionar una solución flexible, confiable y extensible que permita organizar la información operativa y contractual de los vehículos y clientes, mantener la trazabilidad de las operaciones y garantizar la integridad de los datos mediante reglas de negocio y mecanismos de control implementados a nivel de base de datos.

## 1.2. Descripción general del problema

La gestión de una empresa dedicada al alquiler de vehículos involucra una gran cantidad de información operativa, contractual y financiera que debe mantenerse organizada y disponible en todo momento. Cada vehículo posee características, ubicación, estado operativo, kilometraje y un historial de mantenimiento que deben ser controlados de manera precisa. A esto se suman las reservas, asignaciones, entregas, devoluciones, inspecciones, pagos y garantías asociadas a cada alquiler.

Actualmente, una gestión desestructurada de esta información puede generar diversos problemas operativos, como la asignación simultánea de un mismo vehículo a diferentes reservas, pérdida de trazabilidad sobre los contratos, inconsistencias en los registros de kilometraje, dificultades para controlar el mantenimiento de la flota y errores en la liquidación de pagos o depósitos en garantía. Además, la ausencia de un sistema centralizado dificulta conocer en tiempo real qué vehículos se encuentran disponibles, reservados, alquilados o fuera de servicio.

Esta problemática evidencia la necesidad de contar con un sistema informático capaz de representar adecuadamente el ciclo completo de un alquiler y mantener la integridad histórica de las operaciones. OpenRental plantea abordar esta necesidad mediante una base de datos relacional que permita centralizar y estructurar la información de personas, sucursales, vehículos, reservas, alquileres, inspecciones, pagos y mantenimiento.

## 1.3. Necesidad/uso de la base de datos

Resulta necesario implementar un sistema de base de datos relacional robusto que actúe como el núcleo de información de OpenRental. Esta infraestructura permitirá organizar y controlar los principales procesos de una empresa de alquiler de vehículos, utilizándose estratégicamente para:

- **Gestión y trazabilidad de la flota:** Registrar cada vehículo, sus características, categoría, sucursal actual, kilometraje, tarifa y estado operativo, conservando además su historial de alquileres y mantenimiento.
- **Gestión de reservas y alquileres:** Registrar las reservas realizadas por los clientes, controlar la disponibilidad de los vehículos y generar los contratos correspondientes, evitando conflictos de asignación y solapamientos de reservas.
- **Control de entregas, devoluciones e inspecciones:** Registrar las condiciones del vehículo durante el Check-out y Check-in, incluyendo kilometraje, nivel de combustible y daños detectados, permitiendo establecer la trazabilidad del estado de cada unidad.
- **Gestión de pagos y garantías:** Centralizar los anticipos, pagos de alquiler, depósitos en garantía, devoluciones y penalidades, manteniendo un historial de las transacciones asociadas a cada contrato.
- **Control del mantenimiento de vehículos:** Registrar las intervenciones preventivas y correctivas realizadas sobre cada vehículo, incluyendo talleres, responsables, kilometraje, costos, fechas y estado del servicio.
- **Integridad y consistencia de la información:** Aplicar restricciones, relaciones y reglas de negocio que permitan prevenir inconsistencias, controlar las transiciones de estado y preservar la trazabilidad de las operaciones históricas.

## 1.4. ¿Cómo resuelve el problema hoy?

Actualmente, la gestión de una empresa de alquiler de vehículos puede depender de procesos manuales, hojas de cálculo y registros independientes mantenidos por el personal. La disponibilidad de la flota, las reservas, los contratos, los pagos y el mantenimiento pueden encontrarse distribuidos entre diferentes registros, dificultando obtener una visión completa y actualizada de la operación.

Cuando un cliente solicita reservar o alquilar un vehículo, el personal debe verificar manualmente la disponibilidad de las unidades, revisar sus estados y comprobar que no exista otra reserva o alquiler que se superponga con el período solicitado. Este proceso incrementa el riesgo de errores humanos, especialmente cuando la cantidad de vehículos, clientes y reservas aumenta.

La falta de centralización también dificulta mantener una trazabilidad completa del ciclo de vida de cada vehículo. Información como kilometraje, inspecciones, daños, reparaciones, contratos anteriores y movimientos entre sucursales puede quedar registrada en diferentes medios, haciendo más complejo consultar el historial de una unidad y tomar decisiones operativas basadas en información actualizada.

### 1.4.1. ¿Cómo se almacenan/procesan los datos hoy?

Los datos pueden ser gestionados mediante hojas de cálculo, documentos y registros físicos independientes. Si bien estas herramientas permiten almacenar información básica sobre clientes, vehículos o reservas, presentan limitaciones importantes para representar las relaciones entre las diferentes entidades del sistema.

Por ejemplo, mantener de forma manual la relación entre un cliente, sus reservas, los vehículos asignados, los contratos generados y los pagos realizados puede producir duplicidad e inconsistencias en la información. De igual manera, el historial de mantenimiento y las inspecciones de los vehículos pueden encontrarse separados del resto de la información operativa.

Este enfoque dificulta aplicar reglas de integridad como impedir la asignación simultánea de un vehículo a diferentes alquileres, mantener actualizado su estado operativo o garantizar la consistencia del kilometraje registrado durante una devolución. Como consecuencia, la información depende en gran medida de la correcta actualización manual de los registros.

### 1.4.2. Flujo de datos

1. El cliente solicita una reserva indicando la categoría de vehículo requerida, la sucursal de retiro, la sucursal de devolución y el período de alquiler.
2. El personal consulta los registros disponibles para determinar qué vehículos pertenecientes a la categoría solicitada se encuentran disponibles durante el período requerido.
3. Una vez seleccionada una unidad, se registra la reserva y se asigna el vehículo correspondiente, verificando manualmente que no exista otra reserva o alquiler que genere un conflicto de disponibilidad.
4. Al momento de la entrega, el personal registra los datos del contrato, el vehículo entregado, el kilometraje, el nivel de combustible y los daños existentes mediante una inspección de Check-out.
5. Durante el período de alquiler se registran los pagos, depósitos en garantía y cualquier otra transacción asociada al contrato.
6. Al finalizar el alquiler, el cliente devuelve el vehículo y el personal realiza la inspección de Check-in, registrando nuevamente el kilometraje, combustible y posibles daños o cargos adicionales.
7. Finalmente, se actualiza el estado del vehículo y se registra su devolución. Si la unidad requiere reparaciones o mantenimiento, se genera el registro correspondiente y el vehículo puede quedar temporalmente fuera de disponibilidad.

## 1.5. Descripción detallada del sistema

### 1.5.1. Objetos de información actuales

Para transformar el flujo operativo de una empresa de alquiler de vehículos, el sistema identifica, aísla y procesa de forma relacional cuatro grandes categorías de objetos de información, los cuales quedan estructurados de la siguiente manera:

- **Entidades de Identidad, Roles y Sedes:** Registra la información de las personas vinculadas al sistema mediante la entidad `PERSONA`, que funciona como supertipo para `CLIENTE` y `EMPLEADO`. El sistema permite diferenciar los datos legales y de contacto de los clientes de la información operativa del personal, además de asociar los empleados a una `SUCURSAL` y definir sus cargos dentro de la organización.
- **Categorías y Flota de Vehículos:** Representa el núcleo físico del sistema. La entidad `CATEGORIA` permite clasificar los vehículos y establecer tarifas y garantías de referencia, mientras que `VEHICULO` representa cada unidad física de la flota, registrando su placa, características técnicas, sucursal actual, kilometraje, tarifa y estado operativo.
- **Reservas, Alquileres e Inspecciones:** Comprende las entidades que representan el ciclo operativo del servicio. `RESERVA` registra la intención de alquiler y permite reservar una categoría antes de asignar necesariamente un vehículo específico. `ALQUILER` representa el contrato físico de tenencia del vehículo e `INSPECCION` registra las condiciones de la unidad durante la entrega y devolución, incluyendo kilometraje, combustible y daños. Asimismo, un contrato puede autorizar conductores adicionales al titular, vínculo que se registra mediante `CONDUCTOR ADICIONAL` junto con el parentesco declarado, la verificación de la licencia y el recargo aplicado.
- **Entidades Financieras y de Mantenimiento:** Agrupa los registros asociados a la gestión económica y conservación de la flota. `PAGO` permite registrar anticipos, pagos de alquiler, depósitos en garantía, devoluciones y penalidades, mientras que `MANTENIMIENTO` conserva el historial de intervenciones preventivas, correctivas e inspecciones técnicas realizadas sobre cada vehículo.

### 1.5.2. Características y funcionalidades esperadas

El sistema de base de datos relacional implementado para OpenRental debe garantizar de forma nativa las siguientes capacidades operativas:

- **Control de Disponibilidad de la Flota:** Mantener actualizado el estado operativo de cada vehículo, permitiendo distinguir entre unidades disponibles, reservadas, alquiladas, en mantenimiento o fuera de servicio. Las transiciones de estado deberán respetar el ciclo de vida definido para cada vehículo.
- **Gestión y Trazabilidad de Reservas y Alquileres:** Registrar el ciclo completo de una operación, desde la reserva inicial hasta la generación del contrato, entrega física del vehículo y posterior devolución, manteniendo la relación histórica entre cliente, vehículo, empleado y sucursales involucradas.
- **Control de Inspecciones y Estado Físico:** Registrar mediante `INSPECCION` las condiciones del vehículo durante el Check-out y Check-in, incluyendo kilometraje, combustible y daños. La información permitirá determinar cargos adicionales y actualizar el estado de la unidad después de la devolución.
- **Validación de Reglas de Negocio Estrictas:** Aplicar restricciones y mecanismos de control que impidan operaciones inconsistentes, tales como reservas o alquileres solapados para un mismo vehículo, kilometrajes de retorno inferiores al kilometraje de salida, contratos asociados a licencias vencidas, autorización de conductores adicionales sin licencia vigente o duplicados dentro de un mismo contrato, y finalización de alquileres sin la correspondiente liquidación de garantía.
- **Gestión Financiera y de Garantías:** Centralizar las transacciones económicas relacionadas con cada alquiler, diferenciando anticipos, pagos, depósitos, devoluciones y penalidades mediante tipos y estados de transacción claramente definidos.
- **Trazabilidad del Mantenimiento:** Conservar el historial técnico de cada vehículo, incluyendo el tipo de mantenimiento, taller responsable, empleado encargado, kilometraje, costos, fechas y estado del servicio.

### 1.5.3. Tipos de usuarios existentes/necesarios

El sistema gestionará los diferentes perfiles operativos mediante roles definidos, asignando responsabilidades y permisos de acuerdo con las funciones que desempeña cada persona dentro de la empresa:

- **Administrador del Sistema:** Responsable de la administración integral de la base de datos y de la configuración de la infraestructura lógica del sistema. Puede gestionar la información estructural y las reglas de funcionamiento necesarias para garantizar la integridad de los datos.
- **Administrador de la Empresa:** Encargado de supervisar la operación general de la empresa, incluyendo la gestión de empleados, sucursales, categorías, vehículos, reservas, alquileres, pagos y reportes operativos.
- **Recepcionista:** Responsable de las operaciones relacionadas con clientes, reservas, entregas y devoluciones de vehículos. Puede registrar alquileres, realizar inspecciones de entrega y recepción y gestionar los pagos correspondientes a las operaciones que atiende.
- **Mecánico:** Responsable de registrar y gestionar las actividades de mantenimiento de los vehículos. Puede consultar el historial técnico de las unidades y registrar servicios preventivos, correctivos e inspecciones técnicas.
- **Supervisor:** Responsable de supervisar las operaciones realizadas por el personal y verificar el estado de los vehículos, alquileres y procesos de mantenimiento correspondientes a su ámbito de operación.
- **Cliente:** Usuario final que solicita y realiza reservas y alquileres de vehículos. Sus datos de identificación, contacto y licencia de conducir son registrados en el sistema para validar su elegibilidad para contratar el servicio.

### 1.5.4. Tipo de consultas, actualizaciones

El motor de la base de datos estará orientado a soportar las operaciones frecuentes de consulta, registro y actualización que forman parte del ciclo de alquiler de vehículos:

**Consultas Frecuentes (SELECT):**

- Consulta de vehículos disponibles filtrados por categoría, sucursal, estado operativo y período de alquiler.
- Consulta del historial de reservas y alquileres realizados por un cliente determinado.
- Consulta del historial de mantenimiento, kilometraje y estado actual de un vehículo.
- Consulta de reservas próximas, alquileres en curso y vehículos que deben ser devueltos.
- Reportes analíticos sobre la utilización de la flota, cantidad de alquileres, ingresos y costos de mantenimiento agrupados por períodos de tiempo.

**Actualizaciones y Modificaciones de Datos (INSERT - UPDATE):**

- Inserción de nuevos clientes, empleados, vehículos, categorías y sucursales.
- Registro y actualización de reservas, incluyendo sus diferentes estados: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `NO SHOW` y `COMPLETADA`.
- Creación de contratos de alquiler y actualización de su estado durante el ciclo de ejecución, incluyendo `EN CURSO`, `ATRASADO`, `FINALIZADO` y `EN DISPUTA`.
- Registro de inspecciones de salida y retorno, actualizando el kilometraje actual del vehículo a partir de la lectura registrada durante la devolución.
- Inserción de transacciones de pago correspondientes a anticipos, alquileres, depósitos, devoluciones y penalidades.
- Registro y actualización de órdenes de mantenimiento, modificando el estado del vehículo según corresponda.

**Consultas de Auditoría de Datos:**

- Se diseñarán consultas para verificar la coherencia entre reservas, alquileres y disponibilidad de vehículos, identificando posibles solapamientos o asignaciones incompatibles.
- Se podrán realizar consultas de auditoría sobre la trazabilidad de cada vehículo, relacionando su historial de alquileres, inspecciones y mantenimientos para detectar inconsistencias en kilometraje, estados operativos o registros de devolución.
- Las consultas podrán contrastar los registros de `ALQUILER`, `INSPECCION`, `PAGO` y `VEHICULO` para verificar que un contrato finalizado cuente con la correspondiente inspección de retorno y liquidación económica.

## 1.6. Tamaño estimado de la base de datos

Para calcular el tamaño inicial estimado de la base de datos de OpenRental, se proyectó el volumen de información correspondiente a varios años de funcionamiento continuo de una empresa dedicada al alquiler de vehículos. Se consideró un escenario de operación de tamaño mediano a grande, contemplando múltiples sucursales, una flota amplia de vehículos y un volumen considerable de clientes, reservas y alquileres.

Para cada entidad se estimó el tamaño de una fila considerando los tipos de datos utilizados en sus atributos. Para efectos del dimensionamiento inicial, se considera que un `integer` equivale a 4 bytes, un `bigint` a 8 bytes, un `date` a 4 bytes y un `varchar(n)` a n bytes. En el caso de campos de fecha y hora, se considera el tamaño correspondiente al tipo `timestamp` de PostgreSQL, de 8 bytes, utilizado para mantener la precisión temporal requerida por las reservas, alquileres, pagos e inspecciones.

Luego, se multiplicó el tamaño estimado de cada fila por la cantidad de registros proyectados para obtener el peso total en Bytes y su equivalente en Kilobytes (KB).

| Entidad | Tamaño por fila (Bytes) | N° de filas estimadas | Total (Bytes) | Total (KB) |
|---|---:|---:|---:|---:|
| Sucursal | 180 | 20 | 3,600 | 3.52 |
| Persona | 180 | 25,000 | 4,500,000 | 4,394.53 |
| Cliente | 80 | 20,000 | 1,600,000 | 1,562.50 |
| Empleado | 80 | 200 | 16,000 | 15.63 |
| Categoría | 100 | 30 | 3,000 | 2.93 |
| Vehículo | 140 | 750 | 105,000 | 102.54 |
| Reserva | 120 | 50,000 | 6,000,000 | 5,859.38 |
| Alquiler | 120 | 40,000 | 4,800,000 | 4,687.50 |
| Inspección | 100 | 40,000 | 4,000,000 | 3,906.25 |
| Conductor adicional | 60 | 16,000 | 960,000 | 937.50 |
| Pago | 100 | 100,000 | 10,000,000 | 9,765.63 |
| Mantenimiento | 120 | 15,000 | 1,800,000 | 1,757.81 |
| **TAMAÑO TOTAL ESTIMADO** | | | **33,787,600** | **32,995.70** |

**Conclusión del dimensionamiento:** El tamaño total estimado para los datos puros de la base de datos de OpenRental es de aproximadamente 32.2 MB. Esta estimación corresponde a un escenario de operación de tamaño mediano a grande, considerando una red de aproximadamente 20 sucursales, una flota de 750 vehículos, 20,000 clientes registrados y un historial acumulado de 50,000 reservas y 40,000 alquileres, de los cuales se estima que un 40 % autoriza al menos un conductor adicional.

El mayor volumen de información corresponde a las entidades `PAGO`, `RESERVA`, `ALQUILER`, `INSPECCION` y `PERSONA`, debido a que registran operaciones e información histórica que se acumula durante el funcionamiento continuo del sistema.

Cabe destacar que este valor representa únicamente una aproximación del tamaño de los datos en crudo (Data Pages). En la implementación física sobre PostgreSQL, el espacio utilizado en disco será ligeramente superior debido al almacenamiento de metadatos del sistema, información de control, páginas de datos, índices B-Tree y demás estructuras necesarias para optimizar las consultas y mantener la integridad de las relaciones.

El crecimiento futuro de la base de datos estará principalmente determinado por las operaciones de `RESERVA`, `ALQUILER`, `INSPECCION`, `PAGO` y `MANTENIMIENTO`, ya que estas entidades conservan el historial operativo de los vehículos y las transacciones realizadas por los clientes.

Cabe precisar que la cifra de 25,000 registros proyectada para `PERSONA` es superior a la suma de `CLIENTE` (20,000) y `EMPLEADO` (200). Esta diferencia es intencional y resulta coherente con la regla semántica que permite que una persona no se especialice en ningún subtipo: corresponde a personas registradas como contacto, conductor adicional declarado o solicitante cuya reserva nunca llegó a concretarse, las cuales conservan su ficha de identidad sin haber contratado el servicio.

### 1.6.1. Escalamiento para los escenarios de experimentación

El dimensionamiento anterior describe el estado de la base de datos en operación normal, con aproximadamente 331,000 filas distribuidas entre las doce relaciones. Sin embargo, la fase de experimentación del proyecto exige evaluar el mismo conjunto de consultas sobre cuatro volúmenes de datos crecientes: 1,000, 10,000, 100,000 y 1,000,000 de registros. Por este motivo, el diseño debe anticipar desde el modelo conceptual cómo se alcanzará el escenario final sin comprometer la integridad referencial ni las proporciones propias del dominio.

Se define `PAGO` como la relación de referencia para el conteo de registros de cada escenario, debido a que es la entidad de mayor cardinalidad natural del modelo: un mismo contrato de alquiler genera habitualmente entre dos y cuatro transacciones independientes correspondientes al anticipo, el depósito en garantía, la liquidación del alquiler y, cuando corresponde, su devolución o una penalidad. Las demás relaciones escalan de forma proporcional según las siguientes razones, derivadas de las reglas de multiplicidad del modelo:

- Por cada `ALQUILER` se generan aproximadamente 2.5 registros de `PAGO` y exactamente un registro de `INSPECCION`, conforme a la relación 1:1 establecida.
- Por cada `ALQUILER` se generan en promedio 0.4 registros de `CONDUCTOR ADICIONAL`, dado que únicamente una fracción de los contratos autoriza conductores distintos del titular. La generación debe respetar además las dos restricciones del dominio: el conductor autorizado debe existir previamente como `CLIENTE` y no puede coincidir con el titular de la reserva de origen.
- Por cada `ALQUILER` existe exactamente una `RESERVA` que le dio origen, más un margen adicional de reservas en estado `CANCELADA` o `NO SHOW` que nunca se convirtieron en contrato, estimado en un 25 % del total.
- La cantidad de `CLIENTE` crece de forma sublineal respecto a los alquileres, dado que un cliente recurrente acumula varios contratos a lo largo del tiempo.
- Las relaciones de catálogo, es decir `SUCURSAL`, `CATEGORIA`, `EMPLEADO` y `VEHICULO`, permanecen prácticamente constantes entre escenarios, ya que representan la infraestructura física de la empresa y no su actividad transaccional. En el escenario de un millón de registros la flota se amplía hasta un valor coherente con el volumen de operaciones simuladas.

De este modo, el escenario final de 1,000,000 de registros en `PAGO` corresponde aproximadamente a 400,000 alquileres, 500,000 reservas y 400,000 inspecciones, manteniendo en todos los casos claves foráneas válidas y una distribución temporal de fechas de reserva, entrega y devolución compatible con las restricciones definidas en las reglas semánticas. Esta decisión de escalamiento se documenta en el presente hito porque condiciona la estrategia de generación de datos y, por lo tanto, la validez del experimento de optimización.

## 1.7. Objetivos del proyecto

### 1.7.1. Objetivo principal

Diseñar, implementar y validar un sistema de base de datos relacional para OpenRental, capaz de gestionar de manera eficaz la operación integral de una empresa de alquiler de vehículos, incluyendo el registro de clientes y empleados, la administración de sucursales y flota, la gestión de reservas y contratos de alquiler, el control de inspecciones, pagos, garantías y mantenimiento, optimizando la organización, integridad y trazabilidad de la información.

### 1.7.2. Objetivos secundarios

- Modelar y diseñar una estructura relacional que represente con precisión las relaciones entre personas, clientes, empleados, sucursales, categorías y vehículos, evitando la redundancia de información mediante un modelo de datos normalizado.
- Mejorar los tiempos de los procesos de reserva, asignación, entrega y devolución de vehículos, reduciendo errores humanos y fortaleciendo la trazabilidad de cada operación de alquiler.
- Implementar un modelo de datos capaz de gestionar el ciclo de vida de las reservas y contratos de alquiler, permitiendo controlar sus estados y garantizar la consistencia de las operaciones.
- Gestionar el control físico y operativo de la flota mediante el registro de las características, ubicación, disponibilidad, kilometraje y estado de cada vehículo.
- Registrar y controlar las inspecciones de entrega y devolución de vehículos, incluyendo el kilometraje, nivel de combustible y daños detectados, para facilitar la evaluación del estado físico de cada unidad.
- Implementar mecanismos de integridad y validación de reglas de negocio que permitan prevenir solapamientos de reservas, inconsistencias de kilometraje, asignaciones incompatibles y operaciones financieras incorrectas.
- Gestionar de manera estructurada los pagos, depósitos en garantía, devoluciones y penalidades asociados a los contratos de alquiler, manteniendo un historial de las transacciones realizadas.
- Registrar y organizar el historial de mantenimiento preventivo y correctivo de los vehículos, permitiendo controlar los servicios realizados, sus costos, responsables y estados.
- Reducir la redundancia, inconsistencias y errores presentes en los métodos de gestión manual, mediante la centralización de la información en una base de datos relacional.
- Implementar consultas y reportes que permitan analizar la utilización de la flota, el historial de alquileres, los ingresos, los costos de mantenimiento y la disponibilidad de vehículos.

## 1.8. Eventualidades

### 1.8.1. Problemas que pudieran encontrarse en el proyecto

Durante el diseño, desarrollo e implementación del sistema de base de datos relacional para OpenRental, se pueden presentar diversos inconvenientes relacionados con la integridad de los datos, la complejidad de las reglas de negocio y la concurrencia de las operaciones.

- **Inconsistencia y duplicidad en los datos iniciales:** Si la información existente de clientes, vehículos, reservas, pagos o mantenimientos proviene de registros manuales, hojas de cálculo u otras fuentes independientes, pueden existir datos duplicados, campos incompletos, formatos inconsistentes o referencias incorrectas entre entidades. Antes de realizar una migración hacia PostgreSQL será necesario validar, limpiar y normalizar la información.
- **Complejidad en las relaciones entre entidades:** El modelo de OpenRental integra múltiples relaciones entre `PERSONA`, `CLIENTE`, `EMPLEADO`, `SUCURSAL`, `VEHICULO`, `RESERVA`, `ALQUILER`, `INSPECCION`, `PAGO` y `MANTENIMIENTO`. Una implementación incorrecta de las claves primarias, claves foráneas o restricciones podría ocasionar pérdida de integridad referencial o inconsistencias entre los registros.
- **Complejidad en la implementación de las reglas de negocio:** El sistema debe controlar condiciones como la prevención de reservas solapadas, la actualización automática del kilometraje, la validación de licencias vigentes y la correcta transición entre los estados de vehículos, reservas y alquileres. Una implementación incorrecta de estas reglas podría permitir operaciones incompatibles con el funcionamiento esperado del sistema.
- **Concurrencia durante operaciones de alta demanda:** Varias reservas o alquileres pueden ser registrados simultáneamente sobre la misma flota de vehículos. Si las transacciones no utilizan correctamente los mecanismos de concurrencia y aislamiento proporcionados por PostgreSQL, podrían producirse conflictos al consultar y actualizar la disponibilidad de una misma unidad.
- **Errores humanos durante la operación:** La transición desde procesos manuales hacia un sistema estructurado puede generar errores iniciales por desconocimiento del nuevo flujo de trabajo. Será necesario establecer procedimientos claros para el registro de clientes, reservas, entregas, devoluciones, pagos e inspecciones.

### 1.8.2. Límites y alcance del proyecto

**Alcance:**

- **Diseño Arquitectónico:** Modelado lógico y físico de las entidades relacionadas con personas, sucursales, categorías, vehículos, reservas, alquileres, inspecciones, pagos y mantenimiento.
- **Lógica de Negocio en Servidor:** Implementación en PostgreSQL de restricciones de integridad, claves primarias y foráneas, restricciones `CHECK`, funciones, procedimientos y disparadores (triggers) necesarios para controlar las reglas de negocio definidas.
- **Control de Estados:** Implementación de los ciclos de vida definidos para vehículos, reservas y alquileres, garantizando que las transiciones entre estados respeten las reglas establecidas.
- **Trazabilidad Operativa:** Registro histórico de las reservas, contratos, inspecciones, pagos y mantenimientos asociados a cada vehículo y cliente.
- **Optimización:** Creación de índices y estructuras necesarias para mejorar el rendimiento de consultas frecuentes relacionadas con disponibilidad, reservas, alquileres, clientes y vehículos.

**Límites:**

- **Interfaz de Usuario:** El proyecto se limita al diseño e implementación de la base de datos y su lógica interna. No contempla necesariamente el desarrollo de una aplicación web, aplicación móvil o interfaz gráfica para los usuarios finales.
- **Servicios Externos:** La base de datos no contempla la implementación directa de pasarelas de pago, servicios externos de validación de identidad, sistemas bancarios o plataformas de comunicación de terceros.
- **Geolocalización y Telemetría:** El sistema registra la sucursal actual, kilometraje y estado operativo de los vehículos, pero no contempla sistemas de GPS, seguimiento en tiempo real ni telemetría vehicular.
- **Repositorio Multimedia:** El sistema está orientado a la gestión de información operativa y contractual. No contempla el almacenamiento de fotografías, videos u otros archivos multimedia asociados a las inspecciones o vehículos.
- **Integración con Sistemas Externos:** Las integraciones con sistemas externos de contabilidad, facturación electrónica, bancos o proveedores de servicios quedan fuera del alcance de la implementación de la base de datos.

---

# Capítulo 2: Modelo Entidad Relación

## 2.1. Diagrama Entidad-Relación (Modelo Conceptual)

A continuación se presenta el diagrama Entidad-Relación de OpenRental. Para mantener la legibilidad y evitar el cruce de líneas conductoras, el diagrama se ha estructurado en cuatro bloques que corresponden a los módulos funcionales descritos en el capítulo anterior: el bloque de identidad y roles (`PERSONA`, `CLIENTE`, `EMPLEADO`) en el sector izquierdo, el catálogo y la flota (`CATEGORIA`, `VEHICULO`) en la esquina superior derecha, la infraestructura física (`SUCURSAL`) en el sector inferior izquierdo, y el núcleo transaccional (`RESERVA`, `ALQUILER`, `INSPECCION`, `PAGO`, `MANTENIMIENTO`) en el centro geométrico, por ser el conjunto de entidades con mayor número de conexiones.

## 2.2. Reglas semánticas

Las reglas semánticas definen formalmente el comportamiento de los datos, las restricciones de dominio y las interacciones entre las entidades que conforman el sistema OpenRental. Estas reglas garantizan la consistencia de la información relacionada con personas, sucursales, vehículos, reservas, alquileres, inspecciones, pagos y mantenimiento.

**Módulo de Personas y Roles:**

- Toda Persona debe poseer un identificador único generado automáticamente.
- Toda Persona debe registrar obligatoriamente un tipo y número de documento. El tipo de documento únicamente puede corresponder a DNI, Pasaporte o Carnet de Extranjería.
- La combinación de tipo documento y nro documento debe ser única dentro del sistema.
- Toda Persona debe registrar obligatoriamente nombres, apellidos, teléfono y correo electrónico.
- El correo electrónico de una Persona debe ser único y cumplir con un formato válido.
- Una Persona puede especializarse como Cliente, Empleado, ambos o ninguno.
- Un Cliente debe poseer obligatoriamente un número de licencia de conducir único y una fecha de vencimiento.
- La licencia de conducir de un Cliente debe encontrarse vigente para poder autorizar un alquiler.
- Todo Empleado debe estar asociado obligatoriamente a una Sucursal.
- El cargo de un Empleado únicamente puede ser Recepcionista, Mecánico, Administrador o Supervisor.
- El usuario utilizado para la autenticación de un Empleado debe ser único y su contraseña debe almacenarse únicamente mediante un hash seguro.
- Las entidades Persona y Empleado utilizan borrado lógico mediante el atributo `activo`, preservando la información histórica.

**Módulo de Sucursales:**

- Toda Sucursal debe poseer un identificador único autoincremental.
- El nombre de una Sucursal debe ser único.
- Toda Sucursal debe registrar obligatoriamente ciudad y dirección.
- Una Sucursal puede contener múltiples Vehículos y tener múltiples Empleados asignados.
- Una Sucursal puede ser utilizada como sede de retiro y devolución de múltiples Reservas.
- Las sucursales utilizan borrado lógico mediante el atributo `activo` para conservar la trazabilidad histórica de las operaciones.

**Módulo de Categorías y Flota:**

- Toda Categoría debe poseer un identificador único y un nombre único.
- Toda Categoría debe registrar una tarifa base diaria y un monto de garantía mayores que cero.
- Todo Vehículo debe estar asociado obligatoriamente a una única Categoría.
- Todo Vehículo debe encontrarse asociado a una Sucursal actual.
- La placa de cada Vehículo debe ser única y no contener espacios.
- Todo Vehículo debe registrar obligatoriamente marca, modelo, año, color, transmisión, combustible y capacidad de pasajeros.
- El año del Vehículo debe encontrarse entre 2010 y el año actual más uno.
- La capacidad del Vehículo debe encontrarse entre 2 y 9 pasajeros.
- El kilometraje actual de un Vehículo no puede ser negativo.
- La tarifa diaria específica de un Vehículo, cuando no se encuentre definida, debe tomar como referencia la tarifa base de su Categoría.
- El estado de un Vehículo únicamente puede ser Disponible, Reservado, Alquilado, En mantenimiento o Fuera de servicio.
- Un Vehículo debe utilizar borrado lógico mediante el atributo `activo`, preservando su historial de alquileres y mantenimiento.

**Módulo de Reservas:**

- Toda Reserva debe estar asociada obligatoriamente a un Cliente, una Categoría, una Sucursal de retiro y una Sucursal de devolución.
- Una Reserva puede asociarse opcionalmente a un Vehículo, debido a que la asignación física puede realizarse posteriormente.
- El código de una Reserva debe ser único.
- La fecha de finalización de una Reserva debe ser posterior a la fecha de inicio.
- La tarifa diaria pactada debe congelarse en el momento de creación de la reserva para conservar el precio histórico acordado.
- El estado de una Reserva únicamente puede ser Pendiente, Confirmada, Cancelada, No Show o Completada.
- Una Reserva confirmada no debe generar solapamientos con otra reserva confirmada o alquiler activo para el mismo vehículo durante el intervalo reservado.
- Una Reserva puede cancelarse antes de convertirse en un alquiler, de acuerdo con las condiciones definidas por el sistema.
- Una reserva confirmada se convierte en Completada cuando se genera el alquiler correspondiente y se realiza la entrega física del vehículo.

**Módulo de Alquileres:**

- Todo Alquiler debe originarse a partir de una Reserva.
- Cada Reserva puede originar como máximo un Alquiler.
- El número de contrato de un Alquiler debe ser único.
- Todo Alquiler debe estar asociado obligatoriamente a un Vehículo y a un Empleado responsable de la entrega.
- El empleado responsable de la devolución puede ser diferente al empleado que realizó la entrega.
- La fecha prevista de devolución debe ser posterior o igual a la fecha real de entrega.
- La fecha de devolución real puede permanecer nula mientras el alquiler se encuentre en curso.
- La tarifa diaria aplicada debe conservar el precio pactado para el contrato, independientemente de modificaciones posteriores en las tarifas maestras.
- El estado del Alquiler únicamente puede ser En curso, Finalizado, Atrasado o En disputa.
- Un alquiler no puede ser finalizado sin registrar la devolución del vehículo y la correspondiente liquidación de la garantía.
- Cuando un Alquiler es creado, el estado del Vehículo debe actualizarse automáticamente a Alquilado.
- Cuando se supera la fecha prevista de devolución sin registrar la devolución real, el alquiler debe pasar al estado Atrasado.

**Módulo de Conductores Adicionales:**

- Un Alquiler puede autorizar cero o más conductores adicionales, además del cliente titular del contrato.
- Un Cliente puede figurar como conductor adicional en varios Alquileres distintos, incluso de forma simultánea si los períodos no se solapan.
- Un conductor adicional debe encontrarse registrado previamente como Cliente, dado que la autorización para conducir exige una licencia registrada y vigente.
- Un mismo Cliente no puede ser autorizado dos veces en el mismo Alquiler.
- El conductor adicional no puede coincidir con el cliente titular de la reserva que originó el alquiler, puesto que este último ya se encuentra autorizado por el propio contrato.
- La licencia de conducir del conductor adicional debe encontrarse vigente a la fecha prevista de devolución del vehículo.
- Cada autorización debe registrar obligatoriamente el vínculo declarado con el titular, cuyo dominio únicamente puede ser Cónyuge, Familiar, Colega u Otro.
- Cada autorización debe registrar si la licencia fue verificada físicamente por el empleado al momento de la entrega.
- El recargo aplicado por conductor adicional no puede ser negativo y se congela en el momento de la autorización.

**Módulo de Inspecciones:**

- Todo Alquiler debe poseer obligatoriamente una única Inspección.
- Toda Inspección debe estar asociada a un único Alquiler.
- La inspección debe registrar obligatoriamente el kilometraje de salida y el nivel de combustible de salida.
- El kilometraje de retorno puede permanecer nulo mientras el vehículo no haya sido devuelto.
- Cuando se registre el kilometraje de retorno, este debe ser mayor o igual al kilometraje de salida.
- La inspección puede registrar daños existentes al momento de la entrega y nuevos daños detectados durante la devolución.
- Los cargos adicionales asociados a una inspección no pueden ser negativos.
- Al registrar el kilometraje de retorno, el kilometraje actual del Vehículo debe actualizarse automáticamente.
- Cuando un vehículo sea devuelto sin daños que requieran intervención, su estado debe actualizarse a Disponible.
- Cuando la devolución registre daños que requieran intervención, el estado del Vehículo debe actualizarse a En mantenimiento.

**Módulo de Pagos y Garantías:**

- Todo Pago debe estar asociado obligatoriamente a un Alquiler.
- Todo pago debe registrar obligatoriamente el tipo de transacción, monto, método de pago y fecha.
- El monto de un Pago debe ser estrictamente mayor que cero.
- El tipo de transacción únicamente puede ser Anticipo, Pago de alquiler, Depósito de garantía, Devolución de garantía o Penalidad.
- El método de pago únicamente puede corresponder a Efectivo, Tarjeta de crédito, Tarjeta de débito o Transferencia.
- El estado de un Pago únicamente puede ser Aprobado, Pendiente, Rechazado o Reembolsado.
- Un Alquiler puede registrar múltiples pagos correspondientes a anticipos, garantías, liquidaciones y penalidades.
- Un alquiler no puede finalizarse sin registrar la devolución o aplicación correspondiente del depósito de garantía.

**Módulo de Mantenimiento:**

- Todo Mantenimiento debe estar asociado obligatoriamente a un Vehículo y a un Empleado responsable.
- Todo mantenimiento debe registrar obligatoriamente taller, tipo, descripción, kilometraje al servicio, costo y fecha de inicio.
- El costo de un Mantenimiento no puede ser negativo.
- El kilometraje registrado al ingresar al taller no puede ser negativo.
- El tipo de mantenimiento únicamente puede ser Preventivo, Correctivo o Inspección técnica.
- El estado de un mantenimiento únicamente puede ser Programado, En taller o Completado.
- La fecha de finalización de un mantenimiento puede permanecer nula mientras la intervención se encuentre en ejecución.
- Un Vehículo puede poseer múltiples registros históricos de mantenimiento.
- Cuando un vehículo ingresa a mantenimiento, su estado operativo debe actualizarse a En mantenimiento.
- Un vehículo únicamente puede regresar al estado Disponible cuando el mantenimiento haya sido completado y dado de alta.

**Integridad y Consistencia:**

- Ninguna llave primaria (`PRIMARY KEY`) puede contener valores nulos.
- Toda llave foránea (`FOREIGN KEY`) debe hacer referencia a un registro existente en la entidad correspondiente.
- Las restricciones de integridad referencial deben impedir eliminaciones físicas que comprometan el historial de reservas, alquileres, pagos, inspecciones o mantenimientos.
- Las entidades que requieren conservación histórica, como Persona, Vehículo y Sucursal, deben utilizar borrado lógico mediante el atributo `activo`.
- Las operaciones críticas de reserva, alquiler, devolución y actualización de disponibilidad deben ejecutarse de forma atómica.
- El sistema debe garantizar el control de concurrencia para impedir que dos operaciones simultáneas asignen el mismo vehículo a reservas o alquileres incompatibles.
- El sistema debe impedir el doble *booking* de un mismo vehículo mediante validaciones de solapamiento de intervalos de tiempo.
- Los cambios de estado de Vehículo, Reserva y Alquiler deben respetar las transiciones definidas por sus respectivas máquinas de estados.
- Toda modificación del kilometraje del vehículo derivada de una devolución debe realizarse automáticamente a partir del kilometraje registrado en la Inspección.
- Los valores monetarios correspondientes a tarifas, garantías, pagos, penalidades y costos de mantenimiento no pueden ser negativos.
- Las tarifas utilizadas en reservas y alquileres deben conservarse históricamente mediante un *price snapshot*, evitando que modificaciones posteriores en las tarifas maestras alteren contratos existentes.
- Ningún Alquiler puede utilizar un vehículo que se encuentre simultáneamente en otro alquiler activo o en una reserva confirmada incompatible con el período solicitado.

## 2.3. Modelo Entidad-Relación

La Figura 1 presenta el diagrama Entidad-Relación completo del sistema, construido con la notación descrita en su leyenda. En él se representan las doce entidades del modelo con sus atributos y atributos llave, las relaciones con su multiplicidad y tipo de participación, la jerarquía de especialización y la relación de multiplicidad muchos a muchos con sus atributos propios.

> *[Figura 1: Diagrama Entidad-Relación del sistema OpenRental — imagen no incluida en esta conversión. Contiene las entidades CATEGORIA, VEHICULO, MANTENIMIENTO, RESERVA, PAGO, ALQUILER, INSPECCION, PERSONA, CLIENTE, EMPLEADO y SUCURSAL, y la relación M:N «autoriza» (atributos: parentesco, licencia_verificada, recargo, fecha_registro).]*

## 2.4. Multiplicidad y participación de las relaciones

El diagrama de la Figura 1 representa gráficamente las restricciones estructurales del modelo. La siguiente tabla documenta, para cada relación, su multiplicidad, el tipo de participación de las entidades involucradas y la regla del dominio que justifica dicha decisión. Cada fila corresponde a una regla semántica enunciada en la sección anterior.

| Relación | Multiplicidad | Participación | Justificación |
|---|---|---|---|
| Persona–Cliente | 1:0..1 | Persona parcial, Cliente total | Una persona puede ser solo cliente, solo empleado, ambos o ninguno. |
| Persona–Empleado | 1:0..1 | Persona parcial, Empleado total | Comparte el supertipo evitando duplicar documento y datos de contacto. |
| Sucursal–Vehículo | 1:N | Sucursal parcial, Vehículo total | Todo vehículo se encuentra físicamente en una sucursal. |
| Sucursal–Reserva (retiro) | 1:N | Sucursal parcial, Reserva total | Toda reserva define obligatoriamente una sede de recogida. |
| Sucursal–Reserva (devolución) | 1:N | Sucursal parcial, Reserva total | Permite devolver en una sede distinta a la de retiro. |
| Sucursal–Empleado | 1:N | Sucursal parcial, Empleado total | Todo empleado está asignado a una sucursal base. |
| Categoría–Vehículo | 1:N | Categoría parcial, Vehículo total | Todo vehículo pertenece obligatoriamente a una categoría. |
| Categoría–Reserva | 1:N | Categoría parcial, Reserva total | El cliente reserva una gama garantizada, no una placa. |
| Cliente–Reserva | 1:N | Cliente parcial, Reserva total | Un cliente acumula múltiples reservas históricas. |
| Vehículo–Reserva | 1:0..N | Vehículo parcial, Reserva parcial | El vehículo es opcional al reservar; se asigna antes de despachar. |
| Reserva–Alquiler | 1:0..1 | Reserva parcial, Alquiler total | Todo contrato proviene de una reserva; no toda reserva se concreta. |
| Vehículo–Alquiler | 1:N | Vehículo parcial, Alquiler total | Un vehículo acumula el historial de contratos en que fue alquilado. |
| Empleado–Alquiler (entrega) | 1:N | Empleado parcial, Alquiler total | El empleado que despacha la unidad queda registrado. |
| Empleado–Alquiler (devolución) | 1:N | Empleado parcial, Alquiler parcial | El empleado que recibe puede diferir del que entregó, y es nulo mientras el alquiler está en curso. |
| Cliente–Alquiler (conductor adicional) | M:N | Cliente parcial, Alquiler parcial | Un contrato puede autorizar varios conductores y un cliente puede ser conductor autorizado en varios contratos. |
| Alquiler–Inspección | 1:1 | Alquiler total, Inspección total | Todo contrato cuenta con su acta de check-out y check-in. |
| Alquiler–Pago | 1:N | Alquiler total, Pago total | Soporta anticipo, garantía, liquidación y penalidades por separado. |
| Vehículo–Mantenimiento | 1:N | Vehículo parcial, Mantenimiento total | Historial mecánico acumulado por unidad. |
| Empleado–Mantenimiento | 1:N | Empleado parcial, Mantenimiento total | Registro del responsable de la orden de servicio. |

## 2.5. Jerarquía de especialización

El modelo incorpora una única jerarquía de especialización (Is-A), cuyo supertipo es `PERSONA` y cuyos subtipos son `CLIENTE` y `EMPLEADO`. Las dos restricciones que caracterizan formalmente esta jerarquía son las siguientes:

- **Cobertura parcial (no total).** La especialización no obliga a que toda persona registrada pertenezca a un subtipo. El sistema admite personas que existen únicamente como registro de identidad y contacto, por ejemplo un solicitante cuya reserva fue cancelada antes de verificar su licencia de conducir, o un contacto declarado durante la contratación. Por este motivo la participación de `PERSONA` en ambas relaciones de especialización es parcial.
- **Solapamiento permitido (no disjunta).** Una misma persona puede pertenecer simultáneamente a ambos subtipos. El caso es real y frecuente en el dominio: un empleado de la empresa puede alquilar un vehículo como cliente particular, y debe hacerlo bajo la misma identidad para que su historial de contratos, pagos e infracciones sea trazable. Modelar los subtipos como disjuntos obligaría a duplicar el documento de identidad y los datos de contacto de esa persona, lo cual violaría la propia regla de unicidad de la combinación tipo documento y nro documento.

El atributo discriminante no se almacena de forma explícita: la pertenencia a un subtipo se determina por la existencia de la fila correspondiente en `CLIENTE` o en `EMPLEADO`. Esta decisión es consistente con la cobertura parcial y el solapamiento descritos, ya que un discriminador de valor único no podría representar el caso de una persona que es cliente y empleado a la vez.

## 2.6. Especificaciones y consideraciones sobre el proyecto

Para asegurar la viabilidad técnica, la integridad de los datos y el rendimiento del sistema durante la implementación física en PostgreSQL, se adoptan los siguientes criterios de ingeniería de datos:

- **Estrategia de Normalización:** Las entidades del modelo relacional serán implementadas procurando mantener la Tercera Forma Normal (3FN), separando la información correspondiente a Persona, Cliente, Empleado, Sucursal, Categoría, Vehículo, Reserva, Alquiler, Inspección, Pago y Mantenimiento. Esta separación permite reducir la redundancia y mantener la consistencia de los datos durante las operaciones del sistema.
- **Estandarización de Nomenclatura en la Capa de Persistencia:** Durante la implementación física se utilizarán nombres de tablas y atributos compatibles con PostgreSQL, evitando espacios en blanco, caracteres especiales y nombres ambiguos. Se empleará una nomenclatura uniforme basada en minúsculas y guiones bajos, como `id_persona`, `id_vehiculo`, `fecha_inicio` e `id_sucursal_retiro`. Esto facilita la escritura de consultas SQL y mantiene una estructura consistente en toda la base de datos.
- **Integridad Referencial:** Todas las relaciones entre entidades serán implementadas mediante restricciones `FOREIGN KEY`, garantizando que una reserva, alquiler, pago, inspección o mantenimiento únicamente pueda referenciar registros existentes. Las restricciones de integridad deberán impedir operaciones de eliminación que comprometan el historial de las operaciones realizadas.
- **Control de Estados:** Los atributos de estado de Vehículo, Reserva, Alquiler, Pago y Mantenimiento serán restringidos a los valores definidos por el dominio de cada entidad. Las transiciones entre estados deberán respetar los ciclos de vida establecidos para evitar inconsistencias en el proceso de alquiler.
- **Conservación de Información Histórica:** Las entidades Persona, Vehículo y Sucursal utilizarán un mecanismo de borrado lógico mediante el atributo `activo`. De esta manera, los registros podrán mantenerse disponibles para consultas históricas y no se perderá la trazabilidad de reservas, alquileres, pagos y mantenimientos previamente registrados.
- **Congelamiento de Tarifas Históricas:** Las tarifas pactadas en Reserva y Alquiler serán almacenadas directamente en sus respectivos registros mediante los atributos `tarifa_diaria_pactada` y `tarifa_diaria_aplicada`. Esto evita que una modificación posterior de las tarifas de una Categoría o Vehículo altere el valor económico de operaciones históricas.
- **Control de Solapamiento de Reservas:** La implementación deberá impedir que un mismo Vehículo sea asignado simultáneamente a dos reservas confirmadas o a un alquiler activo dentro de intervalos de tiempo incompatibles. Esta validación podrá implementarse mediante restricciones, consultas de validación y/o `TRIGGER` según corresponda a la implementación física.
- **Control de Concurrencia:** Las operaciones críticas relacionadas con reservas, asignación de vehículos, alquileres y devoluciones deberán ejecutarse considerando el control de concurrencia y aislamiento proporcionado por PostgreSQL. El objetivo es evitar que dos transacciones simultáneas asignen el mismo vehículo o produzcan estados inconsistentes en la disponibilidad de la flota.
- **Automatización mediante Triggers:** Se utilizarán `TRIGGER` para automatizar determinadas reglas de negocio que dependan de modificaciones en los registros. Entre ellas se considera la actualización del kilometraje actual del Vehículo a partir del kilometraje de retorno registrado en Inspección, así como la sincronización del estado del vehículo después de una entrega, devolución o ingreso a mantenimiento.
- **Integridad de Valores Monetarios:** Los atributos correspondientes a tarifas, garantías, pagos, penalidades y costos de mantenimiento deberán utilizar tipos numéricos con precisión decimal. Los montos económicos no podrán asumir valores negativos y deberán conservar una precisión adecuada para operaciones financieras.
- **Integridad Temporal:** Las fechas y horas utilizadas en Reserva, Alquiler e Inspección deberán mantener relaciones temporales válidas. Por ejemplo, la fecha de finalización de una reserva debe ser posterior a su fecha de inicio, la fecha prevista de devolución debe ser posterior o igual a la fecha de entrega y el kilometraje de retorno debe ser mayor o igual al kilometraje registrado en la salida.
- **Índices para Optimización de Consultas:** Se crearán índices sobre las columnas utilizadas frecuentemente en búsquedas, relaciones y validaciones, especialmente sobre llaves foráneas y atributos únicos como `nro_documento`, `email`, `placa`, `codigo_reserva` y `nro_contrato`. Estos índices permitirán reducir el costo de las consultas relacionadas con disponibilidad, reservas, alquileres y operaciones históricas.
- **Atomicidad de Operaciones Críticas:** Las operaciones que involucren modificaciones simultáneas sobre varias entidades deberán ejecutarse dentro de transacciones para garantizar que los cambios se confirmen completamente o sean revertidos en caso de error. Esto resulta especialmente importante durante la creación de alquileres, devolución de vehículos, actualización de inspecciones y liquidación de pagos.

---

# Capítulo 3: Modelo Relacional

## 3.1. Transformación del modelo E/R al modelo relacional

La conversión del modelo conceptual al modelo relacional se realizó aplicando de forma sistemática las reglas de transformación correspondientes a cada construcción presente en el diagrama. A continuación se documenta cada decisión y la regla que la sustenta.

### 3.1.1. Transformación de entidades fuertes

Las entidades `SUCURSAL`, `PERSONA`, `CATEGORIA` y `VEHICULO` poseen identidad propia e independiente, por lo que cada una originó una relación con clave primaria artificial autoincremental (`id_sucursal`, `id_persona`, `id_categoria`, `id_vehiculo`). Se optó por claves artificiales en lugar de claves naturales por dos razones. Primero, el modelo debe admitir clientes extranjeros, de modo que el documento de identidad no constituye un identificador de formato uniforme; su unicidad se preserva mediante una restricción `UNIQUE` sobre la combinación `tipo_documento` y `nro_documento`, que actúa como clave candidata. Segundo, la placa de un vehículo puede ser reasignada administrativamente, por lo que se conserva como clave candidata `UNIQUE` pero no como clave primaria, evitando la propagación de dicho cambio a todas las relaciones que lo referencian.

### 3.1.2. Transformación de la jerarquía de especialización

Para la jerarquía `PERSONA` con subtipos `CLIENTE` y `EMPLEADO` se evaluaron las tres estrategias habituales:

1. **Tabla única con atributos nulos.** Consistiría en una sola relación `PERSONA` que incorpore los atributos de ambos subtipos. Se descartó porque obligaría a dejar en nulo los atributos de licencia de conducir en cada empleado y los atributos de autenticación en cada cliente, imposibilitando declarar `NOT NULL` sobre `nro_licencia`, que es un requisito legal indispensable para contratar el servicio.
2. **Una tabla por subtipo, sin supertipo.** Consistiría en eliminar `PERSONA` y replicar sus atributos en `CLIENTE` y `EMPLEADO`. Se descartó porque la jerarquía admite solapamiento: una persona que es cliente y empleado a la vez quedaría duplicada, lo que introduciría redundancia en sus datos de contacto y haría imposible garantizar la unicidad global del documento de identidad y del correo electrónico.
3. **Tablas separadas con clave primaria compartida (estrategia adoptada).** El supertipo `PERSONA` conserva los atributos comunes, y cada subtipo origina una relación cuya clave primaria es simultáneamente clave foránea hacia `PERSONA`. Esta estrategia es la única compatible con las dos restricciones de la jerarquía descritas en el capítulo anterior: la cobertura parcial se representa por la simple ausencia de fila en el subtipo, y el solapamiento por la existencia de una fila en cada uno con el mismo `id_persona`.

### 3.1.3. Transformación de relaciones uno a muchos

Las relaciones de multiplicidad 1:N se transformaron propagando la clave primaria del lado uno como clave foránea en la relación del lado muchos. Así, `VEHICULO` recibe `id_categoria` e `id_sucursal_actual`; `EMPLEADO` recibe `id_sucursal`; `PAGO` recibe `id_alquiler`; y `MANTENIMIENTO` recibe `id_vehiculo` e `id_empleado`.

La participación total del lado muchos se expresa declarando la clave foránea como `NOT NULL`, y la participación parcial permitiendo el valor nulo.

Merecen mención particular las relaciones que aparecen más de una vez entre el mismo par de entidades. La relación entre `SUCURSAL` y `RESERVA` existe dos veces con significados distintos, retiro y devolución, por lo que originó dos claves foráneas con nombres de rol diferenciados (`id_sucursal_retiro` e `id_sucursal_devolucion`) hacia la misma relación referenciada. El mismo criterio se aplicó a `EMPLEADO` y `ALQUILER`, que origina `id_empleado_entrega` e `id_empleado_devolucion`. Nombrar el rol resulta indispensable: sin ello el esquema perdería la distinción semántica entre quién despachó y quién recibió el vehículo, que es precisamente la información que permite auditar la operación.

### 3.1.4. Transformación de relaciones uno a uno

Las relaciones `RESERVA`–`ALQUILER` e `ALQUILER`–`INSPECCION` poseen multiplicidad 1:1. En ambos casos la clave foránea se colocó en el lado de participación total, es decir en la relación cuya existencia depende de la otra, y se acompañó de una restricción `UNIQUE` sobre dicha clave foránea.

Esta restricción `UNIQUE` es el elemento que preserva la semántica del modelo conceptual y no debe omitirse: una clave foránea sin ella expresa una relación 1:N, de modo que el esquema relacional permitiría registrar dos contratos de alquiler originados en la misma reserva, o dos actas de inspección para un mismo contrato, contradiciendo las reglas semánticas enunciadas. La participación total del lado dependiente se expresa adicionalmente mediante `NOT NULL`: todo alquiler exige una reserva de origen y toda inspección exige un contrato asociado.

### 3.1.5. Transformación de la relación muchos a muchos

El modelo conceptual contiene una relación de multiplicidad M:N: la autorización de conductores adicionales, que vincula `ALQUILER` con `CLIENTE`. Un contrato puede autorizar a varias personas a conducir el vehículo además del titular, y una misma persona puede figurar como conductor autorizado en contratos distintos a lo largo del tiempo.

Aplicando la regla de transformación correspondiente, esta relación originó una relación intermedia, `CONDUCTOR ADICIONAL`, cuya clave primaria es la concatenación de las claves primarias de las dos entidades participantes, (`id_alquiler`, `id_cliente`), y que incorpora además los atributos propios de la relación: el vínculo declarado con el titular, la constancia de verificación de la licencia y el recargo aplicado.

Dos decisiones de esta transformación merecen justificación. La primera es que la relación se estableció con el subtipo `CLIENTE` y no con el supertipo `PERSONA`. El motivo es que la condición para conducir un vehículo de la empresa es poseer una licencia registrada y vigente, que es precisamente el atributo que define al subtipo `CLIENTE`; vincular la relación a `PERSONA` obligaría a replicar en la relación intermedia el número y el vencimiento de la licencia, introduciendo una redundancia que el modelo ya resuelve mediante la especialización.

La segunda es que la clave primaria compuesta cumple una función semántica y no meramente técnica: impide de forma declarativa que un mismo cliente sea autorizado dos veces en el mismo contrato, que es una de las reglas del dominio enunciadas en el capítulo anterior. Una clave artificial adicional habría obligado a expresar esa misma regla mediante una restricción `UNIQUE` separada.

### 3.1.6. Ausencia de entidades débiles

El modelo conceptual no contiene entidades débiles. Se evaluó en particular si `INSPECCION` debía modelarse como entidad débil identificada por `ALQUILER`, con clave parcial de tipo de inspección. Se optó por una entidad fuerte con clave artificial y una clave candidata `UNIQUE` sobre `id_alquiler`, decisión que se discute en el capítulo de normalización.

Cabe observar que `CONDUCTOR ADICIONAL` no constituye una entidad débil, pese a que su clave primaria incluye las claves de otras dos relaciones. La diferencia es que no representa un objeto con identidad propia que dependa de un propietario, sino el hecho que asocia a dos entidades preexistentes, por lo que corresponde a la transformación de una relación M:N y no a una entidad débil con relación identificadora.

### 3.1.7. Transformación de atributos y dominios

Todos los atributos del modelo conceptual son simples y monovaluados, por lo que se transformaron directamente en columnas. Los atributos cuyo dominio es un conjunto cerrado de valores (`tipo_documento`, `cargo`, `transmision`, `combustible`, los distintos `estado`, `tipo_transaccion`, `metodo_pago` y los niveles de combustible) se restringen mediante tipos enumerados, garantizando a nivel de esquema los dominios declarados en las reglas semánticas.

## 3.2. Modelo relacional

Se presenta a continuación el esquema resultante. Las claves primarias aparecen en **negrita** (subrayadas en el original), las claves foráneas se denotan mediante el nombre de la relación referenciada (`Relación.atributo`), y se indica explícitamente cuáles atributos admiten valores nulos (`NULL`) y cuáles constituyen claves candidatas (`UNIQUE`).

**Sucursal**(**id_sucursal**:int, nombre:varchar(50) UNIQUE, ciudad:varchar(50), direccion:varchar(150), telefono:varchar(20) NULL, activo:boolean)

**Persona**(**id_persona**:int, tipo_documento:enum, nro_documento:varchar(20), nombres:varchar(60), apellidos:varchar(60), telefono:varchar(20), email:varchar(100) UNIQUE, activo:boolean)
Clave candidata compuesta: UNIQUE(tipo_documento, nro_documento)

**Cliente**(**Persona.id_persona**:int, nro_licencia:varchar(20) UNIQUE, licencia_vencimiento:date, pais_licencia:varchar(50), direccion:varchar(150), fecha_registro:timestamp)

**Empleado**(**Persona.id_persona**:int, Sucursal.id_sucursal:int, cargo:enum, usuario:varchar(30) UNIQUE, password_hash:varchar(255))

**Categoria**(**id_categoria**:int, nombre:varchar(40) UNIQUE, descripcion:text NULL, tarifa_base_diaria:decimal(10,2), monto_garantia_base:decimal(10,2))

**Vehiculo**(**id_vehiculo**:int, placa:varchar(10) UNIQUE, Categoria.id_categoria:int, Sucursal.id_sucursal_actual:int, marca:varchar(30), modelo:varchar(30), anio:smallint, color:varchar(20), transmision:enum, combustible:enum, capacidad_pasajeros:smallint, kilometraje_actual:int, tarifa_diaria:decimal(10,2) NULL, estado:enum, activo:boolean)

**Reserva**(**id_reserva**:int, codigo_reserva:varchar(12) UNIQUE, Cliente.id_cliente:int, Categoria.id_categoria:int, Vehiculo.id_vehiculo:int NULL, Sucursal.id_sucursal_retiro:int, Sucursal.id_sucursal_devolucion:int, fecha_inicio:timestamp, fecha_fin:timestamp, tarifa_diaria_pactada:decimal(10,2), total_estimado:decimal(10,2), estado:enum)

**Alquiler**(**id_alquiler**:int, nro_contrato:varchar(20) UNIQUE, Reserva.id_reserva:int UNIQUE, Vehiculo.id_vehiculo:int, Empleado.id_empleado_entrega:int, Empleado.id_empleado_devolucion:int NULL, fecha_entrega:timestamp, fecha_dev_prevista:timestamp, fecha_dev_real:timestamp NULL, tarifa_diaria_aplicada:decimal(10,2), costo_total_final:decimal(10,2) NULL, estado:enum)

**Inspeccion**(**id_inspeccion**:int, Alquiler.id_alquiler:int UNIQUE, km_salida:int, km_retorno:int NULL, combustible_salida:enum, combustible_retorno:enum NULL, danos_salida:text NULL, danos_retorno:text NULL, cargos_adicionales:decimal(10,2))

**Conductor_Adicional**(**Alquiler.id_alquiler**:int, **Cliente.id_cliente**:int, parentesco:enum, licencia_verificada:boolean, recargo:decimal(10,2), fecha_registro:timestamp)
Clave primaria compuesta: (id_alquiler, id_cliente). Relación intermedia derivada de la relación M:N *autoriza*.

**Pago**(**id_pago**:int, Alquiler.id_alquiler:int, tipo_transaccion:enum, monto:decimal(10,2), metodo_pago:enum, referencia_operacion:varchar(50) NULL, fecha_pago:timestamp, estado:enum)

**Mantenimiento**(**id_mantenimiento**:int, Vehiculo.id_vehiculo:int, Empleado.id_empleado:int, taller:varchar(80), tipo:enum, descripcion:text, km_al_servicio:int, costo:decimal(10,2), fecha_inicio:date, fecha_fin:date NULL, estado:enum)

Todos los atributos no marcados con `NULL` se declaran `NOT NULL`. Las restricciones `UNIQUE` sobre `Alquiler.id_reserva` e `Inspeccion.id_alquiler` son las que materializan en el esquema relacional las relaciones de multiplicidad 1:1 definidas en el modelo conceptual.

### 3.2.1. Correspondencia de tipos con PostgreSQL

El esquema anterior se expresa con tipos genéricos del modelo relacional. Dado que la implementación se realizará sobre PostgreSQL, se precisa a continuación la correspondencia con los tipos nativos del gestor, de modo que el diseño sea directamente traducible a sentencias `CREATE TABLE`:

- Los identificadores declarados como `int` autoincremental se implementan mediante `integer GENERATED ALWAYS AS IDENTITY`, que es la forma normalizada por el estándar SQL y recomendada actualmente en PostgreSQL frente al tipo `serial`.
- Los atributos de fecha y hora se implementan con `timestamp`, de 8 bytes de precisión. Se emplea este tipo y no `date` en reservas, alquileres y pagos porque el cálculo de los períodos de veinticuatro horas y de los recargos por devolución tardía exige precisión horaria.
- Los atributos declarados como `enum` se implementan mediante tipos enumerados propios, creados con `CREATE TYPE ... AS ENUM`. Esta construcción permite que los dominios cerrados definidos en las reglas semánticas, como los estados de vehículo, reserva, alquiler y pago, queden garantizados por el sistema de tipos y no dependan de restricciones `CHECK` escritas en cada tabla.
- Los valores monetarios se implementan con `numeric(10,2)`, tipo de precisión decimal exacta. Se descarta deliberadamente el uso de tipos de punto flotante, que introducirían errores de redondeo inadmisibles en tarifas, garantías y liquidaciones.
- Los tipos `varchar(n)`, `text`, `smallint`, `date` y `boolean` corresponden directamente a tipos nativos de PostgreSQL y no requieren adaptación.

## 3.3. Diccionario de datos

El diccionario de datos describe, para cada relación del esquema, el nombre de cada atributo, su tipo de dato, su condición de clave y el dominio y significado que asume dentro del sistema. Las restricciones de dominio aquí consignadas corresponden a las reglas semánticas enunciadas en el capítulo anterior y constituyen la especificación que la implementación en PostgreSQL debe hacer cumplir.

### Tabla: Sucursal

Sedes físicas de la empresa desde las cuales se retiran y devuelven los vehículos.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_sucursal` | int | PK | Identificador autoincremental de la sede. |
| `nombre` | varchar(50) | UNIQUE | Denominación de la sede. No admite duplicados. |
| `ciudad` | varchar(50) | - | Ciudad donde opera la sede. Obligatorio. |
| `direccion` | varchar(150) | - | Dirección física completa. Obligatorio. |
| `telefono` | varchar(20) | - | Teléfono de contacto. Admite nulo. |
| `activo` | boolean | - | Bandera de borrado lógico. Por defecto verdadero. Permite retirar una sede conservando el historial de operaciones asociadas. |

### Tabla: Persona

Supertipo que concentra los datos de identidad y contacto comunes a cualquier persona registrada en el sistema.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_persona` | int | PK | Identificador autoincremental de la persona. |
| `tipo_documento` | enum | UNIQUE* | Dominio cerrado: DNI, PASAPORTE, CARNET_EXTRANJERIA. Permite registrar clientes nacionales y extranjeros. |
| `nro_documento` | varchar(20) | UNIQUE* | Número del documento de identidad. Obligatorio. |
| `nombres` | varchar(60) | - | Nombres de la persona. Obligatorio. |
| `apellidos` | varchar(60) | - | Apellidos de la persona. Obligatorio. |
| `telefono` | varchar(20) | - | Teléfono de contacto. Obligatorio, requerido durante la vigencia del alquiler. |
| `email` | varchar(100) | UNIQUE | Correo electrónico. Obligatorio, único y validado por formato. |
| `activo` | boolean | - | Bandera de borrado lógico. Por defecto verdadero. |

\* `tipo_documento` y `nro_documento` forman conjuntamente una clave candidata UNIQUE compuesta; ninguno de los dos es único por separado.

### Tabla: Cliente

Subtipo de Persona que agrega los requisitos legales indispensables para conducir y contratar el servicio.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `Persona.id_persona` | int | PK, FK | Clave compartida con el supertipo Persona. Su existencia determina que la persona es cliente. |
| `nro_licencia` | varchar(20) | UNIQUE | Número de licencia de conducir. Obligatorio y único. |
| `licencia_vencimiento` | date | - | Fecha de caducidad de la licencia. Debe ser posterior a la fecha prevista de devolución para autorizar un contrato. |
| `pais_licencia` | varchar(50) | - | País emisor de la licencia. |
| `direccion` | varchar(150) | - | Domicilio habitual del cliente. |
| `fecha_registro` | timestamp | - | Momento de alta del cliente. Por defecto la fecha y hora actual. |

### Tabla: Empleado

Subtipo de Persona que representa al personal que interviene en despachos, recepciones y mantenimiento.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `Persona.id_persona` | int | PK, FK | Clave compartida con el supertipo Persona. Su existencia determina que la persona es empleado. |
| `Sucursal.id_sucursal` | int | FK | Sede base a la que está asignado. Obligatorio: todo empleado pertenece a una sucursal. |
| `cargo` | enum | - | Dominio cerrado: RECEPCIONISTA, MECANICO, ADMINISTRADOR, SUPERVISOR. Determina las operaciones que puede registrar. |
| `usuario` | varchar(30) | UNIQUE | Identificador de acceso al sistema. Único. |
| `password_hash` | varchar(255) | - | Hash criptográfico de la contraseña. Nunca se almacena en texto plano. |

### Tabla: Categoria

Segmenta la flota por gama y fija la tarifa y la garantía de referencia.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_categoria` | int | PK | Identificador autoincremental de la categoría. |
| `nombre` | varchar(40) | UNIQUE | Denominación comercial de la gama. Único. |
| `descripcion` | text | - | Detalle de características y comodidades. Admite nulo. |
| `tarifa_base_diaria` | decimal(10,2) | - | Precio diario de referencia. Debe ser mayor que cero. |
| `monto_garantia_base` | decimal(10,2) | - | Depósito en garantía exigido. Debe ser mayor que cero. |

### Tabla: Vehiculo

Cada unidad física de la flota, con su ficha técnica y su estado operativo.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_vehiculo` | int | PK | Identificador autoincremental de la unidad. |
| `placa` | varchar(10) | UNIQUE | Placa de rodaje. Única y sin espacios. Es clave candidata, no primaria, porque puede ser reasignada. |
| `Categoria.id_categoria` | int | FK | Gama a la que pertenece. Obligatorio. |
| `Sucursal.id_sucursal_actual` | int | FK | Sede donde se encuentra físicamente la unidad. Obligatorio. |
| `marca` | varchar(30) | - | Fabricante del vehículo. Obligatorio. |
| `modelo` | varchar(30) | - | Modelo del vehículo. Obligatorio. |
| `anio` | smallint | - | Año de fabricación. Rango válido: entre 2010 y el año actual más uno. |
| `color` | varchar(20) | - | Color de la carrocería. Obligatorio. |
| `transmision` | enum | - | Dominio cerrado: MECANICA, AUTOMATICA. |
| `combustible` | enum | - | Dominio cerrado: GASOLINA, DIESEL, HIBRIDO, ELECTRICO, GLP. |
| `capacidad_pasajeros` | smallint | - | Número de plazas. Rango válido: de 2 a 9. |
| `kilometraje_actual` | int | - | Lectura vigente del odómetro. No puede ser negativo. Se actualiza automáticamente a partir del kilometraje de retorno registrado en la inspección. |
| `tarifa_diaria` | decimal(10,2) | - | Tarifa específica de la unidad. Admite nulo; en ese caso rige la tarifa base de su categoría. |
| `estado` | enum | - | Dominio cerrado: DISPONIBLE, RESERVADO, ALQUILADO, EN_MANTENIMIENTO, FUERA_DE_SERVICIO. Las transiciones respetan la máquina de estados del vehículo. |
| `activo` | boolean | - | Bandera de borrado lógico. Preserva el historial de alquileres y mantenimientos de una unidad retirada. |

### Tabla: Reserva

Registra la intención de alquiler. Admite reservar una categoría garantizada antes de asignar una placa concreta.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_reserva` | int | PK | Identificador autoincremental de la reserva. |
| `codigo_reserva` | varchar(12) | UNIQUE | Código alfanumérico legible entregado al cliente. Único. |
| `Cliente.id_cliente` | int | FK | Cliente que solicita la reserva. Obligatorio. |
| `Categoria.id_categoria` | int | FK | Gama solicitada y garantizada al cliente. Obligatorio. |
| `Vehiculo.id_vehiculo` | int | FK | Unidad asignada. Admite nulo, ya que la asignación física puede diferirse hasta antes de la entrega. |
| `Sucursal.id_sucursal_retiro` | int | FK | Sede pactada de recogida. Obligatorio. |
| `Sucursal.id_sucursal_devolucion` | int | FK | Sede pactada de retorno. Obligatorio; puede diferir de la de retiro. |
| `fecha_inicio` | timestamp | - | Fecha y hora pactadas para el retiro. |
| `fecha_fin` | timestamp | - | Fecha y hora pactadas para la devolución. Debe ser posterior a `fecha_inicio`. |
| `tarifa_diaria_pactada` | decimal(10,2) | - | Tarifa diaria congelada al reservar. Conserva el precio histórico acordado. No puede ser negativa. |
| `total_estimado` | decimal(10,2) | - | Costo estimado según la tarifa pactada y el período solicitado. |
| `estado` | enum | - | Dominio cerrado: PENDIENTE, CONFIRMADA, CANCELADA, NO_SHOW, COMPLETADA. Las transiciones respetan la máquina de estados de la reserva. |

### Tabla: Alquiler

Contrato de tenencia física del vehículo. Todo alquiler se origina en una reserva previa.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_alquiler` | int | PK | Identificador autoincremental del contrato. |
| `nro_contrato` | varchar(20) | UNIQUE | Foliado legal del contrato. Único. |
| `Reserva.id_reserva` | int | FK, UNIQUE | Reserva que originó el contrato. Obligatorio y único: la restricción UNIQUE es la que materializa la relación 1:1 con Reserva. |
| `Vehiculo.id_vehiculo` | int | FK | Unidad efectivamente entregada. Obligatorio. |
| `Empleado.id_empleado_entrega` | int | FK | Empleado responsable del despacho. Obligatorio. |
| `Empleado.id_empleado_devolucion` | int | FK | Empleado que recibe la unidad. Admite nulo mientras el alquiler está en curso; puede diferir del de entrega. |
| `fecha_entrega` | timestamp | - | Fecha y hora real de entrega de llaves. |
| `fecha_dev_prevista` | timestamp | - | Fecha y hora pactadas de retorno. Debe ser posterior o igual a `fecha_entrega`. |
| `fecha_dev_real` | timestamp | - | Fecha y hora real de retorno. Admite nulo mientras el alquiler está en curso. |
| `tarifa_diaria_aplicada` | decimal(10,2) | - | Tarifa diaria congelada para el contrato. No puede ser negativa. |
| `costo_total_final` | decimal(10,2) | - | Liquidación final: días reales, cargos adicionales y penalidades. Admite nulo hasta el cierre del contrato. |
| `estado` | enum | - | Dominio cerrado: EN_CURSO, FINALIZADO, ATRASADO, EN_DISPUTA. No puede pasar a FINALIZADO sin devolución registrada y garantía liquidada. |

### Tabla: Inspeccion

Acta de inspección del vehículo. Registra el estado de la unidad en la entrega (check-out) y en la devolución (check-in).

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_inspeccion` | int | PK | Identificador autoincremental del acta. |
| `Alquiler.id_alquiler` | int | FK, UNIQUE | Contrato inspeccionado. Obligatorio y único: la restricción UNIQUE materializa la relación 1:1 con Alquiler. |
| `km_salida` | int | - | Lectura del odómetro al entregar la unidad. Obligatorio, no negativo. |
| `km_retorno` | int | - | Lectura del odómetro al recibirla. Admite nulo hasta la devolución. Debe ser mayor o igual a `km_salida`. |
| `combustible_salida` | enum | - | Dominio cerrado: VACIO, 1/4, 1/2, 3/4, LLENO. Obligatorio. |
| `combustible_retorno` | enum | - | Mismo dominio. Admite nulo hasta la devolución. |
| `danos_salida` | text | - | Daños preexistentes declarados en la entrega. Admite nulo. |
| `danos_retorno` | text | - | Daños nuevos detectados en la devolución. Admite nulo. Si son daños que requieren intervención, el vehículo pasa a EN_MANTENIMIENTO. |
| `cargos_adicionales` | decimal(10,2) | - | Cargos por combustible faltante, limpieza o daños. Por defecto cero. No puede ser negativo. |

### Tabla: Conductor_Adicional

Relación intermedia que registra qué clientes quedan autorizados a conducir el vehículo de un contrato, además del titular.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `Alquiler.id_alquiler` | int | PK, FK | Contrato sobre el que se otorga la autorización. Forma parte de la clave primaria compuesta. |
| `Cliente.id_cliente` | int | PK, FK | Cliente autorizado a conducir. Forma parte de la clave primaria compuesta, lo que impide autorizarlo dos veces en el mismo contrato. Debe ser distinto del titular de la reserva. |
| `parentesco` | enum | - | Dominio cerrado: CONYUGE, FAMILIAR, COLEGA, OTRO. Vínculo declarado con el titular del contrato. |
| `licencia_verificada` | boolean | - | Indica si el empleado verificó físicamente la licencia al momento de la entrega. Por defecto falso. |
| `recargo` | decimal(10,2) | - | Cargo aplicado por conductor adicional, congelado al autorizar. No puede ser negativo. |
| `fecha_registro` | timestamp | - | Momento en que se registró la autorización. Por defecto la fecha y hora actual. |

### Tabla: Pago

Transacciones económicas asociadas a un contrato: anticipos, garantías, liquidaciones, devoluciones y penalidades.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_pago` | int | PK | Identificador autoincremental de la transacción. |
| `Alquiler.id_alquiler` | int | FK | Contrato al que se imputa la transacción. Obligatorio. |
| `tipo_transaccion` | enum | - | Dominio cerrado: ANTICIPO, PAGO_ALQUILER, DEPOSITO_GARANTIA, DEVOLUCION_GARANTIA, PENALIDAD. |
| `monto` | decimal(10,2) | - | Importe de la transacción. Estrictamente mayor que cero. |
| `metodo_pago` | enum | - | Dominio cerrado: EFECTIVO, TARJETA_CREDITO, TARJETA_DEBITO, TRANSFERENCIA. |
| `referencia_operacion` | varchar(50) | - | Número de voucher, autorización bancaria o comprobante de transferencia. Admite nulo. |
| `fecha_pago` | timestamp | - | Momento de la transacción. Por defecto la fecha y hora actual. |
| `estado` | enum | - | Dominio cerrado: APROBADO, PENDIENTE, RECHAZADO, REEMBOLSADO. |

### Tabla: Mantenimiento

Historial de intervenciones técnicas, servicios preventivos y reparaciones de cada unidad.

| Atributo | Tipo de Dato | Llave | Dominio y significado |
|---|---|---|---|
| `id_mantenimiento` | int | PK | Identificador autoincremental de la orden de servicio. |
| `Vehiculo.id_vehiculo` | int | FK | Unidad intervenida. Obligatorio. |
| `Empleado.id_empleado` | int | FK | Empleado responsable de la orden. Obligatorio. |
| `taller` | varchar(80) | - | Taller interno o proveedor externo. Obligatorio. |
| `tipo` | enum | - | Dominio cerrado: PREVENTIVO, CORRECTIVO, INSPECCION_TECNICA. |
| `descripcion` | text | - | Detalle del trabajo realizado. Obligatorio. |
| `km_al_servicio` | int | - | Kilometraje al ingresar al taller. No puede ser negativo. |
| `costo` | decimal(10,2) | - | Costo de la intervención. No puede ser negativo. |
| `fecha_inicio` | date | - | Fecha de ingreso al taller. Obligatorio. |
| `fecha_fin` | date | - | Fecha de alta y reincorporación a la flota. Admite nulo mientras la intervención está en ejecución. |
| `estado` | enum | - | Dominio cerrado: PROGRAMADO, EN_TALLER, COMPLETADO. El vehículo solo regresa a DISPONIBLE cuando el mantenimiento está COMPLETADO. |

## 3.4. Normalización

El esquema presentado se encuentra en Tercera Forma Normal (3FN). A continuación se justifica dicha afirmación relación por relación mediante el análisis de sus dependencias funcionales, y se documentan las anomalías concretas que el diseño evita. Finalmente se discuten de forma explícita las tres decisiones del modelo que, observadas aisladamente, podrían interpretarse como redundancia.

### 3.4.1. Dependencias funcionales del esquema

En todas las relaciones del esquema la clave primaria determina funcionalmente al resto de los atributos, y no existen dependencias funcionales entre atributos no primos. Las dependencias relevantes son las siguientes:

- `id_sucursal` → `nombre`, `ciudad`, `direccion`, `telefono`, `activo`. Adicionalmente `nombre` → `id_sucursal`, al ser clave candidata.
- `id_persona` → `tipo_documento`, `nro_documento`, `nombres`, `apellidos`, `telefono`, `email`, `activo`. Adicionalmente (`tipo_documento`, `nro_documento`) → `id_persona` y `email` → `id_persona`, al ser claves candidatas.
- `id_persona` → `nro_licencia`, `licencia_vencimiento`, `pais_licencia`, `direccion`, `fecha_registro` en Cliente, y → `id_sucursal`, `cargo`, `usuario`, `password_hash` en Empleado.
- `id_categoria` → `nombre`, `descripcion`, `tarifa_base_diaria`, `monto_garantia_base`.
- `id_vehiculo` → `placa`, `id_categoria`, `id_sucursal_actual`, `marca`, `modelo`, `anio`, `color`, `transmision`, `combustible`, `capacidad_pasajeros`, `kilometraje_actual`, `tarifa_diaria`, `estado`, `activo`. Adicionalmente `placa` → `id_vehiculo`.
- `id_reserva` → el resto de los atributos de Reserva; y `codigo_reserva` → `id_reserva`.
- `id_alquiler` → el resto de los atributos de Alquiler; y tanto `nro_contrato` → `id_alquiler` como `id_reserva` → `id_alquiler`, esta última por la restricción UNIQUE que sostiene la relación 1:1.
- `id_inspeccion` → el resto de los atributos de Inspeccion; y `id_alquiler` → `id_inspeccion`.
- (`id_alquiler`, `id_cliente`) → `parentesco`, `licencia_verificada`, `recargo`, `fecha_registro` en Conductor_Adicional. Se trata de la única relación del esquema con clave primaria compuesta.
- `id_pago` → el resto de los atributos de Pago.
- `id_mantenimiento` → el resto de los atributos de Mantenimiento.

### 3.4.2. Verificación de las formas normales

**Primera Forma Normal.** Todos los atributos del esquema son atómicos y monovaluados. No existen atributos compuestos ni multivaluados, ni grupos repetidos dentro de una misma fila. Merece justificación el caso de los atributos de texto libre `danos_salida` y `danos_retorno`, que describen los daños observados: se consideran atómicos porque el sistema los trata como una observación única e indivisible del inspector, y no se requiere consultarlos ni agregarlos por daño individual. Si el dominio exigiera cuantificar daños por pieza del vehículo, estos atributos tendrían que descomponerse en una relación propia; el alcance definido para el proyecto no lo requiere.

**Segunda Forma Normal.** En todas las relaciones salvo una, el cumplimiento es inmediato: poseen claves primarias formadas por un único atributo, de modo que no puede existir dependencia funcional parcial de un atributo no primo respecto de una parte de la clave. Esta es una consecuencia directa de la decisión de emplear claves artificiales descrita en la sección de transformación.

La única relación que requiere verificación explícita es `CONDUCTOR ADICIONAL`, cuya clave primaria es compuesta. Debe comprobarse que ninguno de sus atributos no primos dependa únicamente de `id_alquiler` o únicamente de `id_cliente`:

- `parentesco` expresa el vínculo del conductor autorizado con el titular de ese contrato. La misma persona puede ser cónyuge del titular en un contrato y colega del titular en otro, de modo que el atributo depende de ambas partes de la clave.
- `licencia_verificada` registra la verificación realizada en la entrega de ese contrato. Una licencia verificada hoy puede haber vencido en un contrato posterior, por lo que el valor depende igualmente de ambas partes.
- `recargo` corresponde al importe pactado por ese conductor en ese contrato, sujeto a la tarifa vigente al momento de autorizar, y por lo tanto depende de ambas partes.
- `fecha_registro` indica cuándo se otorgó esa autorización concreta, que es un hecho propio del par.

Resulta pertinente señalar el error que esta verificación previene. Si la relación almacenara además `nro_licencia` o `licencia_vencimiento` del conductor, dichos atributos dependerían exclusivamente de `id_cliente`, es decir de una parte de la clave primaria, lo que constituiría una dependencia funcional parcial y una violación de la Segunda Forma Normal. La consecuencia práctica sería la replicación del número de licencia de una misma persona en cada contrato en que figurase como conductor, con la correspondiente anomalía de modificación al renovarse el documento. El diseño lo evita referenciando el subtipo `CLIENTE`, donde esos atributos dependen de la clave completa.

**Tercera Forma Normal.** No existe en el esquema ningún atributo no primo que dependa funcionalmente de otro atributo no primo. La verificación se apoya en dos decisiones de diseño:

- Los datos de la sucursal y de la categoría no se replican en `Vehiculo`: la relación conserva únicamente las claves foráneas `id_sucursal_actual` e `id_categoria`. Si `Vehiculo` almacenara, por ejemplo, la ciudad de su sucursal, existiría la dependencia transitiva `id_vehiculo` → `id_sucursal_actual` → `ciudad`, violando la 3FN.
- Los datos de identidad del cliente no se replican en `Reserva` ni en `Alquiler`: ambas conservan solo la referencia. Si `Reserva` almacenara el nombre o el documento del cliente, existiría la dependencia transitiva `id_reserva` → `id_cliente` → `nombres`, con la consiguiente redundancia en cada una de las reservas del mismo cliente.

Puede observarse además que el esquema satisface la Forma Normal de Boyce-Codd, ya que en toda dependencia funcional no trivial el determinante es una superclave: las claves candidatas identificadas (`placa`, `email`, `codigo_reserva`, `nro_contrato`, `nro_licencia`, `usuario` y la combinación de tipo y número de documento) determinan la fila completa y no solo una parte de ella.

### 3.4.3. Anomalías evitadas

La normalización del esquema previene de manera concreta las tres clases de anomalías:

- **Anomalía de inserción.** La separación de `Categoria` respecto de `Vehiculo` permite registrar una categoría nueva con su tarifa y su garantía de referencia antes de que la empresa adquiera la primera unidad de esa gama. En un diseño que incorporara la descripción de la categoría dentro de cada vehículo, dicha información no podría existir sin un vehículo que la sostuviera. El mismo razonamiento aplica a `Sucursal`, que puede darse de alta antes de recibir su flota o su personal.
- **Anomalía de modificación.** Un cambio en el teléfono o el correo de una persona se realiza en una única fila de `Persona`, y queda reflejado de manera simultánea en su condición de cliente, su condición de empleado y en la totalidad de su historial de reservas, contratos y órdenes de mantenimiento. Si los datos de contacto se hubieran replicado en los subtipos, una actualización parcial dejaría al sistema con dos versiones contradictorias de la misma persona. De forma análoga, una modificación de la tarifa base de una categoría afecta a una sola fila y no exige recorrer la flota.
- **Anomalía de borrado.** La combinación de integridad referencial y borrado lógico impide que la eliminación de una entidad destruya información histórica ajena. Retirar un vehículo de la flota se realiza mediante la bandera `activo` y no elimina los contratos en los que participó, ni sus inspecciones, ni sus pagos, ni su historial mecánico. El mismo mecanismo protege a `Persona` y a `Sucursal`. Sin esta decisión, dar de baja una sede cerrada eliminaría en cascada la trazabilidad contable de todas las operaciones realizadas en ella.

### 3.4.4. Decisiones de diseño que se apartan de la normalización estricta

Tres atributos del esquema constituyen desnormalizaciones deliberadas. Se documentan de forma explícita porque un análisis superficial los identificaría como redundancia, cuando en realidad responden a requerimientos del dominio que la normalización estricta no puede satisfacer.

**Congelamiento de tarifas.** Los atributos `tarifa_diaria_pactada` en `Reserva` y `tarifa_diaria_aplicada` en `Alquiler` duplican, en el momento de su creación, un valor que también se encuentra en `Categoria` o en `Vehiculo`. No se trata de redundancia, sino de dos hechos distintos: la tarifa maestra es el precio vigente hoy, mientras que la tarifa pactada es el precio que se acordó con un cliente concreto en una fecha concreta. Formalmente, la dependencia no existe: `id_reserva` determina la tarifa pactada, y esta no es derivable de `id_categoria` sin conocer además el instante de la reserva. Almacenar únicamente la tarifa maestra provocaría que una modificación de precios alterara retroactivamente el valor económico de todos los contratos históricos, lo cual es inadmisible tanto contable como legalmente.

**Totales calculados.** Los atributos `total_estimado` en `Reserva` y `costo_total_final` en `Alquiler` son derivables de la tarifa, el período y los cargos adicionales. Se conservan por dos motivos. El primero es que `costo_total_final` no es una simple multiplicación: incorpora los cargos de la inspección, las penalidades registradas en `Pago` y la política de horas de gracia, de modo que recalcularlo exigiría reproducir la lógica de liquidación vigente en el momento del cierre, que puede cambiar con el tiempo. El segundo es que se trata del monto efectivamente cobrado y aceptado por el cliente, es decir un dato de naturaleza contable que debe permanecer inmutable. Su consistencia respecto de los atributos que lo originan se garantiza mediante triggers, no mediante recálculo en cada consulta.

**Tarifa específica del vehículo.** El atributo `Vehiculo.tarifa_diaria` admite nulo y, cuando lo es, rige la tarifa base de su categoría. Esta construcción no introduce dependencia transitiva alguna, dado que el atributo pertenece al vehículo y no a la categoría: expresa la excepción de una unidad concreta, por ejemplo un modelo de gama alta dentro de una categoría intermedia. El valor nulo se interpreta aquí como ausencia de excepción, no como información desconocida. La alternativa, que sería replicar la tarifa de la categoría en cada vehículo, sí produciría redundancia y una anomalía de modificación.

**Estructura de la inspección.** La relación `Inspeccion` agrupa en una única fila los dos momentos del ciclo, entrega y devolución, mediante pares de atributos paralelos. Se evaluó la alternativa de modelarla como una relación 1:N con un atributo discriminante de tipo, con clave candidata UNIQUE sobre la combinación de contrato y tipo. Se mantuvo la estructura de fila única porque el acta de inspección es, en el dominio, un documento contractual único que ambas partes firman en dos momentos, y porque el cálculo del kilometraje recorrido y de la diferencia de combustible, que alimenta los cargos adicionales, se resuelve dentro de una sola fila sin necesidad de autounión. No constituye un grupo repetido en el sentido de la Primera Forma Normal, ya que los atributos de salida y de retorno no son repeticiones del mismo hecho sino mediciones de dos hechos distintos y no intercambiables. Su costo es que la fila nace con los atributos de retorno en nulo, de modo que la obligatoriedad de la inspección se garantiza a nivel transaccional y mediante trigger, y no de forma declarativa.

## 3.5. Validación del modelo mediante las consultas previstas

Conforme al control de calidad establecido para el presente hito, el modelo se validó comprobando que soporta las cinco consultas que se emplearán en la fase de experimentación y optimización. No se incluye aquí el código SQL, que corresponde al segundo hito; el objetivo de esta sección es demostrar, antes de cerrar el diseño, que cada operación puede resolverse con el esquema propuesto sin requerir atributos ni relaciones adicionales.

Para cada consulta se documentan siete elementos. Los cuatro primeros son el usuario que la formula, la pregunta de negocio, el resultado esperado y las relaciones involucradas. El quinto, el recorrido, indica las claves concretas por las que se enlazan las relaciones, y constituye la verificación efectiva de que el modelo la soporta. El sexto documenta la frecuencia de uso y el tiempo de respuesta esperado. El séptimo anticipa los atributos de filtro, unión y ordenamiento que concentrarán el costo de ejecución, y que serán por tanto los candidatos a indexar durante la experimentación.

### Consulta 1: disponibilidad real de la flota

- **Usuario:** Recepcionista.
- **Pregunta:** ¿Qué vehículos de una categoría determinada puede ofrecer una sucursal para el período que solicita el cliente?
- **Resultado:** Listado de unidades disponibles con su placa, modelo y tarifa aplicable, excluyendo aquellas que poseen una reserva confirmada o un alquiler en curso cuyo intervalo se solape con el período solicitado.
- **Relaciones:** Vehiculo, Categoria, Sucursal, Reserva, Alquiler.
- **Recorrido:** `Vehiculo` se une a `Categoria` por `id_categoria` y a `Sucursal` por `id_sucursal_actual`. La exclusión se obtiene mediante dos anti-uniones: contra `Reserva` por `id_vehiculo`, restringiendo a estado `CONFIRMADA` y solapamiento entre el intervalo solicitado y el par (`fecha_inicio`, `fecha_fin`); y contra `Alquiler` por `id_vehiculo`, restringiendo a estados `EN_CURSO` o `ATRASADO` y solapamiento con el par (`fecha_entrega`, `fecha_dev_prevista`). La tarifa aplicable resuelve el valor nulo de `Vehiculo.tarifa_diaria` con la `tarifa_base_diaria` de su categoría.
- **Uso:** Decenas de ejecuciones diarias por sucursal, en atención presencial al cliente. Se espera respuesta inferior a un segundo, por tratarse de una consulta interactiva.
- **Costo:** El costo se concentra en los predicados de rango sobre fechas de `Reserva` y `Alquiler`, combinados con el filtro de estado y la unión por `id_vehiculo`. Son los candidatos naturales a índice compuesto.

### Consulta 2: utilización e ingresos de la flota por categoría y período

- **Usuario:** Administrador de la empresa.
- **Pregunta:** ¿Cuál fue el rendimiento de cada categoría de vehículos mes a mes?
- **Resultado:** Cuadro agrupado por mes y categoría con el número de contratos, los días alquilados, la tasa de utilización respecto de los días de flota disponible, el ingreso total y el ticket promedio.
- **Relaciones:** Alquiler, Vehiculo, Categoria, Pago.
- **Recorrido:** `Alquiler` se une a `Vehiculo` por `id_vehiculo` y este a `Categoria` por `id_categoria`. El ingreso se obtiene agregando `Pago.monto` por `id_alquiler`, restringido a los tipos `PAGO_ALQUILER` y `PENALIDAD` en estado `APROBADO`, de modo que los depósitos en garantía y sus devoluciones no se contabilicen como ingreso. La agrupación se realiza por el mes de `fecha_entrega` y por `id_categoria`.
- **Uso:** Ejecución mensual, en el cierre de gestión. Admite tiempos de respuesta de varios segundos por tratarse de un reporte analítico y no interactivo.
- **Costo:** El costo proviene del recorrido del histórico completo de `Alquiler` y `Pago`, de la agregación por período y del filtro por tipo y estado de transacción.

### Consulta 3: rentabilidad por unidad

- **Usuario:** Supervisor.
- **Pregunta:** ¿Qué unidades de la flota generan más margen y qué unidades cuestan más de lo que producen?
- **Resultado:** Ranking de vehículos ordenado por margen, calculado como la diferencia entre los ingresos de alquiler acumulados y el costo de mantenimiento acumulado, incluyendo la posición relativa de cada unidad dentro de su propia categoría.
- **Relaciones:** Vehiculo, Alquiler, Pago, Mantenimiento.
- **Recorrido:** Se calculan dos agregaciones independientes sobre `Vehiculo`: los ingresos, recorriendo `Alquiler` por `id_vehiculo` y `Pago` por `id_alquiler`; y los costos, agregando `Mantenimiento.costo` por `id_vehiculo` para las órdenes en estado `COMPLETADO`. Ambas se combinan sobre `id_vehiculo` y el resultado se ordena mediante una función de ventana particionada por `id_categoria`.
- **Uso:** Ejecución trimestral, para decidir la renovación o el retiro de unidades. Admite tiempos de respuesta de varios segundos.
- **Costo:** El costo radica en las dos agregaciones sobre relaciones históricas de gran volumen y en el ordenamiento posterior que exige la función de ventana.

### Consulta 4: auditoría de contratos cerrados de forma incompleta

- **Usuario:** Supervisor.
- **Pregunta:** ¿Qué contratos figuran como finalizados sin haber cumplido el procedimiento de cierre?
- **Resultado:** Alquileres en estado `FINALIZADO` que carecen del kilometraje de retorno en su inspección, o que no registran la devolución ni la aplicación del depósito en garantía.
- **Relaciones:** Alquiler, Inspeccion, Pago.
- **Recorrido:** Se parte de `Alquiler` filtrado por estado `FINALIZADO`. La primera condición se verifica uniendo con `Inspeccion` por `id_alquiler` y detectando `km_retorno` nulo. La segunda mediante una anti-unión contra `Pago` por `id_alquiler`, comprobando la ausencia de transacciones de tipo `DEVOLUCION_GARANTIA` o `PENALIDAD` en estado `APROBADO`. Ambas relaciones se recorren por la clave foránea hacia el contrato, que en el caso de `Inspeccion` es además `UNIQUE`.
- **Uso:** Ejecución semanal, como control interno. Admite tiempos de respuesta de varios segundos.
- **Costo:** El costo depende del filtro por estado sobre `Alquiler`, que es poco selectivo al acumularse el histórico, y de las dos comprobaciones de ausencia sobre `Inspeccion` y `Pago`.

### Consulta 5: clientes con siniestralidad superior al promedio

- **Usuario:** Administrador de la empresa.
- **Pregunta:** ¿Qué clientes acumulan cargos adicionales y penalidades por encima del promedio general?
- **Resultado:** Clientes cuyo monto acumulado de cargos adicionales y penalidades supera el promedio del conjunto, junto con su número de contratos, su número de devoluciones tardías y su historial de reservas no presentadas.
- **Relaciones:** Cliente, Persona, Reserva, Alquiler, Inspeccion, Pago.
- **Recorrido:** Es la consulta que atraviesa el modelo de extremo a extremo. Desde `Cliente` se une a `Persona` por `id_persona` para obtener los datos de identidad, y a `Reserva` por `id_cliente`; de allí a `Alquiler` por `id_reserva`, y finalmente a `Inspeccion` y `Pago` por `id_alquiler`, sumando `cargos_adicionales` y los montos de tipo `PENALIDAD`. Las devoluciones tardías se obtienen comparando `fecha_dev_real` con `fecha_dev_prevista`, y las ausencias contando las reservas en estado `NO_SHOW`. El umbral se resuelve mediante una subconsulta correlacionada que contrasta el acumulado de cada cliente con el promedio general.
- **Uso:** Ejecución mensual, para decidir la exigencia de garantía reforzada. Admite tiempos de respuesta de varios segundos.
- **Costo:** Es la consulta más costosa del conjunto: recorre seis relaciones, agrega sobre el histórico completo y evalúa una subconsulta correlacionada, por lo que resulta la más adecuada para contrastar planes de ejecución entre volúmenes.

Las cinco consultas cubren de manera conjunta los patrones de complejidad intermedia exigidos por el proyecto: unión de varias relaciones mediante claves, filtros con significado de negocio, agrupación y agregación por período y categoría, ranking mediante funciones de ventana, detección de excepciones y subconsulta correlacionada. Ninguna de ellas se reduce a listar una relación completa, recuperar una fila por su clave primaria o contar la totalidad de los registros, operaciones que el proyecto descarta por triviales.

La verificación de los recorridos permite además confirmar dos propiedades del diseño. La primera es que toda la información requerida se obtiene navegando claves foráneas ya definidas, sin necesidad de añadir atributos ni relaciones. La segunda es que las decisiones de diseño discutidas en el capítulo de normalización resultan indispensables para estas consultas: el congelamiento de tarifas permite que la Consulta 2 calcule ingresos históricos correctos aunque las tarifas maestras hayan cambiado, y el borrado lógico permite que las Consultas 3 y 5 recorran el historial de unidades retiradas y clientes inactivos sin perder trazabilidad.

Finalmente, cada una de estas consultas recorre relaciones que alcanzarán volúmenes elevados en los escenarios de experimentación, y los atributos señalados como concentradores de costo constituyen las hipótesis de indexación que se contrastarán con y sin índices durante el segundo hito.

## 3.6. Referencias del proyecto

El diseño del modelo entidad-relación, su transformación al modelo relacional y el análisis de formas normales presentados en este informe siguen la metodología descrita por [Elmasri and Navathe, 2016] y [Silberschatz et al., 2019], en particular en lo relativo al tratamiento de jerarquías de especialización con cobertura parcial y solapamiento, y a la transformación de relaciones de multiplicidad muchos a muchos en relaciones intermedias con clave primaria compuesta.

La implementación prevista y las decisiones sobre tipos de datos, restricciones de integridad, disparadores y estrategias de indexación toman como referencia la documentación oficial de PostgreSQL [PostgreSQL Global Development Group, 2026], así como el tratamiento del control de concurrencia y los niveles de aislamiento necesarios para prevenir la asignación simultánea de una misma unidad a dos contratos incompatibles.

Para la definición de las reglas del dominio de alquiler de vehículos, los estados del ciclo de vida de un contrato y las prácticas de inspección de entrega y devolución, se revisaron los términos y condiciones publicados por operadores del sector, así como la normativa peruana aplicable a la licencia de conducir y a la responsabilidad del arrendatario durante la tenencia del vehículo.

**Bibliografía**

- [Elmasri and Navathe, 2016] Elmasri, R. and Navathe, S. B. (2016). *Fundamentals of Database Systems*. Pearson, 7th edition.
- [PostgreSQL Global Development Group, 2026] PostgreSQL Global Development Group (2026). *PostgreSQL 16.0 Documentation*. PostgreSQL. Disponible en <https://www.postgresql.org/docs/>.
- [Silberschatz et al., 2019] Silberschatz, A., Korth, H. F., and Sudarshan, S. (2019). *Database System Concepts*. McGraw-Hill, 7th edition.
