import { supabase } from '@/lib/supabase';

export interface ReservaConCliente {
  id_reserva: number;
  codigo_reserva: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin: string;
  total_estimado: number;
  id_cliente: number;
  id_vehiculo: number | null;
  id_categoria: number;
  id_sucursal_retiro: number;
  id_sucursal_devolucion: number;
  tarifa_diaria_pactada: number;
  cliente?: {
    id_persona: number;
    persona?: {
      nombres: string;
      apellidos: string;
      nro_documento: string;
      email?: string;
    } | null;
  } | null;
  persona?: {
    nombres?: string;
    apellidos?: string;
    nombre?: string;
    apellido_paterno?: string;
    dni?: string;
    nro_documento?: string;
  } | null;
  vehiculo?: {
    placa: string;
    marca: string;
    modelo: string;
  } | null;
  categoria?: {
    nombre: string;
  } | null;
  [key: string]: unknown;
}

export interface CreateAlquilerInput {
  id_reserva: number;
  id_vehiculo: number;
  id_empleado_entrega: number;
  id_empleado_devolucion?: number | null;
  fecha_entrega: string;
  fecha_dev_prevista: string;
  tarifa_diaria_aplicada: number;
  costo_total_final?: number | null;
  [key: string]: unknown;
}

export interface Alquiler {
  id_alquiler: number;
  nro_contrato: string;
  id_reserva: number;
  id_vehiculo: number;
  id_empleado_entrega: number;
  estado: string;
  fecha_entrega: string;
  fecha_dev_prevista: string;
  tarifa_diaria_aplicada: number;
  costo_total_final: number | null;
  [key: string]: unknown;
}

export interface Cliente {
  [key: string]: unknown;
}

/**
 * Obtiene todas las reservas con datos del cliente y vehículo.
 */
export async function getAllReservas(): Promise<{
  data: ReservaConCliente[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('reserva')
      .select(`
        *,
        cliente:cliente!id_cliente (
          id_persona,
          persona:persona!id_persona (
            nombres,
            apellidos,
            nro_documento,
            email
          )
        ),
        vehiculo:vehiculo!id_vehiculo (
          placa,
          marca,
          modelo
        ),
        categoria:categoria!id_categoria (
          nombre
        )
      `)
      .order('id_reserva', { ascending: false });

    if (error) {
      // Fallback a select plano
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('reserva')
        .select('*')
        .order('id_reserva', { ascending: false });

      if (fallbackError) {
        return { data: [], error: new Error(fallbackError.message) };
      }
      return { data: (fallbackData as ReservaConCliente[]) ?? [], error: null };
    }

    return { data: (data as ReservaConCliente[]) ?? [], error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al consultar reservas';
    return { data: [], error: new Error(msg) };
  }
}

/**
 * Confirma una reserva: cambia estado a CONFIRMADA y marca el vehículo como RESERVADO si aplica.
 */
export async function confirmReserva(
  idReserva: number
): Promise<{ error: Error | null }> {
  try {
    const { data: reserva, error: fetchError } = await supabase
      .from('reserva')
      .select('id_vehiculo')
      .eq('id_reserva', idReserva)
      .single();

    if (fetchError) {
      return { error: new Error(fetchError.message) };
    }

    const { error: updateError } = await supabase
      .from('reserva')
      .update({ estado: 'CONFIRMADA' })
      .eq('id_reserva', idReserva);

    if (updateError) {
      return { error: new Error(updateError.message) };
    }

    if (reserva?.id_vehiculo) {
      const { error: vehiculoError } = await supabase
        .from('vehiculo')
        .update({ estado: 'RESERVADO' })
        .eq('id_vehiculo', reserva.id_vehiculo);

      if (vehiculoError) {
        return { error: new Error(vehiculoError.message) };
      }
    }

    return { error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al confirmar reserva';
    return { error: new Error(msg) };
  }
}

/**
 * Cancela una reserva: cambia estado a CANCELADA y libera el vehículo si estaba asignado.
 */
export async function cancelReserva(
  idReserva: number
): Promise<{ error: Error | null }> {
  try {
    const { data: reserva } = await supabase
      .from('reserva')
      .select('id_vehiculo')
      .eq('id_reserva', idReserva)
      .single();

    const { error } = await supabase
      .from('reserva')
      .update({ estado: 'CANCELADA' })
      .eq('id_reserva', idReserva);

    if (error) {
      return { error: new Error(error.message) };
    }

    if (reserva?.id_vehiculo) {
      await supabase
        .from('vehiculo')
        .update({ estado: 'DISPONIBLE' })
        .eq('id_vehiculo', reserva.id_vehiculo);
    }

    return { error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al cancelar reserva';
    return { error: new Error(msg) };
  }
}

/**
 * Crea un nuevo contrato de alquiler en estado EN_CURSO.
 */
export async function createAlquiler(
  input: CreateAlquilerInput
): Promise<{ data: Alquiler | null; error: Error | null }> {
  try {
    const nroContrato = 'CTR-' + Date.now().toString(36).toUpperCase();

    const { data, error } = await supabase
      .from('alquiler')
      .insert({
        nro_contrato: nroContrato,
        estado: 'EN_CURSO',
        id_reserva: input.id_reserva,
        id_vehiculo: input.id_vehiculo,
        id_empleado_entrega: input.id_empleado_entrega,
        id_empleado_devolucion: input.id_empleado_devolucion ?? null,
        fecha_entrega: input.fecha_entrega,
        fecha_dev_prevista: input.fecha_dev_prevista,
        tarifa_diaria_aplicada: input.tarifa_diaria_aplicada,
        costo_total_final: input.costo_total_final ?? null,
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    // Marcar vehículo como ALQUILADO
    await supabase
      .from('vehiculo')
      .update({ estado: 'ALQUILADO' })
      .eq('id_vehiculo', input.id_vehiculo);

    return { data: data as Alquiler, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar contrato';
    return { data: null, error: new Error(msg) };
  }
}

/**
 * Obtiene todos los clientes desde la vista vw_perfil_cliente.
 */
export async function getAllClientes(): Promise<{
  data: Cliente[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('vw_perfil_cliente')
      .select('*');

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    return { data: (data as Cliente[]) ?? [], error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al consultar clientes';
    return { data: [], error: new Error(msg) };
  }
}
