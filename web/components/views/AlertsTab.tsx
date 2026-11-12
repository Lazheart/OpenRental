"use client";

import React, { useState, useEffect } from "react";
import { AlquilerPendiente } from "@/types/database";
import { getAlquileresPendientesAlertas } from "@/services/rental.service";
import { StatCard } from "@/components/ui/StatCard";
import { getStatusBadge } from "@/components/ui/Badge";
import { SQL_DEFINITIONS, SqlItem } from "@/lib/sqlDefinitions";

interface AlertsTabProps {
  onOpenSql: (item: SqlItem) => void;
}

export function AlertsTab({ onOpenSql }: AlertsTabProps) {
  const [alerts, setAlerts] = useState<AlquilerPendiente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      const res = await getAlquileresPendientesAlertas();
      setAlerts(res.data);
      if (res.error) {
        setErrorMsg(res.error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const maxDelay =
    alerts.length > 0 ? Math.max(...alerts.map((a) => Number(a.dias_retraso))) : 0;

  const currentSqlItem = SQL_DEFINITIONS.find(
    (s) => s.id === "vw_alquileres_pendientes"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-black bg-red-100 text-red-900">
              Vista: vw_alquileres_pendientes
            </span>
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight mt-1 text-black">
            Panel de Alertas: Alquileres Atrasados y en Disputa
          </h2>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Detección directa en Supabase de unidades con devolución vencida o retención irregular para gestión inmediata.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Contratos Vencidos"
          value={alerts.length}
          badge="Urgente"
          accent
          subtitle="Unidades no devueltas a la fecha"
        />
        <StatCard
          title="Máximo Retraso"
          value={`${maxDelay} días`}
          subtitle="Mayor tiempo de retraso acumulado"
        />
        <StatCard
          title="Acción Requerida"
          value="Contacto Telefónico"
          subtitle="Llamar al cliente o aplicar penalidad"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center border-2 border-black bg-white">
          <p className="font-bold text-sm uppercase tracking-widest font-mono">
            Consultando vw_alquileres_pendientes en Supabase...
          </p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center border-2 border-emerald-900 bg-emerald-50 shadow-[4px_4px_0px_0px_#047857]">
          <h3 className="text-lg font-bold font-title text-emerald-950">
            [ FLOTA AL DIA ]
          </h3>
          <p className="text-sm text-emerald-800 mt-1">
            No existen alquileres atrasados ni contratos en disputa registrados en la base de datos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => (
            <div
              key={a.id_alquiler}
              className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_#722f37] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-lg text-black bg-zinc-100 px-2 py-0.5 border border-black">
                    {a.nro_contrato}
                  </span>
                  {getStatusBadge(a.estado_alquiler)}
                  <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-black text-xs uppercase border border-black">
                    [MORA] {a.dias_retraso} {a.dias_retraso === 1 ? "Día" : "Días"} de Mora
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs text-zinc-800">
                  <div>
                    <span className="text-zinc-500 font-bold block">
                      Cliente Titular:
                    </span>
                    <span className="font-bold text-sm text-black">
                      {a.cliente_nombre}
                    </span>
                    <span className="text-zinc-600 font-mono block">
                      TEL: {a.cliente_telefono}
                    </span>
                    <span className="text-zinc-600 block">
                      EMAIL: {a.cliente_email}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block">
                      Vehículo:
                    </span>
                    <span className="font-bold text-black font-mono">
                      {a.placa}
                    </span>{" "}
                    - {a.vehiculo}
                    <span className="text-zinc-500 block">{a.categoria}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-bold block">
                      Devolución Pactada:
                    </span>
                    <span className="font-semibold text-red-700">
                      {new Date(a.fecha_dev_prevista).toLocaleDateString()} a las{" "}
                      {new Date(a.fecha_dev_prevista).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-zinc-500 block">
                      Sucursal: {a.sucursal_devolucion}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col gap-2 shrink-0">
                <a
                  href={`tel:${a.cliente_telefono}`}
                  className="px-3 py-1.5 border-2 border-black bg-[#722f37] hover:bg-[#8e3642] text-white text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#000000]"
                >
                  CONTACTAR
                </a>
                <button
                  onClick={() =>
                    alert(
                      `Iniciando gestión de cobro de penalidad por mora para contrato ${a.nro_contrato} (${a.dias_retraso} días).`
                    )
                  }
                  className="px-3 py-1.5 border-2 border-black bg-white hover:bg-zinc-100 text-black text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-colors"
                >
                  Generar Penalidad
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
