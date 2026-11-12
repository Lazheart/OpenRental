"use client";

import React, { useState, useEffect } from "react";
import { FichaVehiculo } from "@/types/database";
import { getFichaVehiculos, getVehiculosDisponibles } from "@/services/fleet.service";
import { StatCard } from "@/components/ui/StatCard";
import { getStatusBadge } from "@/components/ui/Badge";
import { SQL_DEFINITIONS, SqlItem } from "@/lib/sqlDefinitions";

interface FleetTabProps {
  onOpenSql: (item: SqlItem) => void;
}

export function FleetTab({ onOpenSql }: FleetTabProps) {
  const [vehicles, setVehicles] = useState<FichaVehiculo[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "disponibles">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      const res =
        filterMode === "all"
          ? await getFichaVehiculos()
          : await getVehiculosDisponibles();

      setVehicles(res.data);
      if (res.error) {
        setErrorMsg(res.error);
      }
      setLoading(false);
    }
    loadData();
  }, [filterMode]);

  // Derived categories
  const categories = Array.from(new Set(vehicles.map((v) => v.categoria_nombre)));

  // Filtered vehicles
  const filtered = vehicles.filter((v) => {
    const matchesCategory =
      categoryFilter === "ALL" || v.categoria_nombre === categoryFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      v.placa.toLowerCase().includes(term) ||
      v.marca.toLowerCase().includes(term) ||
      v.modelo.toLowerCase().includes(term) ||
      v.sucursal_nombre.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const availableCount = vehicles.filter(
    (v) => v.estado_vehiculo === "DISPONIBLE" && v.vehiculo_activo
  ).length;

  const avgTariff =
    vehicles.length > 0
      ? (
          vehicles.reduce((acc, curr) => acc + Number(curr.tarifa_efectiva), 0) /
          vehicles.length
        ).toFixed(2)
      : "0.00";

  const currentSqlItem =
    filterMode === "all"
      ? SQL_DEFINITIONS.find((s) => s.id === "vw_ficha_vehiculo")
      : SQL_DEFINITIONS.find((s) => s.id === "vw_vehiculos_disponibles");

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-black bg-zinc-100">
              {filterMode === "all" ? "Vista: vw_ficha_vehiculo" : "Vista: vw_vehiculos_disponibles"}
            </span>
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight mt-1">
            Gestión y Disponibilidad de Flota
          </h2>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Consulta directa a Supabase de unidades vehiculares, categorías, tarifas y estados.
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
          title="Total Unidades"
          value={vehicles.length}
          subtitle="Registros obtenidos de la vista"
        />
        <StatCard
          title="Disponibles"
          value={availableCount}
          badge="Listos"
          accent
          subtitle="Listos para alquilar"
        />
        <StatCard
          title="Tarifa Promedio"
          value={`S/ ${avgTariff}`}
          subtitle="Tarifa efectiva por día"
        />
        <StatCard
          title="Categorías"
          value={categories.length}
          subtitle="Segmentos en vista"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Fuente:
          </span>
          <div className="inline-flex border-2 border-black bg-white">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterMode === "all"
                  ? "bg-black text-white"
                  : "hover:bg-zinc-100 text-black"
              }`}
            >
              Toda la Flota (vw_ficha)
            </button>
            <button
              onClick={() => setFilterMode("disponibles")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-l-2 border-black cursor-pointer ${
                filterMode === "disponibles"
                  ? "bg-[#722f37] text-white"
                  : "hover:bg-zinc-100 text-black"
              }`}
            >
              Disponibles (vw_disponibles)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por placa, modelo, sucursal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs border-2 border-black bg-white font-body focus:outline-none focus:ring-1 focus:ring-black min-w-[220px]"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border-2 border-black bg-white font-body font-bold cursor-pointer focus:outline-none"
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="inline-flex border-2 border-black bg-white">
            <button
              onClick={() => setViewMode("table")}
              title="Vista en tabla"
              className={`px-2.5 py-1.5 text-xs font-bold ${
                viewMode === "table" ? "bg-black text-white" : "hover:bg-zinc-100"
              }`}
            >
              Tabla
            </button>
            <button
              onClick={() => setViewMode("cards")}
              title="Vista en tarjetas"
              className={`px-2.5 py-1.5 text-xs font-bold border-l-2 border-black ${
                viewMode === "cards" ? "bg-black text-white" : "hover:bg-zinc-100"
              }`}
            >
              Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm uppercase tracking-widest font-mono">
            Consultando vista en Supabase...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm text-zinc-600">
            No se encontraron registros de vehículos en la base de datos para los filtros aplicados.
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Vehículo</th>
                <th>Categoría</th>
                <th>Transmisión</th>
                <th>Combustible</th>
                <th>Km Actual</th>
                <th>Tarifa Diaria</th>
                <th>Sucursal Actual</th>
                <th>Estado Operativo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id_vehiculo}>
                  <td className="font-mono font-bold text-black">{v.placa}</td>
                  <td>
                    <span className="font-bold">{v.marca}</span> {v.modelo}{" "}
                    <span className="text-zinc-500 text-xs">({v.anio})</span>
                  </td>
                  <td>
                    <span className="px-1.5 py-0.5 border border-zinc-400 bg-zinc-50 text-xs">
                      {v.categoria_nombre}
                    </span>
                  </td>
                  <td className="text-xs uppercase">{v.transmision}</td>
                  <td className="text-xs uppercase">{v.combustible}</td>
                  <td className="font-mono text-xs">
                    {Number(v.kilometraje_actual).toLocaleString()} km
                  </td>
                  <td className="font-mono font-bold text-[#722f37]">
                    S/ {Number(v.tarifa_efectiva).toFixed(2)}
                  </td>
                  <td className="text-xs">
                    <span className="font-semibold">{v.sucursal_nombre}</span>
                    <span className="text-zinc-500 block text-[11px]">
                      {v.sucursal_ciudad}
                    </span>
                  </td>
                  <td>{getStatusBadge(v.estado_vehiculo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <div
              key={v.id_vehiculo}
              className="border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b-2 border-zinc-200">
                  <span className="font-mono font-black text-lg text-black bg-zinc-100 px-2 py-0.5 border border-black">
                    {v.placa}
                  </span>
                  {getStatusBadge(v.estado_vehiculo)}
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-bold font-title">
                    {v.marca} {v.modelo}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Año {v.anio} - {v.color} - {v.capacidad_pasajeros} pasajeros
                  </p>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-zinc-700">
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Categoría:</span>
                    <span className="font-bold">{v.categoria_nombre}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Kilometraje:</span>
                    <span className="font-mono font-semibold">
                      {Number(v.kilometraje_actual).toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-100">
                    <span className="text-zinc-500">Sucursal:</span>
                    <span className="font-semibold text-right">
                      {v.sucursal_nombre}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between bg-zinc-50 -mx-4 -mb-4 p-4">
                <span className="text-xs uppercase font-bold text-zinc-500">
                  Tarifa Día
                </span>
                <span className="text-xl font-black font-title text-[#722f37]">
                  S/ {Number(v.tarifa_efectiva).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
