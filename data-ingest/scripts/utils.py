"""
OpenRental - Utilidades de Generación e Ingesta de Datos Sintéticos.
Módulo con definiciones de dominio, generadores optimizados y herramientas de exportación CSV
para soportar cargas de 1K, 10K, 100K y 1M de registros cumpliendo las restricciones
y reglas de negocio de PostgreSQL.
"""

import os
import csv
import random
from datetime import datetime, date, timedelta
from typing import Dict, List, Tuple, Generator, Any

# ==============================================================================
# CONFIGURACIÓN DE ESCALAS SEGÚN SECCIÓN 1.6 Y 1.6.1 DEL PROYECTO
# ==============================================================================
# Pago es la entidad de referencia. Alquileres son ~ Pago / 2.5.
# Inspección es 1:1 con Alquiler.
# Reserva incluye alquileres + 25% de canceladas/no-show.
# Conductor adicional es ~ 0.4 por Alquiler.
# ==============================================================================
SCALE_CONFIGS: Dict[str, Dict[str, int]] = {
    '1k': {
        'pagos': 1_000,
        'alquileres': 400,
        'inspecciones': 400,
        'reservas': 500,
        'conductores_adic': 160,
        'clientes': 250,
        'personas': 300,
        'empleados': 20,
        'vehiculos': 50,
        'mantenimientos': 150,
        'sucursales': 5,
        'categorias': 6,
    },
    '10k': {
        'pagos': 10_000,
        'alquileres': 4_000,
        'inspecciones': 4_000,
        'reservas': 5_000,
        'conductores_adic': 1_600,
        'clientes': 2_000,
        'personas': 2_500,
        'empleados': 50,
        'vehiculos': 200,
        'mantenimientos': 1_500,
        'sucursales': 10,
        'categorias': 6,
    },
    '100k': {
        'pagos': 100_000,
        'alquileres': 40_000,
        'inspecciones': 40_000,
        'reservas': 50_000,
        'conductores_adic': 16_000,
        'clientes': 20_000,
        'personas': 25_000,
        'empleados': 200,
        'vehiculos': 750,
        'mantenimientos': 15_000,
        'sucursales': 20,
        'categorias': 6,
    },
    '1m': {
        'pagos': 1_000_000,
        'alquileres': 400_000,
        'inspecciones': 400_000,
        'reservas': 500_000,
        'conductores_adic': 160_000,
        'clientes': 120_000,
        'personas': 150_000,
        'empleados': 500,
        'vehiculos': 3_500,
        'mantenimientos': 80_000,
        'sucursales': 25,
        'categorias': 6,
    }
}

# ==============================================================================
# CATÁLOGOS BASE Y VOCABULARIOS REALISTAS (PERÚ)
# ==============================================================================
NOMBRES = [
    'Juan', 'Carlos', 'Luis', 'Jorge', 'Miguel', 'Jose', 'Victor', 'Manuel',
    'David', 'Fernando', 'Cesar', 'Eduardo', 'Pedro', 'Alejandro', 'Roberto',
    'Maria', 'Ana', 'Rosa', 'Carmen', 'Patricia', 'Claudia', 'Lucia',
    'Diana', 'Andrea', 'Sofia', 'Valeria', 'Gabriela', 'Camila', 'Fiorella'
]

APELLIDOS = [
    'Quispe', 'Flores', 'Rodriguez', 'Garcia', 'Sanchez', 'Rojas', 'Diaz',
    'Torres', 'Ramirez', 'Perez', 'Mamani', 'Chavez', 'Vargas', 'Castillo',
    'Gomez', 'Mendoza', 'Espinoza', 'Ramos', 'Huaman', 'Fernandez', 'Romero',
    'Alvarez', 'Gutierrez', 'Castro', 'Paredes', 'Morales', 'Vasquez'
]

DOMINIOS_EMAIL = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'openrental.pe']

CIUDADES_PERU = [
    'Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Chiclayo', 'Piura',
    'Huancayo', 'Tacna', 'Ica', 'Cajamarca', 'Pucallpa', 'Tarapoto'
]

