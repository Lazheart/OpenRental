# Guía de Desarrollo y Lineamientos del Proyecto

## 1. Descripción general

El proyecto está compuesto por dos componentes tecnológicos principales:

1. **Framework Full-Stack:** Next.js, encargado de la interfaz de usuario, la lógica de aplicación y la gestión de las funcionalidades del sistema.
2. **Base de datos y Backend as a Service (BaaS):** Supabase, basado en PostgreSQL, responsable del almacenamiento, consulta y gestión de los datos.

Esta guía establece las convenciones técnicas, los criterios de diseño y los lineamientos de arquitectura que deben seguir todos los desarrolladores y agentes que colaboren en el proyecto.

## 2. Configuración y ejecución del proyecto

### 2.1. Gestor de paquetes

El proyecto utiliza **pnpm** como único gestor de paquetes. Se debe mantener este estándar para garantizar la consistencia de las dependencias y evitar conflictos entre gestores.

### 2.2. Instalación y ejecución

Para instalar las dependencias y ejecutar el entorno de desarrollo local, utilizar los siguientes comandos:

```bash
# Instalar dependencias
pnpm install

# Iniciar el servidor de desarrollo
pnpm run dev
```

### 2.3. Entorno de desarrollo

- **Puerto predeterminado:** `3000`.
- **URL local:** `http://localhost:3000`.
- **Framework:** Next.js.

### 2.4. Variables de entorno

El proyecto requiere las siguientes variables de entorno para establecer la conexión con Supabase:

Crear un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

**Consideraciones de seguridad:**

- No incluir archivos `.env.local` en el repositorio.
- No exponer credenciales administrativas ni claves `service_role` en el cliente.
- Las variables con el prefijo `NEXT_PUBLIC_` son accesibles desde el navegador; por tanto, únicamente deben contener valores diseñados para ser públicos.
- La gestión de operaciones privilegiadas debe realizarse desde el servidor.

## 3. Lineamientos de diseño y UI/UX

### 3.1. Identidad visual

La interfaz debe mantener una estética **minimalista con influencias del diseño brutalista**.

La identidad visual se construye a partir de tres colores principales:

- **Blanco:** color base para fondos y superficies.
- **Negro:** utilizado para generar contraste, jerarquía visual y legibilidad.
- **Rojo vino (Burgundy):** color de acento para destacar elementos importantes, interacciones y componentes seleccionados.

El rojo vino debe utilizarse de manera controlada, evitando sobrecargar visualmente la interfaz.

### 3.2. Principios de diseño

Todos los componentes visuales deben respetar los siguientes criterios:

- **Minimalismo:** evitar elementos decorativos innecesarios.
- **Brutalismo:** priorizar estructuras visuales definidas, contrastes marcados y composiciones directas.
- **Consistencia:** mantener patrones visuales uniformes entre las diferentes secciones.
- **Jerarquía visual:** diferenciar claramente títulos, subtítulos, contenido y acciones.
- **Funcionalidad:** priorizar la claridad y facilidad de uso por encima de los efectos visuales.

## 4. Tipografía

El proyecto utiliza dos familias tipográficas principales:

| Tipografía | Aplicación |
|---|---|
| **EB Garamond** | Títulos, encabezados y elementos de énfasis editorial. |
| **Roboto Slab** | Cuerpos de texto, descripciones y contenido general. |

Se debe respetar esta distribución para mantener una identidad tipográfica consistente en toda la aplicación.

## 5. Arquitectura y mantenibilidad

El desarrollo debe priorizar una arquitectura modular, escalable y de fácil mantenimiento.

### 5.1. Componentización

La interfaz debe construirse mediante componentes reutilizables y desacoplados.

Se deben aplicar los siguientes principios:

- **DRY (Don't Repeat Yourself):** evitar duplicar lógica, estructuras y estilos.
- **Single Responsibility Principle (SRP):** cada componente debe tener una responsabilidad claramente definida.
- **Reutilización:** implementar componentes genéricos cuando existan patrones compartidos.
- **Separación de responsabilidades:** evitar concentrar lógica de negocio, acceso a datos y presentación en un mismo componente.

### 5.2. Separación de la lógica de datos

La conexión con Supabase debe mantenerse desacoplada de los componentes visuales.

Se debe evitar realizar consultas directamente desde componentes de presentación.

En su lugar, organizar el acceso a datos mediante módulos, servicios o funciones especializadas que centralicen:

- Consultas a PostgreSQL mediante Supabase.
- Operaciones CRUD (Create, Read, Update, Delete).
- Transformación y validación de datos.
- Manejo de errores y respuestas.
- Lógica de negocio relacionada con la persistencia.

Esto permitirá modificar la implementación de acceso a datos sin afectar directamente la interfaz de usuario.

### 5.3. Organización del código

Mantener una estructura de directorios clara y coherente, separando las responsabilidades del proyecto.

Como referencia:

```text
src/
├── app/              # Rutas y páginas de Next.js
├── components/       # Componentes reutilizables de UI
├── services/         # Servicios y acceso a datos
├── lib/              # Configuraciones y clientes compartidos
├── hooks/            # Hooks personalizados
├── types/            # Definiciones e interfaces TypeScript
├── utils/            # Funciones auxiliares
└── styles/           # Estilos globales y recursos CSS
```

La estructura puede adaptarse a las necesidades del proyecto, pero siempre debe conservar una separación clara de responsabilidades.

## 6. Convenciones para colaboradores y agentes

Cualquier desarrollador o agente de IA que intervenga en el proyecto debe cumplir las siguientes directrices:

1. **Respetar el stack tecnológico:** utilizar Next.js, Supabase y pnpm como tecnologías principales.
2. **Mantener la identidad visual:** no introducir colores, tipografías o estilos que contradigan el sistema de diseño establecido.
3. **Priorizar la reutilización:** revisar los componentes y servicios existentes antes de implementar nuevas funcionalidades.
4. **Evitar duplicación de código:** centralizar la lógica compartida y abstraer funcionalidades reutilizables.
5. **Desacoplar la persistencia:** no mezclar consultas a Supabase con componentes de presentación.
6. **Preservar la arquitectura:** evitar modificaciones estructurales innecesarias y respetar las convenciones existentes.
7. **Mantener la seguridad:** nunca exponer credenciales privadas ni claves administrativas en el cliente.
8. **Validar los cambios:** comprobar que las nuevas funcionalidades no afecten el comportamiento existente.

---

**Principio general:** toda implementación debe priorizar la consistencia visual, la modularidad, la separación de responsabilidades y la mantenibilidad a largo plazo. Las nuevas funcionalidades deben integrarse en la arquitectura existente en lugar de introducir soluciones aisladas o redundantes.