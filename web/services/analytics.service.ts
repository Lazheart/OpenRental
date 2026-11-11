import { supabase } from "@/lib/supabase";
import {
  DisponibilidadAntiSolapamientoResult,
  UtilizacionIngresoCategoriaMes,
  ClienteSiniestralidadAlta,
  RentabilidadUnidad,
  AuditoriaContratosIncompletos,
} from "@/types/database";
import { ServiceResult } from "./fleet.service";

export interface DisponibilidadFilters {
  idCategoria?: number | "ALL";
  idSucursal?: number | "ALL";
  fechaInicio: string;
  fechaFin: string;
}

const MOCK_ANTI_SOLAPAMIENTO: DisponibilidadAntiSolapamientoResult[] = [
  {
    id_vehiculo: 102,
    placa: "DEF-456",
    marca: "Hyundai",
    modelo: "Tucson",
    anio: 2024,
    color: "Gris Grafito",
    transmision: "AUTOMATICA",
    combustible: "GASOLINA",
    capacidad_pasajeros: 5,
    kilometraje_actual: 15200,
    tarifa_aplicable: 210.0,
    categoria: "SUV Compacta",
    sucursal: "Lima Centro - Principal",
  },
  {
    id_vehiculo: 106,
    placa: "PQR-678",
    marca: "Ford",
    modelo: "Ranger XLT",
    anio: 2023,
    color: "Rojo Rubí",
    transmision: "AUTOMATICA",
    combustible: "DIESEL",
    capacidad_pasajeros: 5,
    kilometraje_actual: 31200,
    tarifa_aplicable: 310.0,
    categoria: "Pick-up Todo Terreno",
    sucursal: "Lima Centro - Principal",
  },
  {
    id_vehiculo: 101,
    placa: "ABC-123",
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2023,
    color: "Blanco Glaciar",
    transmision: "AUTOMATICA",
    combustible: "GASOLINA",
    capacidad_pasajeros: 5,
    kilometraje_actual: 28450,
    tarifa_aplicable: 120.0,
    categoria: "Sedán Económico",
    sucursal: "Lima Centro - Principal",
  },
];

const MOCK_UTILIZACION_MES: UtilizacionIngresoCategoriaMes[] = [
  {
    mes: "2026-11-01",
    id_categoria: 4,
    categoria: "Pick-up Todo Terreno",
    total_contratos: 24,
    dias_alquilados: 118,
    ingreso_total: 34220.0,
    ticket_promedio: 1425.83,
    ranking_ingreso_mes: 1,
  },
  {
    mes: "2026-11-01",
    id_categoria: 3,
    categoria: "SUV Compacta",
    total_contratos: 38,
    dias_alquilados: 152,
    ingreso_total: 31920.0,
    ticket_promedio: 840.0,
    ranking_ingreso_mes: 2,
  },
  {
    mes: "2026-11-01",
    id_categoria: 1,
    categoria: "Sedán Económico",
    total_contratos: 45,
    dias_alquilados: 180,
    ingreso_total: 21600.0,
    ticket_promedio: 480.0,
    ranking_ingreso_mes: 3,
  },
  {
    mes: "2026-10-01",
    id_categoria: 4,
    categoria: "Pick-up Todo Terreno",
    total_contratos: 28,
    dias_alquilados: 140,
    ingreso_total: 40600.0,
    ticket_promedio: 1450.0,
    ranking_ingreso_mes: 1,
  },
  {
    mes: "2026-10-01",
    id_categoria: 3,
    categoria: "SUV Compacta",
    total_contratos: 42,
    dias_alquilados: 168,
    ingreso_total: 35280.0,
    ticket_promedio: 840.0,
    ranking_ingreso_mes: 2,
  },
];

const MOCK_CLIENTES_SINIESTRALIDAD: ClienteSiniestralidadAlta[] = [
  {
    id_cliente: 15,
    nombre_completo: "Mariana Alva Torres",
    nro_documento: "72109432",
    email: "mariana.alva@outlook.com",
    nro_licencia: "Q72109432",
    total_contratos: 6,
    devoluciones_tardias: 3,
    reservas_no_show: 2,
    total_cargos_inspeccion: 450.0,
    total_penalidades: 600.0,
    siniestralidad_total: 1050.0,
  },
  {
    id_cliente: 31,
    nombre_completo: "Gonzalo Farfán Herrera",
    nro_documento: "41982341",
    email: "gonzalo.farfan@gmail.com",
    nro_licencia: "Q41982341",
    total_contratos: 4,
    devoluciones_tardias: 2,
    reservas_no_show: 1,
    total_cargos_inspeccion: 520.0,
    total_penalidades: 350.0,
    siniestralidad_total: 870.0,
  },
  {
    id_cliente: 42,
    nombre_completo: "Lucía Paredes Zúñiga",
    nro_documento: "46781290",
    email: "lucia.pz@hotmail.com",
    nro_licencia: "Q46781290",
    total_contratos: 3,
    devoluciones_tardias: 1,
    reservas_no_show: 3,
    total_cargos_inspeccion: 300.0,
    total_penalidades: 400.0,
    siniestralidad_total: 700.0,
  },
];

