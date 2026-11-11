"use client";

import React, { useState, useEffect } from "react";
import { HistorialAlquiler } from "@/types/database";
import { getHistorialAlquileres } from "@/services/rental.service";
import { StatCard } from "@/components/ui/StatCard";
import { getStatusBadge } from "@/components/ui/Badge";
import { SQL_DEFINITIONS, SqlItem } from "@/lib/sqlDefinitions";

interface RentalsTabProps {
  onOpenSql: (item: SqlItem) => void;
  onFallbackDetected?: (fallback: boolean) => void;
}

export function RentalsTab({ onOpenSql, onFallbackDetected }: RentalsTabProps) {
  const [rentals, setRentals] = useState<HistorialAlquiler[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [selectedRental, setSelectedRental] = useState<HistorialAlquiler | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getHistorialAlquileres();
      setRentals(res.data);
      setIsFallback(res.isFallback);
      onFallbackDetected?.(res.isFallback);
      setLoading(false);
    }
    loadData();
  }, [onFallbackDetected]);

  const filtered = rentals.filter((r) => {
    const matchesStatus =
      statusFilter === "ALL" || r.estado_alquiler === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.nro_contrato.toLowerCase().includes(term) ||
      r.cliente_nombre_completo.toLowerCase().includes(term) ||
      r.placa.toLowerCase().includes(term) ||
      r.codigo_reserva.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const activeRentals = rentals.filter(
    (r) => r.estado_alquiler === "EN_CURSO" || r.estado_alquiler === "ATRASADO"
  ).length;

  const finishedRentals = rentals.filter(
    (r) => r.estado_alquiler === "FINALIZADO"
  ).length;

  const currentSqlItem = SQL_DEFINITIONS.find((s) => s.id === "vw_historial_alquiler");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-black bg-zinc-100">
              Vista: vw_historial_alquiler
            </span>
            {isFallback && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 border border-amber-900 text-amber-950 font-bold">
                Datos Demostrativos
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight mt-1">
            Historial y Ciclo de Vida de Alquileres
          </h2>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Trazabilidad completa: contrato, reserva, vehículo, cliente, inspección física y entregas.
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
          title="Total Contratos"
          value={rentals.length}
          subtitle="Registrados en la vista"
        />
        <StatCard
          title="Alquileres Activos"
          value={activeRentals}
          badge="En Calle"
          accent
          subtitle="En curso o con retraso"
        />
        <StatCard
          title="Finalizados"
          value={finishedRentals}
          subtitle="Cerrados con inspección"
        />
        <StatCard
          title="Tarifa Promedio"
          value={`S/ ${
            rentals.length > 0
              ? (
                  rentals.reduce(
                    (acc, curr) => acc + Number(curr.tarifa_diaria_aplicada),
                    0
                  ) / rentals.length
                ).toFixed(2)
              : "0.00"
          }`}
          subtitle="Tarifa pactada por contrato"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Estado:
          </span>
          {["ALL", "EN_CURSO", "ATRASADO", "FINALIZADO"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black cursor-pointer transition-colors ${
                statusFilter === st
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-zinc-100"
              }`}
            >
              {st === "ALL" ? "Todos" : st}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar contrato, cliente, placa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 text-xs border-2 border-black bg-white font-body focus:outline-none min-w-[240px]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm uppercase tracking-widest font-mono">
            Consultando vw_historial_alquiler...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm text-zinc-600">
            No se encontraron contratos con los filtros especificados.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Estado</th>
                <th>Cliente Titular</th>
                <th>Vehículo Asignado</th>
                <th>Período Contratado</th>
                <th>Tarifa / Total</th>
                <th>Inspección Salida/Retorno</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id_alquiler}>
                  <td className="font-mono font-bold">
                    <span className="text-black">{r.nro_contrato}</span>
                    <span className="block text-[11px] text-zinc-500 font-normal">
                      Reserva: {r.codigo_reserva}
                    </span>
                  </td>
                  <td>{getStatusBadge(r.estado_alquiler)}</td>
                  <td>
                    <span className="font-bold text-sm block">
                      {r.cliente_nombre_completo}
                    </span>
                    <span className="text-zinc-500 text-xs font-mono">
                      DNI: {r.cliente_documento} | Lic: {r.cliente_licencia}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono font-bold text-xs bg-zinc-100 px-1.5 py-0.5 border border-zinc-300 mr-1.5">
                      {r.placa}
                    </span>
                    <span className="font-semibold">{r.vehiculo_descripcion}</span>
                    <span className="text-zinc-500 block text-xs">
                      {r.categoria}
                    </span>
                  </td>
                  <td className="text-xs">
                    <div>
                      <span className="text-zinc-500 font-medium">Salida:</span>{" "}
                      {new Date(r.fecha_entrega).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-zinc-500 font-medium">Prevista:</span>{" "}
                      {new Date(r.fecha_dev_prevista).toLocaleDateString()}
                    </div>
                    {r.fecha_dev_real && (
                      <div className="text-emerald-700 font-bold">
                        <span>Retorno:</span>{" "}
                        {new Date(r.fecha_dev_real).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="font-mono">
                    <div className="text-xs">
                      S/ {Number(r.tarifa_diaria_aplicada).toFixed(2)} / día
                    </div>
                    <div className="font-bold text-[#722f37] text-sm">
                      {r.costo_total_final
                        ? `S/ ${Number(r.costo_total_final).toFixed(2)}`
                        : `Est: S/ ${Number(r.total_estimado).toFixed(2)}`}
                    </div>
                  </td>
                  <td className="text-xs">
                    <div>
                      Km: {r.km_salida ?? "-"} → {r.km_retorno ?? "Pendiente"}
                    </div>
                    <div className="text-zinc-600 text-[11px]">
                      Comb: {r.combustible_salida ?? "-"} →{" "}
                      {r.combustible_retorno ?? "-"}
                    </div>
                    {Number(r.cargos_adicionales) > 0 && (
                      <div className="text-red-700 font-bold">
                        Cargos: S/ {Number(r.cargos_adicionales).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedRental(r)}
                      className="px-2.5 py-1 text-xs font-bold uppercase border border-black bg-zinc-100 hover:bg-black hover:text-white transition-colors cursor-pointer"
                    >
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for detailed inspection */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white border-3 border-black w-full max-w-2xl p-6 shadow-[8px_8px_0px_0px_#000000]">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-500">
                  CONTRATO
                </span>
                <h3 className="text-xl font-black font-title">
                  {selectedRental.nro_contrato}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-black hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 border border-black bg-zinc-50 space-y-1">
                <span className="font-bold text-zinc-500 uppercase block">
                  Cliente & Entrega
                </span>
                <p className="font-bold text-sm">
                  {selectedRental.cliente_nombre_completo}
                </p>
                <p>Licencia: {selectedRental.cliente_licencia}</p>
                <p>Retiro: {selectedRental.sucursal_retiro}</p>
                <p>Despachado por: {selectedRental.empleado_entrega}</p>
              </div>

              <div className="p-3 border border-black bg-zinc-50 space-y-1">
                <span className="font-bold text-zinc-500 uppercase block">
                  Vehículo & Retorno
                </span>
                <p className="font-bold text-sm">
                  {selectedRental.vehiculo_descripcion} ({selectedRental.placa})
                </p>
                <p>Devolución en: {selectedRental.sucursal_devolucion}</p>
                <p>
                  Recibido por:{" "}
                  {selectedRental.empleado_devolucion || "Pendiente"}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 border-2 border-black bg-white">
              <h4 className="font-bold uppercase text-xs tracking-wider mb-2 text-[#722f37]">
                Inspección Física Registrada
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-zinc-500 block">Km Salida:</span>
                  <span className="font-mono font-bold">
                    {selectedRental.km_salida} km
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Km Retorno:</span>
                  <span className="font-mono font-bold">
                    {selectedRental.km_retorno
                      ? `${selectedRental.km_retorno} km`
                      : "No retornado"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Cargos Extra:</span>
                  <span className="font-mono font-bold text-red-700">
                    S/ {Number(selectedRental.cargos_adicionales || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-200 text-xs">
                <span className="text-zinc-500 font-bold">Daños Salida:</span>{" "}
                {selectedRental.danos_salida || "Ninguno"}
              </div>
              <div className="mt-1 text-xs">
                <span className="text-zinc-500 font-bold">Daños Retorno:</span>{" "}
                {selectedRental.danos_retorno || "Sin inspección de retorno"}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRental(null)}
                className="px-4 py-1.5 border-2 border-black bg-black text-white font-bold text-xs uppercase cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

