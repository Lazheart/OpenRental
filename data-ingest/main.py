#!/usr/bin/env python3
"""
OpenRental - Script Principal de Ingesta y Generación Masiva de Datos CSV.
Permite generar datasets sintéticos de 1K, 10K, 100K y 1M de registros
para las 12 tablas del modelo relacional de OpenRental.

Uso:
    python main.py --scale 1k
    python main.py --scale 10k
    python main.py --scale 100k
    python main.py --scale 1m
    python main.py --scale all
"""

import os
import sys
import time
import argparse
from typing import Dict

# Asegurar visibilidad del módulo de scripts
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SCRIPTS_DIR = os.path.join(CURRENT_DIR, 'scripts')
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

from utils import SCALE_CONFIGS, DataGenerator

try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False


def format_bytes(bytes_num: int) -> str:
    """Convierte bytes a formato legible (KB, MB, GB)."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_num < 1024.0:
            return f"{bytes_num:3.1f} {unit}"
        bytes_num /= 1024.0
    return f"{bytes_num:.1f} TB"


def run_generation(scale: str, base_output_dir: str, seed: int = 42) -> None:
    """Ejecuta la generación de datos para una escala específica."""
    cfg = SCALE_CONFIGS[scale]
    target_dir = os.path.join(base_output_dir, scale)
    os.makedirs(target_dir, exist_ok=True)

    print("\n" + "=" * 70)
    print(f"🚀 GENERACIÓN DE DATOS OPENRENTAL - ESCALA [{scale.upper()}]")
    print(f"📁 Directorio de destino: {target_dir}")
    print(f"🎯 Registro objetivo (PAGO): {cfg['pagos']:,} filas")
    print(f"⚙️  Semilla aleatoria: {seed}")
    print("=" * 70)

    start_total_time = time.time()
    generator = DataGenerator(scale=scale, output_dir=target_dir, seed=seed)

    tablas = [
        ('01_sucursal.csv', 'sucursales', generator.generate_sucursal),
        ('02_persona.csv', 'personas', generator.generate_persona),
        ('03_cliente.csv', 'clientes', generator.generate_cliente),
        ('04_empleado.csv', 'empleados', generator.generate_empleado),
        ('05_categoria.csv', 'categorias', generator.generate_categoria),
        ('06_vehiculo.csv', 'vehiculos', generator.generate_vehiculo),
        ('07_reserva.csv', 'reservas', generator.generate_reserva),
        ('08_alquiler.csv', 'alquileres', generator.generate_alquiler),
        ('09_inspeccion.csv', 'inspecciones', generator.generate_inspeccion),
        ('10_conductor_adicional.csv', 'conductores_adic', generator.generate_conductor_adicional),
        ('11_pago.csv', 'pagos', generator.generate_pago),
        ('12_mantenimiento.csv', 'mantenimientos', generator.generate_mantenimiento)
    ]

    import csv
    total_rows = 0
    total_bytes = 0

    for filename, count_key, gen_fn in tablas:
        expected_count = cfg[count_key]
        filepath = os.path.join(target_dir, filename)
        t0 = time.time()

        gen = gen_fn()
        first_row = next(gen)
        fieldnames = list(first_row.keys())

        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerow(first_row)

            if HAS_TQDM and expected_count >= 1000:
                with tqdm(total=expected_count, desc=f"  📄 {filename:<26}", unit="filas", leave=False) as pbar:
                    pbar.update(1)
                    for row in gen:
                        writer.writerow(row)
                        pbar.update(1)
            else:
                for row in gen:
                    writer.writerow(row)

        elapsed = time.time() - t0
        file_size = os.path.getsize(filepath)
        total_bytes += file_size
        total_rows += expected_count

        print(f"  ✓ {filename:<26} : {expected_count:>8,} filas | {format_bytes(file_size):>8} | {elapsed:.2f}s")

    # Generar script SQL de carga
    sql_script = generator.generate_load_script()
    print("-" * 70)
    print(f"  ✓ load_data.sql              : Script de carga PostgreSQL generado")
    print("-" * 70)

    elapsed_total = time.time() - start_total_time
    print(f" Escala [{scale.upper()}] completada:")
    print(f"   • Total de registros : {total_rows:,} filas")
    print(f"   • Peso total de CSVs : {format_bytes(total_bytes)}")
    print(f"   • Tiempo transcurrido: {elapsed_total:.2f} segundos")
    print(f"   • Comando de carga   : psql -U <usuario> -d <db> -f {sql_script}")
    print("=" * 70)


def main():
    parser = argparse.ArgumentParser(
        description="OpenRental - Generador de Datasets CSV Sintéticos (1K, 10K, 100K, 1M)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python main.py --scale 1k
  python main.py --scale 10k
  python main.py --scale 100k
  python main.py --scale 1m
  python main.py --scale all
  python main.py --scale 1k --output custom_output/
        """
    )

    parser.add_argument(
        '-s', '--scale',
        choices=['1k', '10k', '100k', '1m', 'all'],
        default='1k',
        help="Escala del dataset a generar (por defecto: 1k)"
    )

    parser.add_argument(
        '-o', '--output',
        default=os.path.join(CURRENT_DIR, 'output'),
        help="Directorio raíz de salida para los CSV generados (por defecto: data-ingest/output/)"
    )

    parser.add_argument(
        '--seed',
        type=int,
        default=42,
        help="Semilla aleatoria para reproducibilidad (por defecto: 42)"
    )

    args = parser.parse_args()

    if args.scale == 'all':
        for s in ['1k', '10k', '100k', '1m']:
            run_generation(scale=s, base_output_dir=args.output, seed=args.seed)
    else:
        run_generation(scale=args.scale, base_output_dir=args.output, seed=args.seed)


if __name__ == '__main__':
    main()
