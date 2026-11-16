import { supabase } from '@/lib/supabase';

export interface CreateReservaInput {
  id_cliente?: number;
  id_categoria: number;
  id_vehiculo?: number;
  id_sucursal_retiro: number;
  id_sucursal_devolucion: number;
  fecha_inicio: string;
  fecha_fin: string;
  tarifa_diaria_pactada: number;
  total_estimado: number;
}

export interface VehiculoDisponible {
  id_vehiculo: number;
  placa: string;
  modelo: string;
  anio: number;
  id_categoria: number;
  nombre_categoria: string;
  id_sucursal: number;
  nombre_sucursal: string;
  tarifa_diaria: number;
  transmision?: string;
  combustible?: string;
  capacidad_pasajeros?: number;
  color?: string;
  [key: string]: unknown;
}

export interface Reserva {
  id_reserva: number;
  codigo_reserva: string;
  id_cliente: number;
  id_categoria: number;
  id_vehiculo: number | null;
  id_sucursal_retiro: number;
  id_sucursal_devolucion: number;
  fecha_inicio: string;
  fecha_fin: string;
  tarifa_diaria_pactada: number;
  total_estimado: number;
  estado: string;
  categoria?: { nombre: string } | null;
  vehiculo?: { placa: string; marca: string; modelo: string } | null;
  sucursal_retiro?: { nombre: string } | null;
  sucursal_devolucion?: { nombre: string } | null;
  [key: string]: unknown;
}

/**
 * Verifica disponibilidad de vehículos por categoría y sucursal en las fechas dadas.
 * Consulta la vista vw_vehiculos_disponibles y filtra conflictos en reserva.
 */
export async function checkAvailability(
  idCategoria: number,
  fechaInicio: string,
  fechaFin: string,
  idSucursal: number
): Promise<{ data: VehiculoDisponible[]; error: Error | null }> {
  try {
    let query = supabase.from('vw_vehiculos_disponibles').select('*');

    if (idCategoria && idCategoria > 0) {
      query = query.eq('id_categoria', idCategoria);
    }
    if (idSucursal && idSucursal > 0) {
      query = query.eq('id_sucursal', idSucursal);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: new Error(error.message) };
    }

    // Filtrar vehículos con solapamiento en reservas activas
    let conflictingVehiculoIds: number[] = [];
    if (fechaInicio && fechaFin) {
      const { data: overlappingReservas } = await supabase
        .from('reserva')
        .select('id_vehiculo')
        .not('id_vehiculo', 'is', null)
        .not('estado', 'in', '("CANCELADA","NO_SHOW")')
        .lte('fecha_inicio', fechaFin)
        .gte('fecha_fin', fechaInicio);

      if (overlappingReservas) {
        conflictingVehiculoIds = overlappingReservas
          .map((r: { id_vehiculo: number | null }) => r.id_vehiculo)
          .filter((id): id is number => typeof id === 'number');
      }
    }

    const available: VehiculoDisponible[] = ((data as Record<string, unknown>[]) ?? [])
      .filter((row) => !conflictingVehiculoIds.includes(Number(row.id_vehiculo)))
      .map((row) => ({
        id_vehiculo: Number(row.id_vehiculo),
        placa: String(row.placa ?? ''),
        modelo: `${row.marca ?? ''} ${row.modelo ?? ''}`.trim(),
        anio: Number(row.anio ?? 0),
        id_categoria: Number(row.id_categoria),
        nombre_categoria: String(row.categoria_nombre ?? ''),
        id_sucursal: Number(row.id_sucursal),
        nombre_sucursal: String(row.sucursal_nombre ?? ''),
        tarifa_diaria: Number(row.tarifa_efectiva ?? row.tarifa_base_diaria ?? 0),
        transmision: row.transmision as string | undefined,
        combustible: row.combustible as string | undefined,
        capacidad_pasajeros: row.capacidad_pasajeros as number | undefined,
        color: row.color as string | undefined,
      }));

    return { data: available, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al consultar disponibilidad';
    return { data: [], error: new Error(msg) };
  }
}

/**
 * Crea una nueva reserva en estado PENDIENTE.
 */
export async function createReserva(
  input: CreateReservaInput
): Promise<{ data: Reserva | null; error: Error | null }> {
  try {
    let effectiveClientId = input.id_cliente;

    if (!effectiveClientId || effectiveClientId <= 0) {
      const { data: personaId } = await supabase.rpc('get_my_persona_id');
      if (personaId && typeof personaId === 'number') {
        effectiveClientId = personaId;
      } else {
        // Fallback a cliente existente (id_persona 7) para demo fluida
        const { data: firstClient } = await supabase
          .from('cliente')
          .select('id_persona')
          .limit(1)
          .maybeSingle();
        effectiveClientId = firstClient?.id_persona ?? 7;
      }
    }

    const codigoReserva = 'RES-' + Date.now().toString(36).toUpperCase();

    const { data, error } = await supabase
      .from('reserva')
      .insert({
        codigo_reserva: codigoReserva,
        id_cliente: effectiveClientId,
        id_categoria: input.id_categoria,
        id_vehiculo: input.id_vehiculo ?? null,
        id_sucursal_retiro: input.id_sucursal_retiro,
        id_sucursal_devolucion: input.id_sucursal_devolucion,
        fecha_inicio: input.fecha_inicio,
        fecha_fin: input.fecha_fin,
        tarifa_diaria_pactada: input.tarifa_diaria_pactada,
        total_estimado: input.total_estimado,
        estado: 'PENDIENTE',
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Reserva, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al crear reserva';
    return { data: null, error: new Error(msg) };
  }
}

/**
 * Obtiene las reservas de un cliente específico o del usuario autenticado.
 */
export async function getMyReservas(
  idCliente?: number
): Promise<{ data: Reserva[]; error: Error | null }> {
  try {
    let effectiveClientId = idCliente && idCliente > 0 ? idCliente : undefined;

    if (!effectiveClientId) {
      const { data: personaId } = await supabase.rpc('get_my_persona_id');
      if (personaId && typeof personaId === 'number') {
        effectiveClientId = personaId;
      }
    }

    let query = supabase
      .from('reserva')
      .select(`
        *,
        categoria:categoria!id_categoria (nombre),
        vehiculo:vehiculo!id_vehiculo (placa, marca, modelo),
        sucursal_retiro:sucursal!id_sucursal_retiro (nombre),
        sucursal_devolucion:sucursal!id_sucursal_devolucion (nombre)
      `)
      .order('id_reserva', { ascending: false });

    if (effectiveClientId) {
      query = query.eq('id_cliente', effectiveClientId);
    }

    const { data, error } = await query;

    if (error) {
      // Fallback si la relación anidada tiene restricciones
      const fallbackQuery = supabase
        .from('reserva')
        .select('*')
        .order('id_reserva', { ascending: false });

      if (effectiveClientId) {
        fallbackQuery.eq('id_cliente', effectiveClientId);
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      if (fallbackError) {
        return { data: [], error: new Error(fallbackError.message) };
      }
      return { data: (fallbackData as Reserva[]) ?? [], error: null };
    }

    return { data: (data as Reserva[]) ?? [], error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al consultar reservas';
    return { data: [], error: new Error(msg) };
  }
}

/**
 * Actualiza el estado de una reserva (usado por agentes).
 */
export async function updateReservaEstado(
  idReserva: number,
  estado: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('reserva')
      .update({ estado })
      .eq('id_reserva', idReserva);

    return { error: error ? new Error(error.message) : null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar reserva';
    return { error: new Error(msg) };
  }
}