const MOCK_RENTABILIDAD_UNIDAD: RentabilidadUnidad[] = [
  {
    id_vehiculo: 106,
    placa: "PQR-678",
    vehiculo_descripcion: "Ford Ranger XLT",
    categoria: "Pick-up Todo Terreno",
    ingresos_totales: 28400.0,
    costos_mantenimiento: 1850.0,
    margen_neto: 26550.0,
    ranking_categoria: 1,
  },
  {
    id_vehiculo: 103,
    placa: "GHI-789",
    vehiculo_descripcion: "Toyota Hilux 4x4",
    categoria: "Pick-up Todo Terreno",
    ingresos_totales: 26100.0,
    costos_mantenimiento: 2200.0,
    margen_neto: 23900.0,
    ranking_categoria: 2,
  },
  {
    id_vehiculo: 102,
    placa: "DEF-456",
    vehiculo_descripcion: "Hyundai Tucson",
    categoria: "SUV Compacta",
    ingresos_totales: 19800.0,
    costos_mantenimiento: 1200.0,
    margen_neto: 18600.0,
    ranking_categoria: 1,
  },
  {
    id_vehiculo: 101,
    placa: "ABC-123",
    vehiculo_descripcion: "Toyota Corolla",
    categoria: "Sedán Económico",
    ingresos_totales: 14200.0,
    costos_mantenimiento: 1100.0,
    margen_neto: 13100.0,
    ranking_categoria: 1,
  },
  {
    id_vehiculo: 104,
    placa: "JKL-012",
    vehiculo_descripcion: "Kia Sportage",
    categoria: "SUV Compacta",
    ingresos_totales: 11400.0,
    costos_mantenimiento: 3400.0,
    margen_neto: 8000.0,
    ranking_categoria: 2,
  },
];

const MOCK_AUDITORIA_INCOMPLETOS: AuditoriaContratosIncompletos[] = [
  {
    id_alquiler: 489,
    nro_contrato: "CTR-2026-0062",
    cliente: "Marcos Villanueva Cruz",
    placa: "DEF-456",
    fecha_entrega: "2026-10-18T10:00:00Z",
    fecha_dev_real: "2026-10-22T19:30:00Z",
    motivo_inconsistencia: "Falta registro de kilometraje retorno en inspección",
  },
  {
    id_alquiler: 471,
    nro_contrato: "CTR-2026-0044",
    cliente: "Renato Dávila Castro",
    placa: "PQR-678",
    fecha_entrega: "2026-10-02T08:00:00Z",
    fecha_dev_real: "2026-10-06T18:00:00Z",
    motivo_inconsistencia: "Depósito de garantía no liquidado (sin devolución ni penalidad)",
  },
];

export async function getDisponibilidadAntiSolapamiento(
  filters: DisponibilidadFilters
): Promise<ServiceResult<DisponibilidadAntiSolapamientoResult[]>> {
  try {
    const { data, error } = await supabase.rpc("consultar_disponibilidad_flota", {
      p_id_categoria: filters.idCategoria === "ALL" ? null : filters.idCategoria,
      p_id_sucursal: filters.idSucursal === "ALL" ? null : filters.idSucursal,
      p_fecha_inicio: filters.fechaInicio,
      p_fecha_fin: filters.fechaFin,
    });

    if (error || !data || data.length === 0) {
      const res = [...MOCK_ANTI_SOLAPAMIENTO];
      return {
        data: res,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as DisponibilidadAntiSolapamientoResult[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar disponibilidad";
    return {
      data: MOCK_ANTI_SOLAPAMIENTO,
      isFallback: true,
      error: message,
    };
  }
}

export async function getUtilizacionIngresosPorMes(): Promise<
  ServiceResult<UtilizacionIngresoCategoriaMes[]>
> {
  try {
    const { data, error } = await supabase.rpc("consultar_utilizacion_ingresos_mes");

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_UTILIZACION_MES,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as UtilizacionIngresoCategoriaMes[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar utilización";
    return {
      data: MOCK_UTILIZACION_MES,
      isFallback: true,
      error: message,
    };
  }
}

export async function getClientesAltaSiniestralidad(): Promise<
  ServiceResult<ClienteSiniestralidadAlta[]>
> {
  try {
    const { data, error } = await supabase.rpc("consultar_clientes_siniestralidad");

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_CLIENTES_SINIESTRALIDAD,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as ClienteSiniestralidadAlta[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar siniestralidad";
    return {
      data: MOCK_CLIENTES_SINIESTRALIDAD,
      isFallback: true,
      error: message,
    };
  }
}

export async function getRentabilidadPorUnidad(): Promise<
  ServiceResult<RentabilidadUnidad[]>
> {
  try {
    const { data, error } = await supabase.rpc("consultar_rentabilidad_unidades");

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_RENTABILIDAD_UNIDAD,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as RentabilidadUnidad[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar rentabilidad";
    return {
      data: MOCK_RENTABILIDAD_UNIDAD,
      isFallback: true,
      error: message,
    };
  }
}

export async function getAuditoriaContratosIncompletos(): Promise<
  ServiceResult<AuditoriaContratosIncompletos[]>
> {
  try {
    const { data, error } = await supabase.rpc("consultar_auditoria_incompletos");

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_AUDITORIA_INCOMPLETOS,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as AuditoriaContratosIncompletos[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar auditoría";
    return {
      data: MOCK_AUDITORIA_INCOMPLETOS,
      isFallback: true,
      error: message,
    };
  }
}
