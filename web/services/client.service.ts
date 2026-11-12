import { supabase } from "@/lib/supabase";
import { PerfilCliente } from "@/types/database";
import { ServiceResult } from "./fleet.service";

export async function getPerfilesClientes(): Promise<ServiceResult<PerfilCliente[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_perfil_cliente")
      .select("*")
      .order("monto_total_pagado", { ascending: false });

    if (error) {
      return {
        data: [],
        error: error.message,
      };
    }

    return {
      data: (data as PerfilCliente[]) || [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar vw_perfil_cliente";
    return {
      data: [],
      error: message,
    };
  }
}
