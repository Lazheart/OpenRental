"use client";

import React, { useState, useEffect } from "react";
import { PerfilCliente } from "@/types/database";
import { getPerfilesClientes } from "@/services/client.service";
import { StatCard } from "@/components/ui/StatCard";
import { SQL_DEFINITIONS, SqlItem } from "@/lib/sqlDefinitions";

interface ClientsTabProps {
  onOpenSql: (item: SqlItem) => void;
  onFallbackDetected?: (fallback: boolean) => void;
}

export function ClientsTab({ onOpenSql, onFallbackDetected }: ClientsTabProps) {
  const [clients, setClients] = useState<PerfilCliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getPerfilesClientes();
      setClients(res.data);
      setIsFallback(res.isFallback);
      onFallbackDetected?.(res.isFallback);
      setLoading(false);
    }
    loadData();
  }, [onFallbackDetected]);

  const filtered = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.nombre_completo.toLowerCase().includes(term) ||
      c.nro_documento.toLowerCase().includes(term) ||
      c.nro_licencia.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  });

  const totalSpentAll = clients.reduce(
    (acc, curr) => acc + Number(curr.monto_total_pagado),
    0
  );

  const totalReservations = clients.reduce(
    (acc, curr) => acc + Number(curr.total_reservas),
    0
  );

  const totalNoShows = clients.reduce(
    (acc, curr) => acc + Number(curr.reservas_no_show),
    0
  );

  const currentSqlItem = SQL_DEFINITIONS.find(
    (s) => s.id === "vw_perfil_cliente"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-black bg-zinc-100">
              Vista: vw_perfil_cliente
            </span>
            {isFallback && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 border border-amber-900 text-amber-950 font-bold">
                Datos Demostrativos
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight mt-1">
            Perfil de Clientes e Indicadores de Fidelidad
          </h2>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Consolidado de reservas, cumplimientos, cancelaciones, inasistencias (no-show) y facturación acumulada.
          </p>
        </div>

        {currentSqlItem && (
          <button
            onClick={() => onOpenSql(currentSqlItem)}
            className="self-start md:self-auto px-3 py-2 border-2 border-black bg-white hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            🔍 Ver SQL de la Vista
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Clientes"
          value={clients.length}
          subtitle="Titulares registrados en vista"
        />
        <StatCard
          title="Facturación Clientes"
          value={`S/ ${totalSpentAll.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          badge="Aprobado"
          accent
          subtitle="Cobros aprobados históricos"
        />
        <StatCard
          title="Total Reservas"
          value={totalReservations}
          subtitle="Historial de solicitudes"
        />
        <StatCard
          title="Inasistencias (No-Show)"
          value={totalNoShows}
          subtitle="Reservas no presentadas"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          Listado de Clientes con Métricas de Riesgo y Consumo
        </span>
        <input
          type="text"
          placeholder="Buscar por cliente, DNI, licencia o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 text-xs border-2 border-black bg-white font-body focus:outline-none min-w-[280px]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm uppercase tracking-widest font-mono">
            Consultando vw_perfil_cliente...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm text-zinc-600">
            No se encontraron clientes con el criterio de búsqueda.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Documento / Licencia</th>
                <th>Contacto</th>
                <th>Reservas (Comp / Canc / No-Show)</th>
                <th>Alquileres (Fin / Act)</th>
                <th>Total Pagado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id_cliente}>
                  <td>
                    <span className="font-bold text-sm block">
                      {c.nombre_completo}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Reg: {new Date(c.fecha_registro).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="font-mono text-xs">
                    <div>
                      <span className="text-zinc-500">{c.tipo_documento}:</span>{" "}
                      {c.nro_documento}
                    </div>
                    <div className="text-[11px] text-zinc-600">
                      Lic: {c.nro_licencia} ({c.pais_licencia})
                    </div>
                  </td>
                  <td className="text-xs">
                    <div>{c.telefono}</div>
                    <div className="text-zinc-500 text-[11px]">{c.email}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <span
                        className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold"
                        title="Completadas"
                      >
                        {c.reservas_completadas}
                      </span>
                      <span
                        className="px-1.5 py-0.5 bg-zinc-100 text-zinc-800 border border-zinc-400"
                        title="Canceladas"
                      >
                        {c.reservas_canceladas}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 border font-bold ${
                          Number(c.reservas_no_show) > 0
                            ? "bg-red-100 text-red-900 border-red-500"
                            : "bg-zinc-100 text-zinc-500 border-zinc-300"
                        }`}
                        title="No-Show (Inasistencia)"
                      >
                        {c.reservas_no_show}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      Total: {c.total_reservas} reservas
                    </span>
                  </td>
                  <td>
                    <div className="text-xs font-mono">
                      <span>Fin: {c.alquileres_finalizados}</span>
                      {Number(c.alquileres_activos) > 0 && (
                        <span className="ml-1 text-[#722f37] font-bold">
                          • Activo: {c.alquileres_activos}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 block">
                      Total: {c.total_alquileres} contratos
                    </span>
                  </td>
                  <td className="font-mono font-black text-sm text-[#722f37]">
                    S/ {Number(c.monto_total_pagado).toFixed(2)}
                  </td>
                  <td>
                    {c.activo ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-950 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-200 text-zinc-800 border border-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                        Inactivo
                      </span>
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

