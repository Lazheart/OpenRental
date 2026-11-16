"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getAllReservas,
  confirmReserva,
  cancelReserva,
  ReservaConCliente,
} from "@/services/agent.service";

const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE: "bg-yellow-700 text-white",
  CONFIRMADA: "bg-[#722f37] text-white",
  CANCELADA: "bg-zinc-400 text-white",
  COMPLETADA: "bg-black text-white",
};

export function AgentReservationsView() {
  const { isAgent, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<ReservaConCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getAllReservas();
    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setReservas(data);
  }, []);

  useEffect(() => {
    if (isAgent()) {
      fetchAll();
    }
  }, [isAgent, fetchAll]);

  const handleConfirm = async (id: number) => {
    setActionId(id);
    const { error } = await confirmReserva(id);
    setActionId(null);

    if (error) {
      alert("Error al confirmar: " + error.message);
      return;
    }

    await fetchAll();
  };

  const handleCancel = async (id: number) => {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setActionId(id);
    const { error } = await cancelReserva(id);
    setActionId(null);

    if (error) {
      alert("Error al cancelar: " + error.message);
      return;
    }

    await fetchAll();
  };

  if (authLoading) {
    return (
      <div className="border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_#000]">
        <p className="font-black uppercase tracking-widest font-title animate-pulse">
          Verificando permisos…
        </p>
      </div>
    );
  }

  if (!isAgent()) {
    return (
      <div className="border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_#000]">
        <p className="font-black text-xl uppercase font-title">Acceso restringido.</p>
        <p className="text-sm font-body text-zinc-500 mt-1">
          Esta sección es solo para agentes.
        </p>
      </div>
    );
  }

  const filtered = filterEstado
    ? reservas.filter((r) => r.estado === filterEstado)
    : reservas;

  const clientName = (r: ReservaConCliente) => {
    const p = r.cliente?.persona || r.persona;
    if (p) {
      if ('nombres' in p && p.nombres) {
        return `${p.nombres} ${p.apellidos ?? ''}`.trim();
      }
      if ('nombre' in p && p.nombre) {
        return `${p.nombre} ${p.apellido_paterno ?? ''}`.trim();
      }
    }
    return `Cliente #${r.id_cliente}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000]">
        <h2 className="text-2xl font-black font-title tracking-tight">
          Gestión de Reservas
        </h2>
        <p className="text-sm font-body text-zinc-600 mt-1">
          Administra todas las reservas del sistema.
        </p>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-xs font-black uppercase tracking-widest font-body">
            Estado:
          </label>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="border-2 border-black px-3 py-1.5 text-xs font-body bg-white focus:outline-none focus:border-[#722f37] shadow-[2px_2px_0px_0px_#000]"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="COMPLETADA">Completada</option>
          </select>
        </div>

        <button
          onClick={fetchAll}
          disabled={loading}
          className="text-xs font-black uppercase tracking-widest px-3 py-1.5 border-2 border-black hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_#000]"
        >
          {loading ? "CARGANDO…" : "↺ RECARGAR"}
        </button>

        <span className="text-xs font-body text-zinc-500 ml-auto">
          {filtered.length} reserva{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="border-2 border-[#722f37] bg-[#722f37]/10 px-3 py-2 text-sm font-bold text-[#722f37] font-body">
          {error}
        </div>
      )}

      {loading ? (
        <div className="border-2 border-black p-6 text-center animate-pulse">
          <p className="font-black uppercase tracking-widest font-title">Cargando…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-4 border-black p-10 text-center shadow-[4px_4px_0px_0px_#000]">
          <p className="font-black text-lg uppercase font-title">
            No hay reservas{filterEstado ? ` con estado ${filterEstado}` : ""}.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <table className="w-full text-sm border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-black text-white">
                {["ID", "Código", "Cliente", "Vehículo / Categoría", "Inicio", "Fin", "Total", "Estado", "Acciones"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-wider font-body whitespace-nowrap border-r border-zinc-700 last:border-r-0"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr
                  key={r.id_reserva}
                  className={`border-b-2 border-black ${idx % 2 === 0 ? "bg-white" : "bg-zinc-50"}`}
                >
                  <td className="px-3 py-2 font-mono text-xs font-bold border-r border-black">
                    {r.id_reserva}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs font-black whitespace-nowrap border-r border-black">
                    {r.codigo_reserva}
                  </td>
                  <td className="px-3 py-2 font-body text-xs border-r border-black whitespace-nowrap">
                    {clientName(r)}
                  </td>
                  <td className="px-3 py-2 font-body text-xs border-r border-black">
                    {r.vehiculo
                      ? `${r.vehiculo.marca} ${r.vehiculo.modelo} (${r.vehiculo.placa})`
                      : r.categoria?.nombre
                      ? r.categoria.nombre
                      : r.id_vehiculo
                      ? `Vehículo #${r.id_vehiculo}`
                      : `Categoría #${r.id_categoria}`}
                  </td>
                  <td className="px-3 py-2 font-body text-xs whitespace-nowrap border-r border-black">
                    {r.fecha_inicio}
                  </td>
                  <td className="px-3 py-2 font-body text-xs whitespace-nowrap border-r border-black">
                    {r.fecha_fin}
                  </td>
                  <td className="px-3 py-2 font-black text-xs whitespace-nowrap border-r border-black">
                    S/ {Number(r.total_estimado).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 border-r border-black">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 ${
                        ESTADO_STYLES[r.estado] ?? "bg-zinc-200 text-black"
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {r.estado === "PENDIENTE" && (
                        <button
                          onClick={() => handleConfirm(r.id_reserva)}
                          disabled={actionId === r.id_reserva}
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-1 border-2 border-[#722f37] text-[#722f37] hover:bg-[#722f37] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {actionId === r.id_reserva ? "…" : "CONFIRMAR"}
                        </button>
                      )}
                      {(r.estado === "PENDIENTE" || r.estado === "CONFIRMADA") && (
                        <button
                          onClick={() => handleCancel(r.id_reserva)}
                          disabled={actionId === r.id_reserva}
                          className="text-[10px] font-black uppercase tracking-wider px-2 py-1 border-2 border-zinc-400 text-zinc-600 hover:border-black hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {actionId === r.id_reserva ? "…" : "CANCELAR"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
