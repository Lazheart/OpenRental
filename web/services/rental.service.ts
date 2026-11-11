import { supabase } from "@/lib/supabase";
import {
  HistorialAlquiler,
  ResumenFinancieroAlquiler,
  AlquilerPendiente,
} from "@/types/database";
import { ServiceResult } from "./fleet.service";

const MOCK_HISTORIAL_ALQUILERES: HistorialAlquiler[] = [
  {
    id_alquiler: 501,
    nro_contrato: "CTR-2026-0089",
    estado_alquiler: "EN_CURSO",
    fecha_entrega: "2026-11-08T09:00:00Z",
    fecha_dev_prevista: "2026-11-12T18:00:00Z",
    fecha_dev_real: null,
    tarifa_diaria_aplicada: 210.0,
    costo_total_final: null,
    id_reserva: 301,
    codigo_reserva: "RSV-8942",
    estado_reserva: "COMPLETADA",
    reserva_fecha_inicio: "2026-11-08T09:00:00Z",
    reserva_fecha_fin: "2026-11-12T18:00:00Z",
    tarifa_diaria_pactada: 210.0,
    total_estimado: 840.0,
    id_cliente: 12,
    cliente_nombre_completo: "Carlos Mendoza Ramos",
    cliente_documento: "45892301",
    cliente_licencia: "Q45892301",
    id_vehiculo: 102,
    placa: "DEF-456",
    vehiculo_descripcion: "Hyundai Tucson",
    categoria: "SUV Compacta",
    sucursal_retiro: "Lima Centro - Principal",
    sucursal_devolucion: "Lima Centro - Principal",
    id_empleado_entrega: 2,
    empleado_entrega: "Rosa Salazar Poma",
    id_empleado_devolucion: null,
    empleado_devolucion: null,
    km_salida: 15200,
    km_retorno: null,
    combustible_salida: "LLENO",
    combustible_retorno: null,
    danos_salida: "Sin novedades",
    danos_retorno: null,
    cargos_adicionales: 0.0,
  },
  {
    id_alquiler: 502,
    nro_contrato: "CTR-2026-0090",
    estado_alquiler: "ATRASADO",
    fecha_entrega: "2026-11-05T10:00:00Z",
    fecha_dev_prevista: "2026-11-09T10:00:00Z",
    fecha_dev_real: null,
    tarifa_diaria_aplicada: 290.0,
    costo_total_final: null,
    id_reserva: 302,
    codigo_reserva: "RSV-8950",
    estado_reserva: "COMPLETADA",
    reserva_fecha_inicio: "2026-11-05T10:00:00Z",
    reserva_fecha_fin: "2026-11-09T10:00:00Z",
    tarifa_diaria_pactada: 290.0,
    total_estimado: 1160.0,
    id_cliente: 15,
    cliente_nombre_completo: "Mariana Alva Torres",
    cliente_documento: "72109432",
    cliente_licencia: "Q72109432",
    id_vehiculo: 103,
    placa: "GHI-789",
    vehiculo_descripcion: "Toyota Hilux 4x4",
    categoria: "Pick-up Todo Terreno",
    sucursal_retiro: "Miraflores Express",
    sucursal_devolucion: "Miraflores Express",
    id_empleado_entrega: 3,
    empleado_entrega: "Luis Quispe Huaman",
    id_empleado_devolucion: null,
    empleado_devolucion: null,
    km_salida: 42100,
    km_retorno: null,
    combustible_salida: "LLENO",
    combustible_retorno: null,
    danos_salida: "Raspón menor guardabarro trasero derecho",
    danos_retorno: null,
    cargos_adicionales: 0.0,
  },
  {
    id_alquiler: 503,
    nro_contrato: "CTR-2026-0085",
    estado_alquiler: "FINALIZADO",
    fecha_entrega: "2026-11-01T08:30:00Z",
    fecha_dev_prevista: "2026-11-04T18:00:00Z",
    fecha_dev_real: "2026-11-04T17:45:00Z",
    tarifa_diaria_aplicada: 120.0,
    costo_total_final: 480.0,
    id_reserva: 298,
    codigo_reserva: "RSV-8911",
    estado_reserva: "COMPLETADA",
    reserva_fecha_inicio: "2026-11-01T08:30:00Z",
    reserva_fecha_fin: "2026-11-04T18:00:00Z",
    tarifa_diaria_pactada: 120.0,
    total_estimado: 480.0,
    id_cliente: 19,
    cliente_nombre_completo: "Jorge Benavides Soto",
    cliente_documento: "10984532",
    cliente_licencia: "Q10984532",
    id_vehiculo: 101,
    placa: "ABC-123",
    vehiculo_descripcion: "Toyota Corolla",
    categoria: "Sedán Económico",
    sucursal_retiro: "Lima Centro - Principal",
    sucursal_devolucion: "Lima Centro - Principal",
    id_empleado_entrega: 2,
    empleado_entrega: "Rosa Salazar Poma",
    id_empleado_devolucion: 2,
    empleado_devolucion: "Rosa Salazar Poma",
    km_salida: 28100,
    km_retorno: 28450,
    combustible_salida: "LLENO",
    combustible_retorno: "LLENO",
    danos_salida: "Sin novedades",
    danos_retorno: "Entregado conforme e impecable",
    cargos_adicionales: 0.0,
  },
];