CALLES_PERU = [
    'Av. Javier Prado', 'Av. Arequipa', 'Av. Benavides', 'Av. Brasil',
    'Av. La Marina', 'Av. Angamos', 'Av. Salaverry', 'Jr. de la Union',
    'Av. Larco', 'Av. El Sol', 'Av. Dolores', 'Av. America Sur'
]

CATEGORIAS_DEF = [
    {'nombre': 'ECONOMICO', 'descripcion': 'Autos compactos de bajo consumo urbano', 'tarifa': 80.00, 'garantia': 800.00},
    {'nombre': 'COMPACTO',  'descripcion': 'Hatchbacks ágiles y cómodos para ciudad y ruta corta', 'tarifa': 110.00, 'garantia': 1000.00},
    {'nombre': 'SEDAN',     'descripcion': 'Sedanes ejecutivos con gran confort y maletero amplio', 'tarifa': 150.00, 'garantia': 1500.00},
    {'nombre': 'SUV',       'descripcion': 'Camionetas SUV versátiles ideales para viajes familiares', 'tarifa': 220.00, 'garantia': 2200.00},
    {'nombre': 'CAMIONETA', 'descripcion': 'Pick-up 4x4 robustas para terrenos exigentes o carga', 'tarifa': 280.00, 'garantia': 2800.00},
    {'nombre': 'PREMIUM',   'descripcion': 'Vehículos de alta gama, lujo y máxima potencia', 'tarifa': 450.00, 'garantia': 4500.00},
]

MODELOS_POR_CAT = {
    1: [('Toyota', 'Yaris'), ('Hyundai', 'Grand i10'), ('Kia', 'Picanto'), ('Chevrolet', 'Sail')],
    2: [('Suzuki', 'Swift'), ('Volkswagen', 'Polo'), ('Renault', 'Sandero'), ('Nissan', 'March')],
    3: [('Toyota', 'Corolla'), ('Nissan', 'Sentra'), ('Honda', 'Civic'), ('Mazda', '3'), ('Hyundai', 'Elantra')],
    4: [('Toyota', 'RAV4'), ('Hyundai', 'Tucson'), ('Kia', 'Sportage'), ('Honda', 'CR-V'), ('Nissan', 'X-Trail')],
    5: [('Toyota', 'Hilux'), ('Ford', 'Ranger'), ('Mitsubishi', 'L200'), ('Nissan', 'Frontier')],
    6: [('BMW', 'Serie 3'), ('Mercedes-Benz', 'Clase C'), ('Audi', 'A4'), ('Volvo', 'XC60')]
}

COLORES = ['Blanco', 'Negro', 'Gris Plata', 'Rojo', 'Azul Marino', 'Gris Oscuro', 'Plata']
TALLERES = ['Taller Central OpenRental', 'Midas Service', 'Bosch Car Service', 'AutoCheck Peru', 'MasterMotors']

