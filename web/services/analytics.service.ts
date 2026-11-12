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

interface RawVehiculoRow {
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  transmision: string;
  combustible: string;
  capacidad_pasajeros: number;
  kilometraje_actual: number;
  tarifa_diaria: number | null;
  id_categoria: number;
  id_sucursal_actual: number;
  categoria?: { id_categoria: number; nombre: string; tarifa_base_diaria: number } | null;
  sucursal?: { id_sucursal: number; nombre: string } | null;
}

interface OverlapIdRow {
  id_vehiculo: number;
}

interface RawAlquilerRow {
  id_alquiler: number;
  fecha_entrega: string;
  fecha_dev_prevista: string;
  fecha_dev_real: string | null;
  vehiculo?: {
    id_categoria: number;
    categoria?: { id_categoria: number; nombre: string } | null;
  } | null;
  pago?: Array<{
    monto: number;
    tipo_transaccion: string;
    estado: string;
  }> | null;
}

interface RawClienteRow {
  id_persona: number;
  nro_licencia: string | null;
  persona?: {
    nombres: string;
    apellidos: string;
    nro_documento: string;
    email: string;
  } | null;
  reserva?: Array<{
    id_reserva: number;
    estado: string;
    alquiler?: Array<{
      id_alquiler: number;
      fecha_dev_prevista: string;
      fecha_dev_real: string | null;
      inspeccion?: Array<{ cargos_adicionales: number | null }> | { cargos_adicionales: number | null } | null;
      pago?: Array<{
        monto: number;
        tipo_transaccion: string;
        estado: string;
      }> | null;
    }> | null;
  }> | null;
}

interface RawVehiculoRentabilidadRow {
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  id_categoria: number;
  categoria?: { nombre: string } | null;
  alquiler?: Array<{
    id_alquiler: number;
    pago?: Array<{
      monto: number;
      tipo_transaccion: string;
      estado: string;
    }> | null;
  }> | null;
  mantenimiento?: Array<{
    costo: number;
    estado: string;
  }> | null;
}

interface RawAuditoriaRow {
  id_alquiler: number;
  nro_contrato: string;
  fecha_entrega: string;
  fecha_dev_real: string | null;
  estado: string;
  vehiculo?: { placa: string } | null;
  reserva?: {
    cliente?: {
      persona?: {
        nombres: string;
        apellidos: string;
      } | null;
    } | null;
  } | null;
  inspeccion?: Array<{ km_retorno: number | null }> | { km_retorno: number | null } | null;
  pago?: Array<{
    tipo_transaccion: string;
    estado: string;
  }> | null;
}

