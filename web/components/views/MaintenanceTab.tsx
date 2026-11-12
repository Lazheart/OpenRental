"use client";

import React, { useState, useEffect } from "react";
import { HistorialMantenimiento } from "@/types/database";
import { getHistorialMantenimiento } from "@/services/maintenance.service";
import { StatCard } from "@/components/ui/StatCard";
import { getStatusBadge } from "@/components/ui/Badge";
import { SQL_DEFINITIONS, SqlItem } from "@/lib/sqlDefinitions";

interface MaintenanceTabProps {
  onOpenSql: (item: SqlItem) => void;
}

export function MaintenanceTab({ onOpenSql }: MaintenanceTabProps) {
  const [maintenance, setMaintenance] = useState<HistorialMantenimiento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      const res = await getHistorialMantenimiento();
      setMaintenance(res.data);
      if (res.error) {
        setErrorMsg(res.error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = maintenance.filter((m) =>
    typeFilter === "ALL" ? true : m.tipo_mantenimiento === typeFilter
  );

  const totalCost = maintenance.reduce(
    (acc, curr) => acc + Number(curr.costo),
    0
  );

  const inProcess = maintenance.filter(
    (m) => m.estado_mantenimiento === "EN_PROCESO" || m.estado_mantenimiento === "PROGRAMADO"
  ).length;

  const currentSqlItem = SQL_DEFINITIONS.find(
    (s) => s.id === "vw_historial_mantenimiento"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-black bg-zinc-100">
              Vista: vw_historial_mantenimiento
            </span>
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight mt-1">
            Historial de Mantenimiento y Taller
          </h2>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Trazabilidad técnica directa: servicios preventivos, correctivos, mecánicos responsables y costos.
          </p>
        </div>

        {currentSqlItem && (
          <button
            onClick={() => onOpenSql(currentSqlItem)}
            className="self-start md:self-auto px-3 py-2 border-2 border-black bg-white hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            VER SQL DE LA VISTA
          </button>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 border-2 border-red-900 bg-red-50 text-red-950 font-mono text-xs">
          <span className="font-bold uppercase block mb-1">[ERROR DE API SUPABASE]</span>
          {errorMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Órdenes Totales"
          value={maintenance.length}
          subtitle="Historial de intervenciones"
        />
        <StatCard
          title="En Taller Ahora"
          value={inProcess}
          badge="En Proceso"
          accent
          subtitle="Unidades fuera de servicio"
        />
        <StatCard
          title="Gasto Acumulado"
          value={`S/ ${totalCost.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Costo total de mantención"
        />
        <StatCard
          title="Costo Promedio"
          value={`S/ ${
            maintenance.length > 0
              ? (totalCost / maintenance.length).toFixed(2)
              : "0.00"
          }`}
          subtitle="Por orden de servicio"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Tipo de Intervención:
        </span>
        {["ALL", "PREVENTIVO", "CORRECTIVO", "REVISION_TECNICA"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black cursor-pointer transition-colors ${
              typeFilter === t
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-zinc-100"
            }`}
          >
            {t === "ALL" ? "Todos los Tipos" : t.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm uppercase tracking-widest font-mono">
            Consultando vw_historial_mantenimiento en Supabase...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm text-zinc-600">
            No se encontraron registros de mantenimiento en la base de datos.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehículo</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Descripción del Trabajo</th>
                <th>Taller / Trazabilidad</th>
                <th>Km Servicio</th>
                <th>Costo</th>
                <th>Mecánico Responsable</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id_mantenimiento}>
                  <td className="font-mono text-xs font-bold">
                    #{m.id_mantenimiento}
                  </td>
                  <td>
                    <span className="font-mono font-bold text-xs bg-zinc-100 px-1.5 py-0.5 border border-zinc-300 mr-1.5">
                      {m.placa}
                    </span>
                    <span className="font-bold">{m.vehiculo_descripcion}</span>
                    <span className="block text-[11px] text-zinc-500">
                      {m.categoria} - Sucursal: {m.sucursal_actual}
                    </span>
                  </td>
                  <td>
                    <span className="px-2 py-0.5 text-xs font-bold uppercase border border-black bg-zinc-100">
                      {m.tipo_mantenimiento}
                    </span>
                  </td>
                  <td>{getStatusBadge(m.estado_mantenimiento)}</td>
                  <td className="max-w-xs text-xs font-body">
                    {m.descripcion}
                  </td>
                  <td className="text-xs">
                    <span className="font-semibold block">{m.taller}</span>
                    <span className="text-zinc-500 text-[11px]">
                      Inicio: {new Date(m.fecha_inicio).toLocaleDateString()}
                    </span>
                    {m.fecha_fin && (
                      <span className="text-zinc-500 text-[11px] block">
                        Fin: {new Date(m.fecha_fin).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td className="font-mono text-xs">
                    {Number(m.km_al_servicio).toLocaleString()} km
                  </td>
                  <td className="font-mono font-bold text-sm text-[#722f37]">
                    S/ {Number(m.costo).toFixed(2)}
                  </td>
                  <td className="text-xs">
                    <span className="font-bold block">
                      {m.empleado_responsable}
                    </span>
                    <span className="text-zinc-500 uppercase text-[10px]">
                      {m.cargo_empleado}
                    </span>
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