const MOCK_RESUMEN_FINANCIERO: ResumenFinancieroAlquiler[] = [
  {
    id_alquiler: 501,
    nro_contrato: "CTR-2026-0089",
    estado_alquiler: "EN_CURSO",
    total_anticipos: 200.0,
    total_pago_alquiler: 640.0,
    total_deposito_garantia: 800.0,
    total_devolucion_garantia: 0.0,
    total_penalidades: 0.0,
    ingreso_neto: 640.0,
    transacciones_aprobadas: 2,
    transacciones_pendientes: 0,
    transacciones_rechazadas: 0,
  },
  {
    id_alquiler: 502,
    nro_contrato: "CTR-2026-0090",
    estado_alquiler: "ATRASADO",
    total_anticipos: 300.0,
    total_pago_alquiler: 860.0,
    total_deposito_garantia: 1200.0,
    total_devolucion_garantia: 0.0,
    total_penalidades: 250.0,
    ingreso_neto: 1110.0,
    transacciones_aprobadas: 3,
    transacciones_pendientes: 1,
    transacciones_rechazadas: 0,
  },
  {
    id_alquiler: 503,
    nro_contrato: "CTR-2026-0085",
    estado_alquiler: "FINALIZADO",
    total_anticipos: 100.0,
    total_pago_alquiler: 380.0,
    total_deposito_garantia: 500.0,
    total_devolucion_garantia: 500.0,
    total_penalidades: 0.0,
    ingreso_neto: 380.0,
    transacciones_aprobadas: 3,
    transacciones_pendientes: 0,
    transacciones_rechazadas: 0,
  },
];

const MOCK_ALQUILERES_PENDIENTES: AlquilerPendiente[] = [
  {
    id_alquiler: 502,
    nro_contrato: "CTR-2026-0090",
    estado_alquiler: "ATRASADO",
    fecha_entrega: "2026-11-05T10:00:00Z",
    fecha_dev_prevista: "2026-11-09T10:00:00Z",
    dias_retraso: 2,
    cliente_nombre: "Mariana Alva Torres",
    cliente_telefono: "+51 984 123 765",
    cliente_email: "mariana.alva@outlook.com",
    placa: "GHI-789",
    vehiculo: "Toyota Hilux 4x4",
    categoria: "Pick-up Todo Terreno",
    sucursal_devolucion: "Miraflores Express",
  },
];

export async function getHistorialAlquileres(): Promise<ServiceResult<HistorialAlquiler[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_historial_alquiler")
      .select("*")
      .order("id_alquiler", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_HISTORIAL_ALQUILERES,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as HistorialAlquiler[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar historial de alquileres";
    return {
      data: MOCK_HISTORIAL_ALQUILERES,
      isFallback: true,
      error: message,
    };
  }
}

export async function getResumenFinanciero(): Promise<ServiceResult<ResumenFinancieroAlquiler[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_resumen_financiero_alquiler")
      .select("*")
      .order("id_alquiler", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_RESUMEN_FINANCIERO,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as ResumenFinancieroAlquiler[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar resumen financiero";
    return {
      data: MOCK_RESUMEN_FINANCIERO,
      isFallback: true,
      error: message,
    };
  }
}

export async function getAlquileresPendientesAlertas(): Promise<ServiceResult<AlquilerPendiente[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_alquileres_pendientes")
      .select("*")
      .order("dias_retraso", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_ALQUILERES_PENDIENTES,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as AlquilerPendiente[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar alertas pendientes";
    return {
      data: MOCK_ALQUILERES_PENDIENTES,
      isFallback: true,
      error: message,
    };
  }
}
