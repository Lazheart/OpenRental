"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getMyReservas, Reserva } from "@/services/booking.service";
import { updateReservaEstado } from "@/services/booking.service";

const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE: "bg-yellow-700 text-white",
  CONFIRMADA: "bg-[#722f37] text-white",
  CANCELADA: "bg-zinc-400 text-white",
  COMPLETADA: "bg-black text-white",
};

export function MyReservationsView() {
  const { user, loading: authLoading } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("");

  const fetchReservas = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    // We need id_cliente. For now we pass 0 and rely on RLS policy (via auth.uid())
    // In production this comes from get_my_persona_id() via RPC
    const { data, error: fetchError } = await getMyReservas(0);

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setReservas(data);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReservas();
    }
  }, [user, fetchReservas]);

  const handleCancel = async (idReserva: number) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;

    setCancelingId(idReserva);
    const { error } = await updateReservaEstado(idReserva, "CANCELADA");
    setCancelingId(null);

    if (error) {
      alert("Error al cancelar: " + error.message);
      return;
    }

    await fetchReservas();
  };

  if (authLoading) {
    return (
      <div className="border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_#000]">
        <p className="font-black uppercase tracking-widest font-title animate-pulse">
          Cargando…
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_#000]">
        <p className="font-black text-xl uppercase font-title">
          Debes iniciar sesión para ver tus reservas.
        </p>
      </div>
    );
  }

  const filtered = filterEstado
    ? reservas.filter((r) => r.estado === filterEstado)
    : reservas;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000]">
        <h2 className="text-2xl font-black font-title tracking-tight">Mis Reservas</h2>
        <p className="text-sm font-body text-zinc-600 mt-1">
          Consulta y gestiona tus reservas de vehículos.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-black uppercase tracking-widest font-body">
          Filtrar por estado:
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

      {error && (
        <div className="border-2 border-[#722f37] bg-[#722f37]/10 px-3 py-2 text-sm font-bold text-[#722f37] font-body">
          {error}
        </div>
      )}

      {loading ? (
        <div className="border-2 border-black p-6 text-center animate-pulse">
          <p className="font-black uppercase tracking-widest font-title">Cargando reservas…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-4 border-black p-10 text-center shadow-[4px_4px_0px_0px_#000]">
          <p className="font-black text-lg uppercase font-title">
            {reservas.length === 0
              ? "No tienes reservas aún."
              : "No hay reservas con ese estado."}
          </p>
          {reservas.length === 0 && (
            <p className="text-sm font-body text-zinc-500 mt-2">
              ¡Consulta la disponibilidad de vehículos!
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-black text-white">
                {["Código", "Vehículo / Categoría", "Inicio", "Fin", "Tarifa/día", "Total", "Estado", "Acciones"].map(
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
                  <td className="px-3 py-2 font-mono text-xs font-black whitespace-nowrap border-r border-black">
                    {r.codigo_reserva}
                  </td>
                  <td className="px-3 py-2 font-body border-r border-black">
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
                  <td className="px-3 py-2 font-body text-xs whitespace-nowrap border-r border-black">
                    S/ {Number(r.tarifa_diaria_pactada).toFixed(2)}
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
                    {r.estado === "PENDIENTE" && (
                      <button
                        onClick={() => handleCancel(r.id_reserva)}
                        disabled={cancelingId === r.id_reserva}
                        className="text-[10px] font-black uppercase tracking-wider px-2 py-1 border-2 border-zinc-500 text-zinc-700 hover:border-black hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {cancelingId === r.id_reserva ? "…" : "CANCELAR"}
                      </button>
                    )}
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