# Enums acordes a 01_create_tables.sql
CARGOS = ['RECEPCIONISTA', 'MECANICO', 'ADMINISTRADOR', 'SUPERVISOR']
TRANSMISIONES = ['MECANICA', 'AUTOMATICA']
COMBUSTIBLES = ['GASOLINA', 'DIESEL', 'HIBRIDO', 'ELECTRICO', 'GLP']
ESTADOS_VEHICULO = ['DISPONIBLE', 'RESERVADO', 'ALQUILADO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO']
ESTADOS_RESERVA = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'NO_SHOW', 'COMPLETADA']
ESTADOS_ALQUILER = ['EN_CURSO', 'FINALIZADO', 'ATRASADO', 'EN_DISPUTA']
COMBUSTIBLE_NIVELES = ['VACIO', '1/4', '1/2', '3/4', 'LLENO']
PARENTESCOS = ['CONYUGE', 'FAMILIAR', 'COLEGA', 'OTRO']
TIPOS_TRANSACCION = ['ANTICIPO', 'PAGO_ALQUILER', 'DEPOSITO_GARANTIA', 'DEVOLUCION_GARANTIA', 'PENALIDAD']
METODOS_PAGO = ['EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 'TRANSFERENCIA']
ESTADOS_PAGO = ['APROBADO', 'PENDIENTE', 'RECHAZADO', 'REEMBOLSADO']
TIPOS_MANTENIMIENTO = ['PREVENTIVO', 'CORRECTIVO', 'INSPECCION_TECNICA']
ESTADOS_MANTENIMIENTO = ['PROGRAMADO', 'EN_TALLER', 'COMPLETADO']

# ==============================================================================
# GENERADORES DE VALORES ALEATORIOS CON REGLAS Y RESTRICCIONES
# ==============================================================================
def generar_placa(index: int) -> str:
    """Genera una placa vehicular única válida para Perú (ej. ABC-123)."""
    # 26 letras disponibles, formato ABC-123 (6 caracteres alfanuméricos)
    letra1 = chr(65 + (index // (26 * 26 * 1000)) % 26)
    letra2 = chr(65 + (index // (26 * 1000)) % 26)
    letra3 = chr(65 + (index // 1000) % 26)
    num = index % 1000
    return f"{letra1}{letra2}{letra3}-{num:03d}"

def generar_nro_documento(tipo: str, index: int) -> str:
    """Genera un documento único según el tipo."""
    if tipo == 'DNI':
        return f"{10000000 + index:08d}"
    elif tipo == 'PASAPORTE':
        return f"P{index:08d}"
    else:  # CARNET_EXTRANJERIA
        return f"CE{index:09d}"

def generar_licencia(index: int) -> str:
    """Genera un número de brevete único (ej. Q12345678)."""
    return f"Q{10000000 + index:08d}"

def format_ts(dt: datetime) -> str:
    """Formatea timestamp compatible con PostgreSQL."""
    return dt.strftime('%Y-%m-%d %H:%M:%S')

def format_date(d: date) -> str:
    """Formatea date compatible con PostgreSQL."""
    return d.strftime('%Y-%m-%d')

# ==============================================================================
# CLASE PRINCIPAL DE GENERACIÓN DE DATOS STREAMING
# ==============================================================================
class DataGenerator:
    """
    Generador optimizado de datos relacionales sintéticos para OpenRental.
    Genera los registros en streaming para minimizar consumo de memoria en 1M de datos.
    """
    def __init__(self, scale: str, output_dir: str, seed: int = 42):
        if scale not in SCALE_CONFIGS:
            raise ValueError(f"Escala '{scale}' no válida. Opciones: {list(SCALE_CONFIGS.keys())}")
        self.scale = scale
        self.cfg = SCALE_CONFIGS[scale]
        self.output_dir = output_dir
        self.seed = seed
        self.rnd = random.Random(seed)
        os.makedirs(output_dir, exist_ok=True)

        # Fecha base de simulación (hace 3 años hasta la actualidad)
        self.fecha_base = datetime(2023, 1, 1, 8, 0, 0)
        self.fecha_hoy = datetime(2026, 1, 1, 18, 0, 0)

    # 1. SUCURSAL
    def generate_sucursal(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['sucursales']
        for i in range(1, total + 1):
            ciudad = CIUDADES_PERU[(i - 1) % len(CIUDADES_PERU)]
            yield {
                'id_sucursal': i,
                'nombre': f"Sede {ciudad} {((i - 1) // len(CIUDADES_PERU)) + 1}",
                'ciudad': ciudad,
                'direccion': f"{self.rnd.choice(CALLES_PERU)} {self.rnd.randint(100, 2500)}",
                'telefono': f"01-{self.rnd.randint(2000000, 7999999)}",
                'activo': True
            }

    # 2. PERSONA (Clientes + Empleados + Contactos)
    def generate_persona(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['personas']
        for i in range(1, total + 1):
            tipo_doc = self.rnd.choices(['DNI', 'PASAPORTE', 'CARNET_EXTRANJERIA'], weights=[85, 10, 5])[0]
            nombres = f"{self.rnd.choice(NOMBRES)} {self.rnd.choice(NOMBRES)}"
            apellidos = f"{self.rnd.choice(APELLIDOS)} {self.rnd.choice(APELLIDOS)}"
            telefono = f"9{self.rnd.randint(10000000, 99999999)}"
            # Email único y compatible con chk_persona_email_valido
            email = f"user.{i}.{self.rnd.choice(APELLIDOS).lower()}@{self.rnd.choice(DOMINIOS_EMAIL)}"
            yield {
                'id_persona': i,
                'tipo_documento': tipo_doc,
                'nro_documento': generar_nro_documento(tipo_doc, i),
                'nombres': nombres,
                'apellidos': apellidos,
                'telefono': telefono,
                'email': email,
                'activo': True
            }

    # 3. CLIENTE (Subtipo de Persona: id_persona 1 .. clientes)
    def generate_cliente(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['clientes']
        for i in range(1, total + 1):
            # Licencias con vencimiento futuro (2027 a 2033) para garantizar vigencia
            vencimiento = date(2027, 1, 1) + timedelta(days=self.rnd.randint(1, 2000))
            fecha_reg = self.fecha_base + timedelta(days=self.rnd.randint(0, 500))
            yield {
                'id_persona': i,
                'nro_licencia': generar_licencia(i),
                'licencia_vencimiento': format_date(vencimiento),
                'pais_licencia': 'Peru',
                'direccion': f"{self.rnd.choice(CALLES_PERU)} {self.rnd.randint(100, 3000)}",
                'fecha_registro': format_ts(fecha_reg)
            }

    # 4. EMPLEADO (Subtipo de Persona: id_persona clientes+1 .. clientes+empleados)
    def generate_empleado(self) -> Generator[Dict[str, Any], None, None]:
        total_emp = self.cfg['empleados']
        offset = self.cfg['clientes']
        num_sucursales = self.cfg['sucursales']
        for idx in range(1, total_emp + 1):
            id_persona = offset + idx
            id_sucursal = ((idx - 1) % num_sucursales) + 1
            cargo = self.rnd.choices(CARGOS, weights=[45, 25, 10, 20])[0]
            usuario = f"emp_{id_persona}_{cargo.lower()[:4]}"
            # Hash simulado bcrypt compatible
            pwd_hash = "$2b$12$e8wD1oA7wR8Q.kRz0i3zheE8P0vT2M8tD5JbVwQq8l5Fz9X4K1.qK"
            yield {
                'id_persona': id_persona,
                'id_sucursal': id_sucursal,
                'cargo': cargo,
                'usuario': usuario,
                'password_hash': pwd_hash
            }

    # 5. CATEGORIA
    def generate_categoria(self) -> Generator[Dict[str, Any], None, None]:
        for idx, cat in enumerate(CATEGORIAS_DEF, 1):
            yield {
                'id_categoria': idx,
                'nombre': cat['nombre'],
                'descripcion': cat['descripcion'],
                'tarifa_base_diaria': f"{cat['tarifa']:.2f}",
                'monto_garantia_base': f"{cat['garantia']:.2f}"
            }

    # 6. VEHICULO
    def generate_vehiculo(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['vehiculos']
        num_sucursales = self.cfg['sucursales']
        for i in range(1, total + 1):
            id_cat = ((i - 1) % len(CATEGORIAS_DEF)) + 1
            marca, modelo = self.rnd.choice(MODELOS_POR_CAT[id_cat])
            anio = self.rnd.randint(2018, 2025)
            km = self.rnd.randint(2000, 85000)
            tarifa_base = CATEGORIAS_DEF[id_cat - 1]['tarifa']
            # Tarifa diaria ligeramente ajustada
            tarifa = round(tarifa_base * self.rnd.uniform(0.95, 1.15), 2)
            yield {
                'id_vehiculo': i,
                'placa': generar_placa(i),
                'id_categoria': id_cat,
                'id_sucursal_actual': ((i - 1) % num_sucursales) + 1,
                'marca': marca,
                'modelo': modelo,
                'anio': anio,
                'color': self.rnd.choice(COLORES),
                'transmision': self.rnd.choice(TRANSMISIONES),
                'combustible': self.rnd.choice(COMBUSTIBLES),
                'capacidad_pasajeros': 5 if id_cat != 4 and id_cat != 5 else self.rnd.choice([5, 7]),
                'kilometraje_actual': km,
                'tarifa_diaria': f"{tarifa:.2f}",
                'estado': self.rnd.choices(ESTADOS_VEHICULO, weights=[65, 15, 12, 6, 2])[0],
                'activo': True
            }

    # 7. RESERVA
    def generate_reserva(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['reservas']
        num_clientes = self.cfg['clientes']
        num_vehiculos = self.cfg['vehiculos']
        num_sucursales = self.cfg['sucursales']
        total_alquileres = self.cfg['alquileres']

        for i in range(1, total + 1):
            id_cliente = self.rnd.randint(1, num_clientes)
            id_cat = self.rnd.randint(1, len(CATEGORIAS_DEF))
            
            # Las primeras 'total_alquileres' reservas pasan a ser Alquiler (COMPLETADA)
            if i <= total_alquileres:
                estado = 'COMPLETADA'
                id_vehiculo = ((i - 1) % num_vehiculos) + 1
            else:
                estado = self.rnd.choices(['CONFIRMADA', 'PENDIENTE', 'CANCELADA', 'NO_SHOW'], weights=[30, 20, 35, 15])[0]
                id_vehiculo = ((i - 1) % num_vehiculos) + 1 if estado in ('CONFIRMADA', 'COMPLETADA') else ''

            sucursal_retiro = self.rnd.randint(1, num_sucursales)
            # 80% devuelven en la misma sede, 20% en otra sede
            sucursal_dev = sucursal_retiro if self.rnd.random() < 0.8 else self.rnd.randint(1, num_sucursales)

            # Duración del alquiler (1 a 14 días)
            dias_duracion = self.rnd.randint(1, 14)
            # Fechas distribuidas en el periodo histórico
            dias_offset = (i * 1050) // total
            f_inicio = self.fecha_base + timedelta(days=dias_offset, hours=self.rnd.randint(8, 18))
            f_fin = f_inicio + timedelta(days=dias_duracion)

            tarifa = CATEGORIAS_DEF[id_cat - 1]['tarifa']
            total_estimado = round(tarifa * dias_duracion, 2)

            yield {
                'id_reserva': i,
                'codigo_reserva': f"RES{i:08d}",
                'id_cliente': id_cliente,
                'id_categoria': id_cat,
                'id_vehiculo': id_vehiculo,
                'id_sucursal_retiro': sucursal_retiro,
                'id_sucursal_devolucion': sucursal_dev,
                'fecha_inicio': format_ts(f_inicio),
                'fecha_fin': format_ts(f_fin),
                'tarifa_diaria_pactada': f"{tarifa:.2f}",
                'total_estimado': f"{total_estimado:.2f}",
                'estado': estado
            }

    # 8. ALQUILER (1:1 con las primeras N reservas)
    def generate_alquiler(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['alquileres']
        num_vehiculos = self.cfg['vehiculos']
        total_emp = self.cfg['empleados']
        offset_emp = self.cfg['clientes']

        for i in range(1, total + 1):
            id_vehiculo = ((i - 1) % num_vehiculos) + 1
            id_emp_entrega = offset_emp + self.rnd.randint(1, total_emp)
            id_emp_dev = offset_emp + self.rnd.randint(1, total_emp)

            # Reconstruimos fechas de forma coherente
            dias_duracion = (i % 12) + 2
            dias_offset = (i * 1050) // self.cfg['reservas']
            f_entrega = self.fecha_base + timedelta(days=dias_offset, hours=9)
            f_dev_prev = f_entrega + timedelta(days=dias_duracion)

            # Estado del contrato
            if i > total * 0.95:
                # Alquileres recientes en curso
                estado = 'EN_CURSO'
                f_dev_real = ''
                costo_final = ''
                id_emp_dev_val = ''
            elif i > total * 0.93:
                estado = 'ATRASADO'
                f_dev_real = ''
                costo_final = ''
                id_emp_dev_val = ''
            else:
                estado = 'FINALIZADO'
                # Variación leve de horas en retorno
                f_dev_real = format_ts(f_dev_prev + timedelta(hours=self.rnd.randint(-4, 12)))
                id_emp_dev_val = id_emp_dev
                # Tarifa y costo
                tarifa_base = 120.00
                costo_final = f"{round(tarifa_base * dias_duracion, 2):.2f}"

            yield {
                'id_alquiler': i,
                'nro_contrato': f"CTR{i:09d}",
                'id_reserva': i,  # 1:1 estricto con reserva i
                'id_vehiculo': id_vehiculo,
                'id_empleado_entrega': id_emp_entrega,
                'id_empleado_devolucion': id_emp_dev_val,
                'fecha_entrega': format_ts(f_entrega),
                'fecha_dev_prevista': format_ts(f_dev_prev),
                'fecha_dev_real': f_dev_real,
                'tarifa_diaria_aplicada': "120.00",
                'costo_total_final': costo_final,
                'estado': estado
            }

    # 9. INSPECCION (1:1 con Alquiler)
    def generate_inspeccion(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['inspecciones']
        for i in range(1, total + 1):
            km_salida = self.rnd.randint(5000, 70000)
            km_recorridos = self.rnd.randint(80, 1500)
            km_retorno = km_salida + km_recorridos

            # Si el alquiler es de los últimos (en curso), retorno es nulo
            es_en_curso = i > self.cfg['alquileres'] * 0.93
            if es_en_curso:
                km_retorno_str = ''
                combustible_retorno = ''
                danos_retorno = ''
                cargos = "0.00"
            else:
                km_retorno_str = str(km_retorno)
                combustible_retorno = self.rnd.choice(['3/4', 'LLENO'])
                danos_retorno = 'Rayadura en parachoque delantero' if self.rnd.random() < 0.05 else ''
                cargos = "150.00" if danos_retorno else "0.00"

            yield {
                'id_inspeccion': i,
                'id_alquiler': i,  # 1:1 con alquiler
                'km_salida': km_salida,
                'km_retorno': km_retorno_str,
                'combustible_salida': 'LLENO',
                'combustible_retorno': combustible_retorno,
                'danos_salida': '',
                'danos_retorno': danos_retorno,
                'cargos_adicionales': cargos
            }

    # 10. CONDUCTOR_ADICIONAL (~40% de los alquileres)
    def generate_conductor_adicional(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['conductores_adic']
        num_clientes = self.cfg['clientes']
        # Mapeo de alquiler a conductor para no duplicar PK (id_alquiler, id_cliente)
        for i in range(1, total + 1):
            id_alquiler = i
            # Conductor adicional debe ser un cliente válido distinto del titular
            id_cliente = ((i + 7) % num_clientes) + 1
            fecha_reg = self.fecha_base + timedelta(days=(i * 1050) // self.cfg['alquileres'])
            yield {
                'id_alquiler': id_alquiler,
                'id_cliente': id_cliente,
                'parentesco': self.rnd.choice(PARENTESCOS),
                'licencia_verificada': True,
                'recargo': "35.00",
                'fecha_registro': format_ts(fecha_reg)
            }

    # 11. PAGO (Promedio ~2.5 pagos por alquiler)
    def generate_pago(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['pagos']
        total_alquileres = self.cfg['alquileres']

        # Tipos de transacciones sucesivas por contrato
        secuencia_transacciones = [
            ('ANTICIPO', 150.00),
            ('DEPOSITO_GARANTIA', 1000.00),
            ('PAGO_ALQUILER', 450.00),
            ('DEVOLUCION_GARANTIA', 1000.00),
            ('PENALIDAD', 150.00)
        ]

        for i in range(1, total + 1):
            # Asignar alquiler proporcional
            id_alquiler = ((i - 1) % total_alquileres) + 1
            paso = ((i - 1) // total_alquileres) % len(secuencia_transacciones)
            tipo_tx, monto_base = secuencia_transacciones[paso]

            dias_offset = (id_alquiler * 1050) // total_alquileres
            fecha_p = self.fecha_base + timedelta(days=dias_offset, hours=10 + paso)

            yield {
                'id_pago': i,
                'id_alquiler': id_alquiler,
                'tipo_transaccion': tipo_tx,
                'monto': f"{monto_base:.2f}",
                'metodo_pago': self.rnd.choice(METODOS_PAGO),
                'referencia_operacion': f"OP-{i:09d}",
                'fecha_pago': format_ts(fecha_p),
                'estado': 'APROBADO' if id_alquiler <= total_alquileres * 0.93 else 'PENDIENTE'
            }

    # 12. MANTENIMIENTO
    def generate_mantenimiento(self) -> Generator[Dict[str, Any], None, None]:
        total = self.cfg['mantenimientos']
        num_vehiculos = self.cfg['vehiculos']
        total_emp = self.cfg['empleados']
        offset_emp = self.cfg['clientes']

        descripciones = [
            'Cambio de aceite sintético 5W-30 y filtro de aire',
            'Alineación, balanceo y rotación de neumáticos',
            'Sustitución de pastillas y rectificado de discos de freno',
            'Mantenimiento mayor de 50,000 km y cambio de bujías',
            'Inspección técnica anual y calibración de suspensión'
        ]

        for i in range(1, total + 1):
            id_vehiculo = ((i - 1) % num_vehiculos) + 1
            # Empleado encargado (mecánico o supervisor)
            id_emp = offset_emp + ((i - 1) % total_emp) + 1
            km_serv = 10000 + (i % 8) * 10000
            f_inicio = date(2023, 1, 1) + timedelta(days=(i * 1000) // total)
            f_fin = f_inicio + timedelta(days=self.rnd.randint(1, 4))
            costo = round(self.rnd.uniform(150.0, 950.0), 2)

            yield {
                'id_mantenimiento': i,
                'id_vehiculo': id_vehiculo,
                'id_empleado': id_emp,
                'taller': self.rnd.choice(TALLERES),
                'tipo': self.rnd.choice(TIPOS_MANTENIMIENTO),
                'descripcion': self.rnd.choice(descripciones),
                'km_al_servicio': km_serv,
                'costo': f"{costo:.2f}",
                'fecha_inicio': format_date(f_inicio),
                'fecha_fin': format_date(f_fin),
                'estado': self.rnd.choices(ESTADOS_MANTENIMIENTO, weights=[15, 10, 75])[0]
            }

    # ==========================================================================
    # ESCRITURA Y PIPELINE DE EXPORTACIÓN
    # ==========================================================================
    def export_all_csv(self) -> Dict[str, str]:
        """
        Ejecuta la exportación secuencial de las 12 tablas a CSV con buffer streaming.
        Retorna diccionario con las rutas de los archivos generados.
        """
        tablas = [
            ('01_sucursal.csv', self.generate_sucursal),
            ('02_persona.csv', self.generate_persona),
            ('03_cliente.csv', self.generate_cliente),
            ('04_empleado.csv', self.generate_empleado),
            ('05_categoria.csv', self.generate_categoria),
            ('06_vehiculo.csv', self.generate_vehiculo),
            ('07_reserva.csv', self.generate_reserva),
            ('08_alquiler.csv', self.generate_alquiler),
            ('09_inspeccion.csv', self.generate_inspeccion),
            ('10_conductor_adicional.csv', self.generate_conductor_adicional),
            ('11_pago.csv', self.generate_pago),
            ('12_mantenimiento.csv', self.generate_mantenimiento)
        ]

        results = {}
        for filename, generator_func in tablas:
            filepath = os.path.join(self.output_dir, filename)
            gen = generator_func()
            try:
                first_row = next(gen)
            except StopIteration:
                continue

            fieldnames = list(first_row.keys())
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerow(first_row)
                for row in gen:
                    writer.writerow(row)

            results[filename] = filepath

        # Generar script de carga SQL optimizado (PostgreSQL COPY)
        self.generate_load_script()
        return results

    def generate_load_script(self) -> str:
        """
        Genera un script .sql de carga masiva compatible con PostgreSQL COPY
        en el orden topológico exacto para respetar Foreign Keys y Triggers.
        """
        load_sql_path = os.path.join(self.output_dir, "load_data.sql")
        
        # Mapeo de archivo a tabla
        tablas_orden = [
            ('sucursal', '01_sucursal.csv', ['id_sucursal', 'nombre', 'ciudad', 'direccion', 'telefono', 'activo']),
            ('persona', '02_persona.csv', ['id_persona', 'tipo_documento', 'nro_documento', 'nombres', 'apellidos', 'telefono', 'email', 'activo']),
            ('cliente', '03_cliente.csv', ['id_persona', 'nro_licencia', 'licencia_vencimiento', 'pais_licencia', 'direccion', 'fecha_registro']),
            ('empleado', '04_empleado.csv', ['id_persona', 'id_sucursal', 'cargo', 'usuario', 'password_hash']),
            ('categoria', '05_categoria.csv', ['id_categoria', 'nombre', 'descripcion', 'tarifa_base_diaria', 'monto_garantia_base']),
            ('vehiculo', '06_vehiculo.csv', ['id_vehiculo', 'placa', 'id_categoria', 'id_sucursal_actual', 'marca', 'modelo', 'anio', 'color', 'transmision', 'combustible', 'capacidad_pasajeros', 'kilometraje_actual', 'tarifa_diaria', 'estado', 'activo']),
            ('reserva', '07_reserva.csv', ['id_reserva', 'codigo_reserva', 'id_cliente', 'id_categoria', 'id_vehiculo', 'id_sucursal_retiro', 'id_sucursal_devolucion', 'fecha_inicio', 'fecha_fin', 'tarifa_diaria_pactada', 'total_estimado', 'estado']),
            ('alquiler', '08_alquiler.csv', ['id_alquiler', 'nro_contrato', 'id_reserva', 'id_vehiculo', 'id_empleado_entrega', 'id_empleado_devolucion', 'fecha_entrega', 'fecha_dev_prevista', 'fecha_dev_real', 'tarifa_diaria_aplicada', 'costo_total_final', 'estado']),
            ('inspeccion', '09_inspeccion.csv', ['id_inspeccion', 'id_alquiler', 'km_salida', 'km_retorno', 'combustible_salida', 'combustible_retorno', 'danos_salida', 'danos_retorno', 'cargos_adicionales']),
            ('conductor_adicional', '10_conductor_adicional.csv', ['id_alquiler', 'id_cliente', 'parentesco', 'licencia_verificada', 'recargo', 'fecha_registro']),
            ('pago', '11_pago.csv', ['id_pago', 'id_alquiler', 'tipo_transaccion', 'monto', 'metodo_pago', 'referencia_operacion', 'fecha_pago', 'estado']),
            ('mantenimiento', '12_mantenimiento.csv', ['id_mantenimiento', 'id_vehiculo', 'id_empleado', 'taller', 'tipo', 'descripcion', 'km_al_servicio', 'costo', 'fecha_inicio', 'fecha_fin', 'estado'])
        ]

        lines = [
            "-- ============================================================================",
            f"-- OPENRENTAL - SCRIPT DE CARGA MASIVA DE DATOS (ESCALA: {self.scale.upper()})",
            "-- Utiliza \\copy de psql para cargar archivos CSV con alto rendimiento",
            "-- ============================================================================\n",
            "\\echo '>>> Iniciando carga masiva de datos OpenRental...'\n",
            "-- Desactivar temporalmente disparadores para acelerar la ingesta masiva",
            "SET session_replication_role = 'replica';\n"
        ]

        for tabla, csv_file, cols in tablas_orden:
            cols_str = ", ".join(cols)
            lines.append(f"\\echo 'Cargando {tabla} desde {csv_file}...'")
            lines.append(f"\\copy {tabla}({cols_str}) FROM '{csv_file}' WITH (FORMAT csv, HEADER true, NULL '');\n")

        # Sincronización de secuencias IDENTITY
        lines.append("-- Reactivar disparadores y restaurar modo normal")
        lines.append("SET session_replication_role = 'origin';\n")
        lines.append("-- Actualizar las secuencias identity de PostgreSQL")
        tablas_identity = [
            ('sucursal', 'id_sucursal'),
            ('persona', 'id_persona'),
            ('categoria', 'id_categoria'),
            ('vehiculo', 'id_vehiculo'),
            ('reserva', 'id_reserva'),
            ('alquiler', 'id_alquiler'),
            ('inspeccion', 'id_inspeccion'),
            ('pago', 'id_pago'),
            ('mantenimiento', 'id_mantenimiento')
        ]
        for tabla, pk in tablas_identity:
            lines.append(f"SELECT setval(pg_get_serial_sequence('{tabla}', '{pk}'), COALESCE(MAX({pk}), 1)) FROM {tabla};")

        lines.append("\n\\echo '>>> ¡Carga masiva completada exitosamente!'\n")

        with open(load_sql_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(lines))

        return load_sql_path