export async function getDisponibilidadAntiSolapamiento(
  filters: DisponibilidadFilters
): Promise<ServiceResult<DisponibilidadAntiSolapamientoResult[]>> {
  try {
    // Intento 1: función RPC en Supabase
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "consultar_disponibilidad_flota",
      {
        p_id_categoria: filters.idCategoria === "ALL" ? null : filters.idCategoria,
        p_id_sucursal: filters.idSucursal === "ALL" ? null : filters.idSucursal,
        p_fecha_inicio: filters.fechaInicio,
        p_fecha_fin: filters.fechaFin,
      }
    );

    if (!rpcError && rpcData) {
      return {
        data: rpcData as DisponibilidadAntiSolapamientoResult[],
        error: null,
      };
    }

    // Intento 2: Consulta directa a las relaciones del modelo en Supabase
    let query = supabase
      .from("vehiculo")
      .select(`
        id_vehiculo,
        placa,
        marca,
        modelo,
        anio,
        color,
        transmision,
        combustible,
        capacidad_pasajeros,
        kilometraje_actual,
        tarifa_diaria,
        id_categoria,
        id_sucursal_actual,
        categoria:categoria(id_categoria, nombre, tarifa_base_diaria),
        sucursal:sucursal(id_sucursal, nombre)
      `)
      .eq("estado", "DISPONIBLE")
      .eq("activo", true);

    if (filters.idCategoria && filters.idCategoria !== "ALL") {
      query = query.eq("id_categoria", filters.idCategoria);
    }
    if (filters.idSucursal && filters.idSucursal !== "ALL") {
      query = query.eq("id_sucursal_actual", filters.idSucursal);
    }

    const { data: vehiculosRaw, error: vError } = await query;

    if (vError) {
      return {
        data: [],
        error: vError.message,
      };
    }

    const vehiculos = (vehiculosRaw as unknown as RawVehiculoRow[]) || [];

    if (vehiculos.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    const vehiculoIds = vehiculos.map((v) => v.id_vehiculo);

    // Consulta de solapamiento en reservas
    const { data: reservasRaw } = await supabase
      .from("reserva")
      .select("id_vehiculo")
      .in("id_vehiculo", vehiculoIds)
      .eq("estado", "CONFIRMADA")
      .lt("fecha_inicio", filters.fechaFin)
      .gt("fecha_fin", filters.fechaInicio);

    // Consulta de solapamiento en alquileres
    const { data: alquileresRaw } = await supabase
      .from("alquiler")
      .select("id_vehiculo")
      .in("id_vehiculo", vehiculoIds)
      .in("estado", ["EN_CURSO", "ATRASADO"])
      .lt("fecha_entrega", filters.fechaFin)
      .gt("fecha_dev_prevista", filters.fechaInicio);

    const reservasSolapadas = (reservasRaw as unknown as OverlapIdRow[]) || [];
    const alquileresSolapados = (alquileresRaw as unknown as OverlapIdRow[]) || [];

    const solapadosSet = new Set<number>();
    reservasSolapadas.forEach((r) => solapadosSet.add(r.id_vehiculo));
    alquileresSolapados.forEach((a) => solapadosSet.add(a.id_vehiculo));

    const disponibles: DisponibilidadAntiSolapamientoResult[] = vehiculos
      .filter((v) => !solapadosSet.has(v.id_vehiculo))
      .map((v) => ({
        id_vehiculo: v.id_vehiculo,
        placa: v.placa,
        marca: v.marca,
        modelo: v.modelo,
        anio: v.anio,
        color: v.color,
        transmision: v.transmision,
        combustible: v.combustible,
        capacidad_pasajeros: v.capacidad_pasajeros,
        kilometraje_actual: v.kilometraje_actual,
        tarifa_aplicable: v.tarifa_diaria ?? v.categoria?.tarifa_base_diaria ?? 0,
        categoria: v.categoria?.nombre ?? "Sin categoría",
        sucursal: v.sucursal?.nombre ?? "Sin sucursal",
      }));

    return {
      data: disponibles,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar disponibilidad";
    return {
      data: [],
      error: message,
    };
  }
}

export async function getUtilizacionIngresosPorMes(): Promise<
  ServiceResult<UtilizacionIngresoCategoriaMes[]>
> {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "consultar_utilizacion_ingresos_mes"
    );

    if (!rpcError && rpcData) {
      return {
        data: rpcData as UtilizacionIngresoCategoriaMes[],
        error: null,
      };
    }

    // Consulta a tablas de Supabase
    const { data: alquileresRaw, error: aError } = await supabase
      .from("alquiler")
      .select(`
        id_alquiler,
        fecha_entrega,
        fecha_dev_prevista,
        fecha_dev_real,
        vehiculo:vehiculo(
          id_categoria,
          categoria:categoria(id_categoria, nombre)
        ),
        pago:pago(
          monto,
          tipo_transaccion,
          estado
        )
      `);

    if (aError) {
      return {
        data: [],
        error: aError.message,
      };
    }

    const alquileres = (alquileresRaw as unknown as RawAlquilerRow[]) || [];

    if (alquileres.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    // Agregación mensual por categoría
    interface GroupKeyData {
      mes: string;
      id_categoria: number;
      categoria: string;
      total_contratos: number;
      dias_alquilados: number;
      ingreso_total: number;
    }

    const grupos: Record<string, GroupKeyData> = {};

    for (const a of alquileres) {
      if (!a.fecha_entrega) continue;
      const d = new Date(a.fecha_entrega);
      const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      const catId = a.vehiculo?.id_categoria ?? 0;
      const catNombre = a.vehiculo?.categoria?.nombre ?? "Sin Categoría";
      const key = `${mes}__${catId}`;

      const fSalida = new Date(a.fecha_entrega).getTime();
      const fFin = new Date(a.fecha_dev_real ?? a.fecha_dev_prevista).getTime();
      const dias = Math.max(1, Math.ceil((fFin - fSalida) / (1000 * 60 * 60 * 24)));

      const pagosAprobados = (a.pago || []).filter(
        (p) =>
          p.estado === "APROBADO" &&
          (p.tipo_transaccion === "PAGO_ALQUILER" || p.tipo_transaccion === "PENALIDAD")
      );
      const ingresoContrato = pagosAprobados.reduce(
        (sum: number, p) => sum + Number(p.monto || 0),
        0
      );

      if (!grupos[key]) {
        grupos[key] = {
          mes,
          id_categoria: catId,
          categoria: catNombre,
          total_contratos: 0,
          dias_alquilados: 0,
          ingreso_total: 0,
        };
      }

      grupos[key].total_contratos += 1;
      grupos[key].dias_alquilados += dias;
      grupos[key].ingreso_total += ingresoContrato;
    }

    // Calcular rankings por mes
    const resultado: UtilizacionIngresoCategoriaMes[] = Object.values(grupos).map(
      (g) => ({
        mes: g.mes,
        id_categoria: g.id_categoria,
        categoria: g.categoria,
        total_contratos: g.total_contratos,
        dias_alquilados: g.dias_alquilados,
        ingreso_total: g.ingreso_total,
        ticket_promedio:
          g.total_contratos > 0
            ? Math.round((g.ingreso_total / g.total_contratos) * 100) / 100
            : 0,
        ranking_ingreso_mes: 1,
      })
    );

    // Asignar ranking de ingreso por mes
    resultado.sort((x, y) => {
      if (x.mes !== y.mes) return y.mes.localeCompare(x.mes);
      return y.ingreso_total - x.ingreso_total;
    });

    const mesesVistos: Record<string, number> = {};
    for (const r of resultado) {
      mesesVistos[r.mes] = (mesesVistos[r.mes] || 0) + 1;
      r.ranking_ingreso_mes = mesesVistos[r.mes];
    }

    return {
      data: resultado,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar utilización";
    return {
      data: [],
      error: message,
    };
  }
}

export async function getClientesAltaSiniestralidad(): Promise<
  ServiceResult<ClienteSiniestralidadAlta[]>
> {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "consultar_clientes_siniestralidad"
    );

    if (!rpcError && rpcData) {
      return {
        data: rpcData as ClienteSiniestralidadAlta[],
        error: null,
      };
    }

    // Consulta directa a tablas
    const { data: clientesRaw, error: cError } = await supabase
      .from("cliente")
      .select(`
        id_persona,
        nro_licencia,
        persona:persona(nombres, apellidos, nro_documento, email),
        reserva:reserva(
          id_reserva,
          estado,
          alquiler:alquiler(
            id_alquiler,
            fecha_dev_prevista,
            fecha_dev_real,
            inspeccion:inspeccion(cargos_adicionales),
            pago:pago(monto, tipo_transaccion, estado)
          )
        )
      `);

    if (cError) {
      return {
        data: [],
        error: cError.message,
      };
    }

    const clientes = (clientesRaw as unknown as RawClienteRow[]) || [];

    if (clientes.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    interface ResCliente {
      id_cliente: number;
      nombre_completo: string;
      nro_documento: string;
      email: string;
      nro_licencia: string;
      total_contratos: number;
      devoluciones_tardias: number;
      reservas_no_show: number;
      total_cargos_inspeccion: number;
      total_penalidades: number;
      siniestralidad_total: number;
    }

    const calculados: ResCliente[] = [];

    for (const cl of clientes) {
      const persona = cl.persona;
      const nombreCompleto = persona
        ? `${persona.nombres || ""} ${persona.apellidos || ""}`.trim()
        : "Sin nombre";

      let totalContratos = 0;
      let devolucionesTardias = 0;
      let reservasNoShow = 0;
      let totalCargos = 0;
      let totalPenalidades = 0;

      for (const res of cl.reserva || []) {
        if (res.estado === "NO_SHOW") {
          reservasNoShow += 1;
        }

        for (const alq of res.alquiler || []) {
          totalContratos += 1;

          if (alq.fecha_dev_real && alq.fecha_dev_prevista) {
            if (new Date(alq.fecha_dev_real) > new Date(alq.fecha_dev_prevista)) {
              devolucionesTardias += 1;
            }
          }

          if (alq.inspeccion) {
            const inspList = Array.isArray(alq.inspeccion)
              ? alq.inspeccion
              : [alq.inspeccion];
            for (const ins of inspList) {
              totalCargos += Number(ins.cargos_adicionales || 0);
            }
          }

          for (const p of alq.pago || []) {
            if (p.tipo_transaccion === "PENALIDAD" && p.estado === "APROBADO") {
              totalPenalidades += Number(p.monto || 0);
            }
          }
        }
      }

      const siniestralidadTotal = totalCargos + totalPenalidades;

      calculados.push({
        id_cliente: cl.id_persona,
        nombre_completo: nombreCompleto,
        nro_documento: persona?.nro_documento ?? "",
        email: persona?.email ?? "",
        nro_licencia: cl.nro_licencia ?? "",
        total_contratos: totalContratos,
        devoluciones_tardias: devolucionesTardias,
        reservas_no_show: reservasNoShow,
        total_cargos_inspeccion: totalCargos,
        total_penalidades: totalPenalidades,
        siniestralidad_total: siniestralidadTotal,
      });
    }

    if (calculados.length === 0) {
      return { data: [], error: null };
    }

    const promedio =
      calculados.reduce((sum, c) => sum + c.siniestralidad_total, 0) /
      calculados.length;

    const superiores = calculados
      .filter((c) => c.siniestralidad_total > promedio)
      .sort((a, b) => b.siniestralidad_total - a.siniestralidad_total);

    return {
      data: superiores,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar siniestralidad";
    return {
      data: [],
      error: message,
    };
  }
}

export async function getRentabilidadPorUnidad(): Promise<
  ServiceResult<RentabilidadUnidad[]>
> {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "consultar_rentabilidad_unidades"
    );

    if (!rpcError && rpcData) {
      return {
        data: rpcData as RentabilidadUnidad[],
        error: null,
      };
    }

    // Consulta directa a tablas
    const { data: vehiculosRaw, error: vError } = await supabase
      .from("vehiculo")
      .select(`
        id_vehiculo,
        placa,
        marca,
        modelo,
        id_categoria,
        categoria:categoria(nombre),
        alquiler:alquiler(
          id_alquiler,
          pago:pago(monto, tipo_transaccion, estado)
        ),
        mantenimiento:mantenimiento(costo, estado)
      `);

    if (vError) {
      return {
        data: [],
        error: vError.message,
      };
    }

    const vehiculos = (vehiculosRaw as unknown as RawVehiculoRentabilidadRow[]) || [];

    if (vehiculos.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    const resultado: RentabilidadUnidad[] = [];

    for (const v of vehiculos) {
      let ingresos = 0;
      for (const a of v.alquiler || []) {
        for (const p of a.pago || []) {
          if (p.tipo_transaccion === "PAGO_ALQUILER" && p.estado === "APROBADO") {
            ingresos += Number(p.monto || 0);
          }
        }
      }

      let costos = 0;
      for (const m of v.mantenimiento || []) {
        if (m.estado === "COMPLETADO") {
          costos += Number(m.costo || 0);
        }
      }

      const margen = ingresos - costos;

      resultado.push({
        id_vehiculo: v.id_vehiculo,
        placa: v.placa,
        vehiculo_descripcion: `${v.marca || ""} ${v.modelo || ""}`.trim(),
        categoria: v.categoria?.nombre ?? "Sin categoría",
        ingresos_totales: ingresos,
        costos_mantenimiento: costos,
        margen_neto: margen,
        ranking_categoria: 1,
      });
    }

    resultado.sort((a, b) => b.margen_neto - a.margen_neto);

    // Asignar ranking de categoría
    const rankingPorCat: Record<string, number> = {};
    for (const r of resultado) {
      rankingPorCat[r.categoria] = (rankingPorCat[r.categoria] || 0) + 1;
      r.ranking_categoria = rankingPorCat[r.categoria];
    }

    return {
      data: resultado,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar rentabilidad";
    return {
      data: [],
      error: message,
    };
  }
}

export async function getAuditoriaContratosIncompletos(): Promise<
  ServiceResult<AuditoriaContratosIncompletos[]>
> {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "consultar_auditoria_incompletos"
    );

    if (!rpcError && rpcData) {
      return {
        data: rpcData as AuditoriaContratosIncompletos[],
        error: null,
      };
    }

    // Consulta directa a tablas
    const { data: alquileresRaw, error: aError } = await supabase
      .from("alquiler")
      .select(`
        id_alquiler,
        nro_contrato,
        fecha_entrega,
        fecha_dev_real,
        estado,
        vehiculo:vehiculo(placa),
        reserva:reserva(
          cliente:cliente(
            persona:persona(nombres, apellidos)
          )
        ),
        inspeccion:inspeccion(km_retorno),
        pago:pago(tipo_transaccion, estado)
      `)
      .eq("estado", "FINALIZADO");

    if (aError) {
      return {
        data: [],
        error: aError.message,
      };
    }

    const alquileres = (alquileresRaw as unknown as RawAuditoriaRow[]) || [];

    if (alquileres.length === 0) {
      return {
        data: [],
        error: null,
      };
    }

    const inconsistencias: AuditoriaContratosIncompletos[] = [];

    for (const a of alquileres) {
      const insp = Array.isArray(a.inspeccion) ? a.inspeccion[0] : a.inspeccion;
      const sinKmRetorno = !insp || insp.km_retorno == null;

      const tieneLiquidacionGarantia = (a.pago || []).some(
        (p) =>
          p.estado === "APROBADO" &&
          (p.tipo_transaccion === "DEVOLUCION_GARANTIA" ||
            p.tipo_transaccion === "PENALIDAD")
      );

      if (sinKmRetorno || !tieneLiquidacionGarantia) {
        let motivo = "";
        if (sinKmRetorno) {
          motivo = "Falta registro de kilometraje retorno en inspección";
        } else {
          motivo = "Depósito de garantía no liquidado (sin devolución ni penalidad)";
        }

        const clientePersona = a.reserva?.cliente?.persona;
        const nombreCliente = clientePersona
          ? `${clientePersona.nombres || ""} ${clientePersona.apellidos || ""}`.trim()
          : "Cliente no registrado";

        inconsistencias.push({
          id_alquiler: a.id_alquiler,
          nro_contrato: a.nro_contrato,
          cliente: nombreCliente,
          placa: a.vehiculo?.placa ?? "-",
          fecha_entrega: a.fecha_entrega,
          fecha_dev_real: a.fecha_dev_real,
          motivo_inconsistencia: motivo,
        });
      }
    }

    return {
      data: inconsistencias,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al consultar auditoría";
    return {
      data: [],
      error: message,
    };
  }
}
