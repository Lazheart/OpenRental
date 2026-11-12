"use client";

import React, { useState } from "react";
import { SQL_DEFINITIONS, SqlItem } from "@/lib/sqlDefinitions";

interface SqlCatalogTabProps {
  onOpenSql: (item: SqlItem) => void;
}

export function SqlCatalogTab({ onOpenSql }: SqlCatalogTabProps) {
  const [filterType, setFilterType] = useState<"ALL" | "VISTA" | "QUERY_ESPECIFICA">("ALL");
  const [copiedAll, setCopiedAll] = useState(false);

  const filtered = SQL_DEFINITIONS.filter((item) =>
    filterType === "ALL" ? true : item.viewOrType === filterType
  );

  const handleCopyAllViews = () => {
    const allViewsSql = SQL_DEFINITIONS.filter((item) => item.viewOrType === "VISTA")
      .map((item) => `-- ${item.name}\n${item.sql}\n`)
      .join("\n\n");

    navigator.clipboard.writeText(allViewsSql);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 border border-black bg-zinc-100">
              Catálogo de Vistas y DDL
            </span>
            <span className="text-xs font-mono text-zinc-500">
              PostgreSQL 16 / Supabase
            </span>
          </div>
          <h2 className="text-2xl font-black font-title tracking-tight mt-1">
            Diccionario de Vistas y Consultas Relacionales
          </h2>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Especificación técnica de las 7 vistas operativas y analíticas de OpenRental y las 5 consultas de negocio.
          </p>
        </div>

        <button
          onClick={handleCopyAllViews}
          className="self-start md:self-auto px-4 py-2 border-2 border-black bg-[#722f37] hover:bg-[#8e3642] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[3px_3px_0px_0px_#000000] cursor-pointer"
        >
          {copiedAll ? "[COPIADO] TODAS LAS VISTAS COPIADAS" : "COPIAR TODAS LAS VISTAS (04_VIEWS.SQL)"}
        </button>
      </div>

      {/* Deployment Guide Banner */}
      <div className="p-4 border-2 border-black bg-zinc-50 shadow-[3px_3px_0px_0px_#000000]">
        <h3 className="font-bold font-title text-base text-black mb-1">
          GUIA DE DESPLIEGUE EN SUPABASE SQL EDITOR
        </h3>
        <p className="text-xs font-body text-zinc-700 leading-relaxed">
          Para que Supabase exponga las vistas a la API PostgREST y la aplicación las consulte en vivo, copia el script con el botón superior y pégalo directamente en el <strong>SQL Editor</strong> de tu proyecto Supabase (<code className="font-mono bg-zinc-200 px-1 py-0.5">https://supabase.com/dashboard/project/ntiwgqurbsenjhiimoem/sql</code>). Toda la data se consulta directamente a la base de datos sin ningún adaptador de simulación.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Filtrar Catálogo:
        </span>
        <button
          onClick={() => setFilterType("ALL")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black cursor-pointer transition-colors ${
            filterType === "ALL"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-zinc-100"
          }`}
        >
          Todos ({SQL_DEFINITIONS.length})
        </button>
        <button
          onClick={() => setFilterType("VISTA")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black cursor-pointer transition-colors ${
            filterType === "VISTA"
              ? "bg-[#722f37] text-white"
              : "bg-white text-black hover:bg-zinc-100"
          }`}
        >
          Solo Vistas Relacionales (7)
        </button>
        <button
          onClick={() => setFilterType("QUERY_ESPECIFICA")}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black cursor-pointer transition-colors ${
            filterType === "QUERY_ESPECIFICA"
              ? "bg-black text-white"
              : "bg-white text-black hover:bg-zinc-100"
          }`}
        >
          Solo Consultas Específicas (5)
        </button>
      </div>

      {/* Grid of Definitions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="border-2 border-black p-5 bg-white shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 border ${
                    item.viewOrType === "VISTA"
                      ? "bg-[#722f37] text-white border-[#722f37]"
                      : "bg-black text-white border-black"
                  }`}
                >
                  {item.viewOrType}
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  {item.target}
                </span>
              </div>

              <h3 className="font-bold text-lg font-title mt-2 text-black">
                {item.name}
              </h3>

              <p className="text-xs text-zinc-700 font-body mt-2 leading-relaxed">
                {item.purpose}
              </p>

              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                  Roles Autorizados:
                </span>
                <div className="flex flex-wrap gap-1">
                  {item.roles.map((r) => (
                    <span
                      key={r}
                      className="text-[11px] px-1.5 py-0.2 bg-zinc-100 border border-zinc-300 font-medium"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">
                {item.id}
              </span>
              <button
                onClick={() => onOpenSql(item)}
                className="px-3 py-1.5 border-2 border-black bg-white hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#000000]"
              >
                INSPECCIONAR SQL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
