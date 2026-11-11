import { supabase } from "@/lib/supabase";
import { HistorialMantenimiento } from "@/types/database";
import { ServiceResult } from "./fleet.service";

const MOCK_HISTORIAL_MANTENIMIENTO: HistorialMantenimiento[] = [
  {
    id_mantenimiento: 801,
    tipo_mantenimiento: "PREVENTIVO",
    estado_mantenimiento: "EN_PROCESO",
    descripcion: "Cambio de aceite sintético 5W-30, filtro de aceite y rotación de neumáticos 40,000 km",
    taller: "Taller Central Miraflores",
    km_al_servicio: 39500,
    costo: 380.0,
    fecha_inicio: "2026-11-10T08:00:00Z",
    fecha_fin: null,
    id_vehiculo: 104,
    placa: "JKL-012",
    vehiculo_descripcion: "Kia Sportage",
    categoria: "SUV Compacta",
    kilometraje_actual: 39500,
    id_empleado: 8,
    empleado_responsable: "Walter Palomino Cárdenas",
    cargo_empleado: "MECANICO",
    sucursal_actual: "Aeropuerto Jorge Chávez",
  },
  {
    id_mantenimiento: 802,
    tipo_mantenimiento: "CORRECTIVO",
    estado_mantenimiento: "COMPLETADO",
    descripcion: "Sustitución de pastillas de freno delanteras y rectificación de discos",
    taller: "Frenos & Embragues Express",
    km_al_servicio: 26800,
    costo: 620.0,
    fecha_inicio: "2026-10-15T09:30:00Z",
    fecha_fin: "2026-10-16T17:00:00Z",
    id_vehiculo: 101,
    placa: "ABC-123",
    vehiculo_descripcion: "Toyota Corolla",
    categoria: "Sedán Económico",
    kilometraje_actual: 28450,
    id_empleado: 8,
    empleado_responsable: "Walter Palomino Cárdenas",
    cargo_empleado: "MECANICO",
    sucursal_actual: "Lima Centro - Principal",
  },
  {
    id_mantenimiento: 803,
    tipo_mantenimiento: "REVISION_TECNICA",
    estado_mantenimiento: "COMPLETADO",
    descripcion: "Inspección técnica anual reglamentaria y calibración de suspensión",
    taller: "Centro de Inspección Autorizado",
    km_al_servicio: 38000,
    costo: 250.0,
    fecha_inicio: "2026-09-20T10:00:00Z",
    fecha_fin: "2026-09-20T16:00:00Z",
    id_vehiculo: 103,
    placa: "GHI-789",
    vehiculo_descripcion: "Toyota Hilux 4x4",
    categoria: "Pick-up Todo Terreno",
    kilometraje_actual: 42100,
    id_empleado: 9,
    empleado_responsable: "Esteban Rivas Medina",
    cargo_empleado: "SUPERVISOR",
    sucursal_actual: "Miraflores Express",
  },
];

export async function getHistorialMantenimiento(): Promise<ServiceResult<HistorialMantenimiento[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_historial_mantenimiento")
      .select("*")
      .order("id_mantenimiento", { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_HISTORIAL_MANTENIMIENTO,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as HistorialMantenimiento[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar historial de mantenimiento";
    return {
      data: MOCK_HISTORIAL_MANTENIMIENTO,
      isFallback: true,
      error: message,
    };
  }
}
