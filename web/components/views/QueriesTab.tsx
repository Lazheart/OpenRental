"use client";

import React, { useState, useEffect } from "react";
import {
  DisponibilidadAntiSolapamientoResult,
  UtilizacionIngresoCategoriaMes,
  ClienteSiniestralidadAlta,
  RentabilidadUnidad,
  AuditoriaContratosIncompletos,
} from "@/types/database";
import {
  getDisponibilidadAntiSolapamiento,
  getUtilizacionIngresosPorMes,
  getClientesAltaSiniestralidad,
  getRentabilidadPorUnidad,
  getAuditoriaContratosIncompletos,
} from "@/services/analytics.service";
import { SQL_DEFINITIONS, SqlItem } from "@/lib/sqlDefinitions";

interface QueriesTabProps {
  onOpenSql: (item: SqlItem) => void;
}

type QueryKey = "q1" | "q2" | "q3" | "q4" | "q5";

export function QueriesTab({ onOpenSql }: QueriesTabProps) {
  const [activeQuery, setActiveQuery] = useState<QueryKey>("q1");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Query 1: Anti-solapamiento
  const [q1Category, setQ1Category] = useState<number | "ALL">(3);
  const [q1Branch, setQ1Branch] = useState<number | "ALL">(1);
  const [q1Start, setQ1Start] = useState<string>("2026-11-01T09:00");
  const [q1End, setQ1End] = useState<string>("2026-11-05T09:00");
  const [q1Results, setQ1Results] = useState<DisponibilidadAntiSolapamientoResult[]>([]);
  const [q1Loading, setQ1Loading] = useState<boolean>(false);

  // Query 2: Utilización e Ingresos
  const [q2Results, setQ2Results] = useState<UtilizacionIngresoCategoriaMes[]>([]);
  const [q2Loading, setQ2Loading] = useState<boolean>(false);

  // Query 3: Siniestralidad
  const [q3Results, setQ3Results] = useState<ClienteSiniestralidadAlta[]>([]);
  const [q3Loading, setQ3Loading] = useState<boolean>(false);

  // Query 4: Rentabilidad
  const [q4Results, setQ4Results] = useState<RentabilidadUnidad[]>([]);
  const [q4Loading, setQ4Loading] = useState<boolean>(false);

  // Query 5: Auditoría Cierres
  const [q5Results, setQ5Results] = useState<AuditoriaContratosIncompletos[]>([]);
  const [q5Loading, setQ5Loading] = useState<boolean>(false);

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setErrorMsg(null);

      if (activeQuery === "q1") {
        setQ1Loading(true);
        const res = await getDisponibilidadAntiSolapamiento({
          idCategoria: q1Category,
          idSucursal: q1Branch,
          fechaInicio: q1Start,
          fechaFin: q1End,
        });
        if (isMounted) {
          setQ1Results(res.data);
          if (res.error) setErrorMsg(res.error);
          setQ1Loading(false);
        }
      } else if (activeQuery === "q2") {
        setQ2Loading(true);
        const res = await getUtilizacionIngresosPorMes();
        if (isMounted) {
          setQ2Results(res.data);
          if (res.error) setErrorMsg(res.error);
          setQ2Loading(false);
        }
      } else if (activeQuery === "q3") {
        setQ3Loading(true);
        const res = await getClientesAltaSiniestralidad();
        if (isMounted) {
          setQ3Results(res.data);
          if (res.error) setErrorMsg(res.error);
          setQ3Loading(false);
        }
      } else if (activeQuery === "q4") {
        setQ4Loading(true);
        const res = await getRentabilidadPorUnidad();
        if (isMounted) {
          setQ4Results(res.data);
          if (res.error) setErrorMsg(res.error);
          setQ4Loading(false);
        }
      } else if (activeQuery === "q5") {
        setQ5Loading(true);
        const res = await getAuditoriaContratosIncompletos();
        if (isMounted) {
          setQ5Results(res.data);
          if (res.error) setErrorMsg(res.error);
          setQ5Loading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [
    activeQuery,
    q1Category,
    q1Branch,
    q1Start,
    q1End,
    refreshTrigger,
  ]);

  const querySqlMap: Record<QueryKey, string> = {
    q1: "query_disponibilidad_anti_solapamiento",
    q2: "query_utilizacion_ingresos_mes",
    q3: "query_clientes_siniestralidad",
    q4: "query_rentabilidad_unidad",
    q5: "query_auditoria_incompletos",
  };

  const currentSqlItem = SQL_DEFINITIONS.find(
    (s) => s.id === querySqlMap[activeQuery]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-black bg-[#722f37] text-white">
              Consultas Complejas y Analíticas
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              sql/07_queries.sql y Cap. 3.5
            </span>
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight mt-1">
            Operaciones de Negocio y Consultas Específicas
          </h2>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Ejecución directa en Supabase con técnicas intermedias de SQL: anti-uniones, agregaciones condicionales, funciones de ventana y subconsultas correlacionadas.
          </p>
        </div>

        {currentSqlItem && (
          <button
            onClick={() => onOpenSql(currentSqlItem)}
            className="self-start md:self-auto px-3 py-2 border-2 border-black bg-white hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
          >
            VER SQL DE LA CONSULTA
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

      {/* Query Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {[
          {
            key: "q1",
            num: "Consulta 1",
            title: "Anti-Solapamiento",
            desc: "Disponibilidad real por fechas",
          },
          {
            key: "q2",
            num: "Consulta 2",
            title: "Utilización y Ventas",
            desc: "Rendimiento mensual y ranking",
          },
          {
            key: "q3",
            num: "Consulta 3",
            title: "Siniestralidad Alta",
            desc: "Clientes sobre el promedio",
          },
          {
            key: "q4",
            num: "Consulta 4",
            title: "Rentabilidad Flota",
            desc: "Margen neto por unidad",
          },
          {
            key: "q5",
            num: "Consulta 5",
            title: "Auditoría Cierres",
            desc: "Contratos irregulares",
          },
        ].map((q) => {
          const isActive = activeQuery === q.key;
          return (
            <button
              key={q.key}
              onClick={() => setActiveQuery(q.key as QueryKey)}
              className={`p-3 border-2 text-left transition-all cursor-pointer ${
                isActive
                  ? "border-[#722f37] bg-white shadow-[4px_4px_0px_0px_#722f37]"
                  : "border-black bg-zinc-50 hover:bg-white shadow-[2px_2px_0px_0px_#000000]"
              }`}
            >
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 border block w-fit ${
                  isActive
                    ? "bg-[#722f37] text-white border-[#722f37]"
                    : "bg-black text-white border-black"
                }`}
              >
                {q.num}
              </span>
              <h4 className="font-bold text-sm font-title mt-1.5 text-black">
                {q.title}
              </h4>
              <p className="text-[11px] text-zinc-500 font-body mt-0.5 line-clamp-1">
                {q.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* ACTIVE QUERY DETAILS */}

      {/* QUERY 1: ANTI-SOLAPAMIENTO */}
      {activeQuery === "q1" && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-200 pb-2">
              <div>
                <h3 className="font-bold text-base font-title">
                  Consulta 1: Disponibilidad Real de Flota (Anti-Solapamiento)
                </h3>
                <p className="text-xs text-zinc-600 font-body">
                  Usuario: <strong>Recepcionista</strong>. Excluye vehículos que posean reserva confirmada o alquiler activo en el intervalo solicitado usando doble <code>NOT EXISTS</code>.
                </p>
              </div>
              <button
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
                className="px-4 py-1.5 border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-zinc-800 self-start md:self-auto"
              >
                EJECUTAR CONSULTA
              </button>
            </div>

            {/* Interactive Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  Categoría:
                </label>
                <select
                  value={q1Category}
                  onChange={(e) =>
                    setQ1Category(
                      e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                    )
                  }
                  className="w-full p-2 border-2 border-black bg-white font-body cursor-pointer"
                >
                  <option value={3}>SUV Compacta (ID: 3)</option>
                  <option value={1}>Sedán Económico (ID: 1)</option>
                  <option value={4}>Pick-up Todo Terreno (ID: 4)</option>
                  <option value="ALL">Todas las Categorías</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  Sucursal de Retiro:
                </label>
                <select
                  value={q1Branch}
                  onChange={(e) =>
                    setQ1Branch(
                      e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                    )
                  }
                  className="w-full p-2 border-2 border-black bg-white font-body cursor-pointer"
                >
                  <option value={1}>Lima Centro - Principal (ID: 1)</option>
                  <option value={2}>Miraflores Express (ID: 2)</option>
                  <option value={3}>Aeropuerto Jorge Chávez (ID: 3)</option>
                  <option value="ALL">Todas las Sucursales</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  Fecha y Hora Inicio:
                </label>
                <input
                  type="datetime-local"
                  value={q1Start}
                  onChange={(e) => setQ1Start(e.target.value)}
                  className="w-full p-2 border-2 border-black bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-zinc-600 block mb-1">
                  Fecha y Hora Fin:
                </label>
                <input
                  type="datetime-local"
                  value={q1End}
                  onChange={(e) => setQ1End(e.target.value)}
                  className="w-full p-2 border-2 border-black bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Results Table */}
          {q1Loading ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold font-mono text-xs uppercase">
                Verificando solapamientos temporales en base de datos...
              </p>
            </div>
          ) : q1Results.length === 0 ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold text-sm text-zinc-600">
                No se encontraron unidades disponibles para los parámetros especificados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
              <table className="brutalist-table">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Vehículo</th>
                    <th>Categoría</th>
                    <th>Sucursal</th>
                    <th>Transmisión</th>
                    <th>Combustible</th>
                    <th>Kilometraje</th>
                    <th>Tarifa Aplicable</th>
                  </tr>
                </thead>
                <tbody>
                  {q1Results.map((r) => (
                    <tr key={r.id_vehiculo}>
                      <td className="font-mono font-bold">{r.placa}</td>
                      <td>
                        <span className="font-bold">{r.marca}</span> {r.modelo}{" "}
                        <span className="text-zinc-500 text-xs">({r.anio})</span>
                      </td>
                      <td>
                        <span className="px-1.5 py-0.5 border border-zinc-400 bg-zinc-50 text-xs">
                          {r.categoria}
                        </span>
                      </td>
                      <td className="text-xs">{r.sucursal}</td>
                      <td className="text-xs uppercase">{r.transmision}</td>
                      <td className="text-xs uppercase">{r.combustible}</td>
                      <td className="font-mono text-xs">
                        {Number(r.kilometraje_actual).toLocaleString()} km
                      </td>
                      <td className="font-mono font-bold text-[#722f37] text-sm">
                        S/ {Number(r.tarifa_aplicable).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUERY 2: UTILIZACIÓN E INGRESOS POR CATEGORÍA Y MES */}
      {activeQuery === "q2" && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base font-title">
                Consulta 2: Utilización e Ingresos de Flota por Categoría y Mes
              </h3>
              <p className="text-xs text-zinc-600 font-body">
                Usuario: <strong>Administrador</strong>. Utiliza CTE <code>WITH ingresos_por_contrato</code>, funciones de ventana <code>RANK() OVER</code> particionada por mes y agregaciones condicionales.
              </p>
            </div>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="px-4 py-1.5 border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-zinc-800 self-start md:self-auto"
            >
              RE-EJECUTAR CONSULTA
            </button>
          </div>

          {q2Loading ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold font-mono text-xs uppercase">
                Calculando ingresos agregados y ranking mensual en Supabase...
              </p>
            </div>
          ) : q2Results.length === 0 ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold text-sm text-zinc-600">
                No se encontraron registros de alquileres/pagos en la base de datos para la agregación mensual.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
              <table className="brutalist-table">
                <thead>
                  <tr>
                    <th>Mes Período</th>
                    <th>Categoría</th>
                    <th>Contratos</th>
                    <th>Días Alquilados</th>
                    <th>Ingreso Total</th>
                    <th>Ticket Promedio</th>
                    <th>Ranking del Mes</th>
                  </tr>
                </thead>
                <tbody>
                  {q2Results.map((r, idx) => (
                    <tr key={`${r.mes}-${r.id_categoria}-${idx}`}>
                      <td className="font-mono font-bold">
                        {new Date(r.mes).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                        })}
                      </td>
                      <td className="font-bold">{r.categoria}</td>
                      <td className="font-mono text-xs">{r.total_contratos} contratos</td>
                      <td className="font-mono text-xs">{r.dias_alquilados} días</td>
                      <td className="font-mono font-bold text-sm text-[#722f37]">
                        S/ {Number(r.ingreso_total).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="font-mono text-xs">
                        S/ {Number(r.ticket_promedio).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`font-mono text-xs font-black px-2 py-0.5 border ${
                            r.ranking_ingreso_mes === 1
                              ? "bg-[#722f37] text-white border-black"
                              : "bg-zinc-100 text-black border-zinc-400"
                          }`}
                        >
                          #{r.ranking_ingreso_mes}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUERY 3: CLIENTES CON SINIESTRALIDAD SUPERIOR AL PROMEDIO */}
      {activeQuery === "q3" && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base font-title">
                Consulta 3: Clientes con Siniestralidad Superior al Promedio
              </h3>
              <p className="text-xs text-zinc-600 font-body">
                Usuario: <strong>Administrador / Supervisor</strong>. Atraviesa 6 relaciones y evalúa una cláusula <code>HAVING</code> con subconsulta correlacionada escalar.
              </p>
            </div>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="px-4 py-1.5 border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-zinc-800 self-start md:self-auto"
            >
              RE-EJECUTAR CONSULTA
            </button>
          </div>

          {q3Loading ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold font-mono text-xs uppercase">
                Evaluando umbral general de siniestralidad por cliente en base de datos...
              </p>
            </div>
          ) : q3Results.length === 0 ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold text-sm text-zinc-600">
                No se registraron clientes con siniestralidad superior al promedio en la base de datos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
              <table className="brutalist-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Documento / Licencia</th>
                    <th>Contratos</th>
                    <th>Devoluciones Tardías</th>
                    <th>Reservas No-Show</th>
                    <th>Cargos Inspección</th>
                    <th>Penalidades Cobradas</th>
                    <th>Siniestralidad Total</th>
                  </tr>
                </thead>
                <tbody>
                  {q3Results.map((r) => (
                    <tr key={r.id_cliente}>
                      <td>
                        <span className="font-bold text-sm block">
                          {r.nombre_completo}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {r.email}
                        </span>
                      </td>
                      <td className="font-mono text-xs">
                        <div>DNI: {r.nro_documento}</div>
                        <div>Lic: {r.nro_licencia}</div>
                      </td>
                      <td className="font-mono text-xs">{r.total_contratos}</td>
                      <td className="font-mono text-xs text-amber-700 font-bold">
                        {r.devoluciones_tardias}
                      </td>
                      <td className="font-mono text-xs text-red-700 font-bold">
                        {r.reservas_no_show}
                      </td>
                      <td className="font-mono text-xs">
                        S/ {Number(r.total_cargos_inspeccion).toFixed(2)}
                      </td>
                      <td className="font-mono text-xs">
                        S/ {Number(r.total_penalidades).toFixed(2)}
                      </td>
                      <td className="font-mono font-black text-red-900 bg-red-50 text-sm">
                        S/ {Number(r.siniestralidad_total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUERY 4: RENTABILIDAD POR UNIDAD DE FLOTA */}
      {activeQuery === "q4" && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base font-title">
                Consulta 4: Rentabilidad por Unidad de Flota
              </h3>
              <p className="text-xs text-zinc-600 font-body">
                Usuario: <strong>Supervisor</strong>. Calcula el balance: <code>Ingresos Alquiler - Costos Mantenimiento = Margen Neto</code>, con ranking por categoría.
              </p>
            </div>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="px-4 py-1.5 border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-zinc-800 self-start md:self-auto"
            >
              RE-EJECUTAR CONSULTA
            </button>
          </div>

          {q4Loading ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold font-mono text-xs uppercase">
                Calculando rentabilidad neta por vehículo en base de datos...
              </p>
            </div>
          ) : q4Results.length === 0 ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold text-sm text-zinc-600">
                No se registraron datos de rentabilidad para las unidades en la base de datos.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
              <table className="brutalist-table">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Vehículo</th>
                    <th>Categoría</th>
                    <th>Ingresos Alquiler</th>
                    <th>Costo Mantenimiento</th>
                    <th>Margen Neto</th>
                    <th>Ranking Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {q4Results.map((r) => (
                    <tr key={r.id_vehiculo}>
                      <td className="font-mono font-bold">{r.placa}</td>
                      <td className="font-bold">{r.vehiculo_descripcion}</td>
                      <td className="text-xs">{r.categoria}</td>
                      <td className="font-mono text-xs text-emerald-800 font-semibold">
                        S/ {Number(r.ingresos_totales).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="font-mono text-xs text-red-700">
                        S/ {Number(r.costos_mantenimiento).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="font-mono font-black text-sm text-[#722f37]">
                        S/ {Number(r.margen_neto).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        <span className="font-mono text-xs font-black px-2 py-0.5 border border-black bg-zinc-100">
                          #{r.ranking_categoria}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* QUERY 5: AUDITORÍA DE CONTRATOS CERRADOS INCOMPLETOS */}
      {activeQuery === "q5" && (
        <div className="space-y-4">
          <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base font-title">
                Consulta 5: Auditoría de Contratos Cerrados de Forma Incompleta
              </h3>
              <p className="text-xs text-zinc-600 font-body">
                Usuario: <strong>Supervisor / Auditor</strong>. Identifica contratos marcados como &apos;FINALIZADO&apos; que carecen de kilometraje de retorno o no registran la resolución de la garantía.
              </p>
            </div>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="px-4 py-1.5 border-2 border-black bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-zinc-800 self-start md:self-auto"
            >
              RE-EJECUTAR AUDITORIA
            </button>
          </div>

          {q5Loading ? (
            <div className="p-8 text-center border-2 border-black bg-white">
              <p className="font-bold font-mono text-xs uppercase">
                Verificando inconsistencias de cierre de contratos en base de datos...
              </p>
            </div>
          ) : q5Results.length === 0 ? (
            <div className="p-8 text-center border-2 border-emerald-900 bg-emerald-50">
              <p className="font-bold text-sm text-emerald-900 font-mono">
                [CONFORME] No se detectaron inconsistencias en contratos finalizados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white">
              <table className="brutalist-table">
                <thead>
                  <tr>
                    <th>Contrato</th>
                    <th>Cliente</th>
                    <th>Placa</th>
                    <th>Fecha Entrega</th>
                    <th>Fecha Retorno Real</th>
                    <th>Inconsistencia Detectada</th>
                  </tr>
                </thead>
                <tbody>
                  {q5Results.map((r) => (
                    <tr key={r.id_alquiler}>
                      <td className="font-mono font-bold text-black">
                        {r.nro_contrato}
                      </td>
                      <td className="font-semibold">{r.cliente}</td>
                      <td className="font-mono text-xs">{r.placa}</td>
                      <td className="text-xs font-mono">
                        {new Date(r.fecha_entrega).toLocaleDateString()}
                      </td>
                      <td className="text-xs font-mono">
                        {r.fecha_dev_real
                          ? new Date(r.fecha_dev_real).toLocaleDateString()
                          : "No registrada"}
                      </td>
                      <td className="text-xs text-red-900 font-bold bg-red-50">
                        [INCONSISTENCIA] {r.motivo_inconsistencia}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
