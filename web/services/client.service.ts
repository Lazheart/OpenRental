import { supabase } from "@/lib/supabase";
import { PerfilCliente } from "@/types/database";
import { ServiceResult } from "./fleet.service";

const MOCK_PERFILES_CLIENTE: PerfilCliente[] = [
  {
    id_cliente: 12,
    tipo_documento: "DNI",
    nro_documento: "45892301",
    nombres: "Carlos",
    apellidos: "Mendoza Ramos",
    nombre_completo: "Carlos Mendoza Ramos",
    telefono: "+51 978 456 123",
    email: "carlos.mendoza@gmail.com",
    activo: true,
    nro_licencia: "Q45892301",
    licencia_vencimiento: "2028-09-15",
    pais_licencia: "PERU",
    direccion: "Av. Arequipa 2450, Lince",
    fecha_registro: "2024-03-10T14:20:00Z",
    total_reservas: 6,
    reservas_completadas: 5,
    reservas_canceladas: 1,
    reservas_no_show: 0,
    total_alquileres: 5,
    alquileres_finalizados: 4,
    alquileres_activos: 1,
    monto_total_pagado: 4250.0,
  },
  {
    id_cliente: 15,
    tipo_documento: "DNI",
    nro_documento: "72109432",
    nombres: "Mariana",
    apellidos: "Alva Torres",
    nombre_completo: "Mariana Alva Torres",
    telefono: "+51 984 123 765",
    email: "mariana.alva@outlook.com",
    activo: true,
    nro_licencia: "Q72109432",
    licencia_vencimiento: "2027-11-20",
    pais_licencia: "PERU",
    direccion: "Calle Los Pinos 142, Miraflores",
    fecha_registro: "2023-08-14T11:00:00Z",
    total_reservas: 8,
    reservas_completadas: 6,
    reservas_canceladas: 0,
    reservas_no_show: 2,
    total_alquileres: 6,
    alquileres_finalizados: 5,
    alquileres_activos: 1,
    monto_total_pagado: 6890.0,
  },
  {
    id_cliente: 19,
    tipo_documento: "DNI",
    nro_documento: "10984532",
    nombres: "Jorge",
    apellidos: "Benavides Soto",
    nombre_completo: "Jorge Benavides Soto",
    telefono: "+51 945 678 901",
    email: "jorge.benavides@empresa.com.pe",
    activo: true,
    nro_licencia: "Q10984532",
    licencia_vencimiento: "2029-05-10",
    pais_licencia: "PERU",
    direccion: "Jr. Huancavelica 550, Lima",
    fecha_registro: "2022-01-20T09:15:00Z",
    total_reservas: 14,
    reservas_completadas: 14,
    reservas_canceladas: 0,
    reservas_no_show: 0,
    total_alquileres: 14,
    alquileres_finalizados: 14,
    alquileres_activos: 0,
    monto_total_pagado: 12400.0,
  },
  {
    id_cliente: 24,
    tipo_documento: "PASAPORTE",
    nro_documento: "PAS-982341",
    nombres: "Ethan",
    apellidos: "Smith",
    nombre_completo: "Ethan Smith",
    telefono: "+1 415 889 0214",
    email: "ethan.smith@techcorp.io",
    activo: true,
    nro_licencia: "DL-USA-89421",
    licencia_vencimiento: "2026-12-31",
    pais_licencia: "USA",
    direccion: "San Francisco, California",
    fecha_registro: "2025-05-02T16:40:00Z",
    total_reservas: 3,
    reservas_completadas: 2,
    reservas_canceladas: 1,
    reservas_no_show: 0,
    total_alquileres: 2,
    alquileres_finalizados: 2,
    alquileres_activos: 0,
    monto_total_pagado: 1890.0,
  },
];

export async function getPerfilesClientes(): Promise<ServiceResult<PerfilCliente[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_perfil_cliente")
      .select("*")
      .order("monto_total_pagado", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_PERFILES_CLIENTE,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as PerfilCliente[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar perfiles de clientes";
    return {
      data: MOCK_PERFILES_CLIENTE,
      isFallback: true,
      error: message,
    };
  }
}
