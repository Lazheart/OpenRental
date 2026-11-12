import { supabase } from "@/lib/supabase";
import { FichaVehiculo } from "@/types/database";

export interface ServiceResult<T> {
  data: T;
  error: string | null;
}

export async function getFichaVehiculos(): Promise<ServiceResult<FichaVehiculo[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_ficha_vehiculo")
      .select("*")
      .order("id_vehiculo", { ascending: true });

    if (error) {
      return {
        data: [],
        error: error.message,
      };
    }

    return {
      data: (data as FichaVehiculo[]) || [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al conectar con la API de Supabase";
    return {
      data: [],
      error: message,
    };
  }
}

export async function getVehiculosDisponibles(): Promise<ServiceResult<FichaVehiculo[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_vehiculos_disponibles")
      .select("*")
      .order("tarifa_efectiva", { ascending: true });

    if (error) {
      return {
        data: [],
        error: error.message,
      };
    }

    return {
      data: (data as FichaVehiculo[]) || [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al conectar con la API de Supabase";
    return {
      data: [],
      error: message,
    };
  }
}
