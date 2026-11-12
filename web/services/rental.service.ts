import { supabase } from "@/lib/supabase";
import {
  HistorialAlquiler,
  ResumenFinancieroAlquiler,
  AlquilerPendiente,
} from "@/types/database";
import { ServiceResult } from "./fleet.service";

export async function getHistorialAlquileres(): Promise<ServiceResult<HistorialAlquiler[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_historial_alquiler")
      .select("*")
      .order("id_alquiler", { ascending: false });

    if (error) {
      return {
        data: [],
        error: error.message,
      };
    }

    return {
      data: (data as HistorialAlquiler[]) || [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar vw_historial_alquiler";
    return {
      data: [],
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

    if (error) {
      return {
        data: [],
        error: error.message,
      };
    }

    return {
      data: (data as ResumenFinancieroAlquiler[]) || [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar vw_resumen_financiero_alquiler";
    return {
      data: [],
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

    if (error) {
      return {
        data: [],
        error: error.message,
      };
    }

    return {
      data: (data as AlquilerPendiente[]) || [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar vw_alquileres_pendientes";
    return {
      data: [],
      error: message,
    };
  }
}
