import { supabase } from "@/lib/supabase";
import { HistorialMantenimiento } from "@/types/database";
import { ServiceResult } from "./fleet.service";

export async function getHistorialMantenimiento(): Promise<ServiceResult<HistorialMantenimiento[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_historial_mantenimiento")
      .select("*")
      .order("id_mantenimiento", { ascending: false });

    if (error) {
      return {
        data: [],
        error: error.message,
      };
    }

    return {
      data: (data as HistorialMantenimiento[]) || [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar vw_historial_mantenimiento";
    return {
      data: [],
      error: message,
    };
  }
}
