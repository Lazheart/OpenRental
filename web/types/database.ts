// Tipos derivados del esquema relacional y vistas de OpenRental (PostgreSQL)

export interface FichaVehiculo {
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  transmision: string;
  combustible: string;
  capacidad_pasajeros: number;
  kilometraje_actual: number;
  estado_vehiculo: "DISPONIBLE" | "ALQUILADO" | "RESERVADO" | "EN_MANTENIMIENTO" | "DE_BAJA" | string;
  vehiculo_activo: boolean;
  tarifa_efectiva: number;
  id_categoria: number;
  categoria_nombre: string;
  tarifa_base_diaria: number;
  monto_garantia_base: number;
  id_sucursal: number;
  sucursal_nombre: string;
  sucursal_ciudad: string;
}

export interface HistorialAlquiler {
  id_alquiler: number;
  nro_contrato: string;
  estado_alquiler: "CONFIRMADO" | "EN_CURSO" | "ATRASADO" | "FINALIZADO" | "EN_DISPUTA" | string;
  fecha_entrega: string;
  fecha_dev_prevista: string;
  fecha_dev_real: string | null;
  tarifa_diaria_aplicada: number;
  costo_total_final: number | null;
  id_reserva: number;
  codigo_reserva: string;
  estado_reserva: string;
  reserva_fecha_inicio: string;
  reserva_fecha_fin: string;
  tarifa_diaria_pactada: number;
  total_estimado: number;
  id_cliente: number;
  cliente_nombre_completo: string;
  cliente_documento: string;
  cliente_licencia: string;
  id_vehiculo: number;
  placa: string;
  vehiculo_descripcion: string;
  categoria: string;
  sucursal_retiro: string;
  sucursal_devolucion: string;
  id_empleado_entrega: number;
  empleado_entrega: string;
  id_empleado_devolucion: number | null;
  empleado_devolucion: string | null;
  km_salida: number | null;
  km_retorno: number | null;
  combustible_salida: string | null;
  combustible_retorno: string | null;
  danos_salida: string | null;
  danos_retorno: string | null;
  cargos_adicionales: number | null;
}

export interface ResumenFinancieroAlquiler {
  id_alquiler: number;
  nro_contrato: string;
  estado_alquiler: string;
  total_anticipos: number;
  total_pago_alquiler: number;
  total_deposito_garantia: number;
  total_devolucion_garantia: number;
  total_penalidades: number;
  ingreso_neto: number;
  transacciones_aprobadas: number;
  transacciones_pendientes: number;
  transacciones_rechazadas: number;
}

export interface HistorialMantenimiento {
  id_mantenimiento: number;
  tipo_mantenimiento: "PREVENTIVO" | "CORRECTIVO" | "REVISION_TECNICA" | string;
  estado_mantenimiento: "PROGRAMADO" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO" | string;
  descripcion: string;
  taller: string;
  km_al_servicio: number;
  costo: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  id_vehiculo: number;
  placa: string;
  vehiculo_descripcion: string;
  categoria: string;
  kilometraje_actual: number;
  id_empleado: number;
  empleado_responsable: string;
  cargo_empleado: string;
  sucursal_actual: string;
}

export interface PerfilCliente {
  id_cliente: number;
  tipo_documento: string;
  nro_documento: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  telefono: string;
  email: string;
  activo: boolean;
  nro_licencia: string;
  licencia_vencimiento: string;
  pais_licencia: string;
  direccion: string;
  fecha_registro: string;
  total_reservas: number;
  reservas_completadas: number;
  reservas_canceladas: number;
  reservas_no_show: number;
  total_alquileres: number;
  alquileres_finalizados: number;
  alquileres_activos: number;
  monto_total_pagado: number;
}

export interface AlquilerPendiente {
  id_alquiler: number;
  nro_contrato: string;
  estado_alquiler: string;
  fecha_entrega: string;
  fecha_dev_prevista: string;
  dias_retraso: number;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  placa: string;
  vehiculo: string;
  categoria: string;
  sucursal_devolucion: string;
}

// Consultas específicas (07_queries.sql y Capítulo 3.5)
export interface DisponibilidadAntiSolapamientoResult {
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  transmision: string;
  combustible: string;
  capacidad_pasajeros: number;
  kilometraje_actual: number;
  tarifa_aplicable: number;
  categoria: string;
  sucursal: string;
}

export interface UtilizacionIngresoCategoriaMes {
  mes: string;
  id_categoria: number;
  categoria: string;
  total_contratos: number;
  dias_alquilados: number;
  ingreso_total: number;
  ticket_promedio: number;
  ranking_ingreso_mes: number;
}

export interface ClienteSiniestralidadAlta {
  id_cliente: number;
  nombre_completo: string;
  nro_documento: string;
  email: string;
  nro_licencia: string;
  total_contratos: number;
  devoluciones_tardias: number;
  reservas_no_show: number;
  total_cargos_inspeccion: number;
  total_penalidades: number;
  siniestralidad_total: number;
}

export interface RentabilidadUnidad {
  id_vehiculo: number;
  placa: string;
  vehiculo_descripcion: string;
  categoria: string;
  ingresos_totales: number;
  costos_mantenimiento: number;
  margen_neto: number;
  ranking_categoria: number;
}

export interface AuditoriaContratosIncompletos {
  id_alquiler: number;
  nro_contrato: string;
  cliente: string;
  placa: string;
  fecha_entrega: string;
  fecha_dev_real: string | null;
  motivo_inconsistencia: string;
}

