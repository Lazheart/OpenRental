import { supabase } from "@/lib/supabase";
import { FichaVehiculo } from "@/types/database";

export interface ServiceResult<T> {
  data: T;
  isFallback: boolean;
  error?: string;
}

const MOCK_FICHA_VEHICULOS: FichaVehiculo[] = [
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
    estado_vehiculo: "DISPONIBLE",
    vehiculo_activo: true,
    tarifa_efectiva: 120.0,
    id_categoria: 1,
    categoria_nombre: "Sedán Económico",
    tarifa_base_diaria: 110.0,
    monto_garantia_base: 500.0,
    id_sucursal: 1,
    sucursal_nombre: "Lima Centro - Principal",
    sucursal_ciudad: "Lima",
  },
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
    estado_vehiculo: "DISPONIBLE",
    vehiculo_activo: true,
    tarifa_efectiva: 210.0,
    id_categoria: 3,
    categoria_nombre: "SUV Compacta",
    tarifa_base_diaria: 190.0,
    monto_garantia_base: 800.0,
    id_sucursal: 1,
    sucursal_nombre: "Lima Centro - Principal",
    sucursal_ciudad: "Lima",
  },
  {
    id_vehiculo: 103,
    placa: "GHI-789",
    marca: "Toyota",
    modelo: "Hilux 4x4",
    anio: 2023,
    color: "Plata Metálico",
    transmision: "MANUAL",
    combustible: "DIESEL",
    capacidad_pasajeros: 5,
    kilometraje_actual: 42100,
    estado_vehiculo: "ALQUILADO",
    vehiculo_activo: true,
    tarifa_efectiva: 290.0,
    id_categoria: 4,
    categoria_nombre: "Pick-up Todo Terreno",
    tarifa_base_diaria: 280.0,
    monto_garantia_base: 1200.0,
    id_sucursal: 2,
    sucursal_nombre: "Miraflores Express",
    sucursal_ciudad: "Lima",
  },
  {
    id_vehiculo: 104,
    placa: "JKL-012",
    marca: "Kia",
    modelo: "Sportage",
    anio: 2022,
    color: "Negro Ébano",
    transmision: "AUTOMATICA",
    combustible: "GASOLINA",
    capacidad_pasajeros: 5,
    kilometraje_actual: 39500,
    estado_vehiculo: "EN_MANTENIMIENTO",
    vehiculo_activo: true,
    tarifa_efectiva: 195.0,
    id_categoria: 3,
    categoria_nombre: "SUV Compacta",
    tarifa_base_diaria: 190.0,
    monto_garantia_base: 800.0,
    id_sucursal: 3,
    sucursal_nombre: "Aeropuerto Jorge Chávez",
    sucursal_ciudad: "Callao",
  },
  {
    id_vehiculo: 105,
    placa: "MNO-345",
    marca: "Nissan",
    modelo: "Versa",
    anio: 2024,
    color: "Azul Marino",
    transmision: "MANUAL",
    combustible: "GASOLINA",
    capacidad_pasajeros: 5,
    kilometraje_actual: 9800,
    estado_vehiculo: "DISPONIBLE",
    vehiculo_activo: true,
    tarifa_efectiva: 110.0,
    id_categoria: 1,
    categoria_nombre: "Sedán Económico",
    tarifa_base_diaria: 110.0,
    monto_garantia_base: 500.0,
    id_sucursal: 2,
    sucursal_nombre: "Miraflores Express",
    sucursal_ciudad: "Lima",
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
    estado_vehiculo: "DISPONIBLE",
    vehiculo_activo: true,
    tarifa_efectiva: 310.0,
    id_categoria: 4,
    categoria_nombre: "Pick-up Todo Terreno",
    tarifa_base_diaria: 280.0,
    monto_garantia_base: 1200.0,
    id_sucursal: 1,
    sucursal_nombre: "Lima Centro - Principal",
    sucursal_ciudad: "Lima",
  },
];

export async function getFichaVehiculos(): Promise<ServiceResult<FichaVehiculo[]>> {
  try {
    const { data, error } = await supabase
      .from("vw_ficha_vehiculo")
      .select("*")
      .order("id_vehiculo", { ascending: true });

    if (error || !data || data.length === 0) {
      return {
        data: MOCK_FICHA_VEHICULOS,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as FichaVehiculo[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al conectar con Supabase";
    return {
      data: MOCK_FICHA_VEHICULOS,
      isFallback: true,
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

    if (error || !data || data.length === 0) {
      const filtered = MOCK_FICHA_VEHICULOS.filter(
        (v) => v.estado_vehiculo === "DISPONIBLE" && v.vehiculo_activo
      );
      return {
        data: filtered,
        isFallback: true,
        error: error?.message,
      };
    }

    return {
      data: data as FichaVehiculo[],
      isFallback: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al conectar con Supabase";
    const filtered = MOCK_FICHA_VEHICULOS.filter(
      (v) => v.estado_vehiculo === "DISPONIBLE" && v.vehiculo_activo
    );
    return {
      data: filtered,
      isFallback: true,
      error: message,
    };
  }
}
