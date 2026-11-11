"use client";

import React, { useState, useEffect } from "react";
import { ResumenFinancieroAlquiler } from "@/types/database";
import { getResumenFinanciero } from "@/services/rental.service";
import { StatCard } from "@/components/ui/StatCard";
import { getStatusBadge } from "@/components/ui/Badge";
import { SQL_DEFINITIONS, SqlItem } from "@/lib/sqlDefinitions";

interface FinanceTabProps {
  onOpenSql: (item: SqlItem) => void;
  onFallbackDetected?: (fallback: boolean) => void;
}

export function FinanceTab({ onOpenSql, onFallbackDetected }: FinanceTabProps) {
  const [finances, setFinances] = useState<ResumenFinancieroAlquiler[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getResumenFinanciero();
      setFinances(res.data);
      setIsFallback(res.isFallback);
      onFallbackDetected?.(res.isFallback);
      setLoading(false);
    }
    loadData();
  }, [onFallbackDetected]);

  const filtered = finances.filter((f) =>
    f.nro_contrato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalNetRevenue = finances.reduce(
    (acc, curr) => acc + Number(curr.ingreso_neto),
    0
  );

  const totalDeposits = finances.reduce(
    (acc, curr) => acc + Number(curr.total_deposito_garantia),
    0
  );

  const totalRefunded = finances.reduce(
    (acc, curr) => acc + Number(curr.total_devolucion_garantia),
    0
  );

  const totalPenalties = finances.reduce(
    (acc, curr) => acc + Number(curr.total_penalidades),
    0
  );

  const currentSqlItem = SQL_DEFINITIONS.find(
    (s) => s.id === "vw_resumen_financiero_alquiler"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-black bg-zinc-100">
              Vista: vw_resumen_financiero_alquiler
            </span>
            {isFallback && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 border border-amber-900 text-amber-950 font-bold">
                Datos Demostrativos
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight mt-1">
            Resumen Financiero por Contrato
          </h2>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Liquidación de cobros, anticipos, depósito en garantía, devoluciones y penalidades.
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
          title="Ingreso Neto Total"
          value={`S/ ${totalNetRevenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          badge="Alquiler + Pen."
          accent
          subtitle="Cobros efectivos aprobados"
        />
        <StatCard
          title="Garantías Depositadas"
          value={`S/ ${totalDeposits.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Fondos en custodia"
        />
        <StatCard
          title="Garantías Devueltas"
          value={`S/ ${totalRefunded.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Reembolsadas al cliente"
        />
        <StatCard
          title="Penalidades Cobradas"
          value={`S/ ${totalPenalties.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="Mora y daños deducidos"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          Desglose Contable por Contrato ({filtered.length} contratos)
        </span>
        <input
          type="text"
          placeholder="Filtrar por número de contrato..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 text-xs border-2 border-black bg-white font-body focus:outline-none min-w-[220px]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm uppercase tracking-widest font-mono">
            Consultando vw_resumen_financiero_alquiler...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm text-zinc-600">
            No se encontraron registros financieros.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Estado</th>
                <th>Anticipos</th>
                <th>Pago Alquiler</th>
                <th>Depósito Garantía</th>
                <th>Devolución Garantía</th>
                <th>Penalidades</th>
                <th>Ingreso Neto</th>
                <th>Transacciones (A/P/R)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id_alquiler}>
                  <td className="font-mono font-bold">{f.nro_contrato}</td>
                  <td>{getStatusBadge(f.estado_alquiler)}</td>
                  <td className="font-mono text-xs">
                    S/ {Number(f.total_anticipos).toFixed(2)}
                  </td>
                  <td className="font-mono text-xs font-semibold">
                    S/ {Number(f.total_pago_alquiler).toFixed(2)}
                  </td>
                  <td className="font-mono text-xs">
                    S/ {Number(f.total_deposito_garantia).toFixed(2)}
                  </td>
                  <td className="font-mono text-xs text-emerald-700">
                    S/ {Number(f.total_devolucion_garantia).toFixed(2)}
                  </td>
                  <td className="font-mono text-xs text-red-700 font-bold">
                    S/ {Number(f.total_penalidades).toFixed(2)}
                  </td>
                  <td className="font-mono font-black text-[#722f37] text-sm">
                    S/ {Number(f.ingreso_neto).toFixed(2)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <span
                        className="px-1.5 py-0.2 bg-emerald-100 text-emerald-900 border border-emerald-500 font-bold"
                        title="Aprobadas"
                      >
                        {f.transacciones_aprobadas}
                      </span>
                      <span
                        className="px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-500 font-bold"
                        title="Pendientes"
                      >
                        {f.transacciones_pendientes}
                      </span>
                      <span
                        className="px-1.5 py-0.2 bg-red-100 text-red-900 border border-red-500 font-bold"
                        title="Rechazadas"
                      >
                        {f.transacciones_rechazadas}
                      </span>
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

