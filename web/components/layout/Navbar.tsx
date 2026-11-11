"use client";

import React from "react";

export type TabId =
  | "flota"
  | "alquileres"
  | "finanzas"
  | "mantenimiento"
  | "clientes"
  | "alertas"
  | "consultas"
  | "sql";

interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isFallbackActive?: boolean;
}

export function Navbar({
  activeTab,
  onSelectTab,
  isFallbackActive = false,
}: NavbarProps) {
  const tabs: { id: TabId; label: string; icon: string; countBadge?: string }[] = [
    { id: "flota", label: "Flota", icon: "🚗" },
    { id: "alquileres", label: "Alquileres", icon: "📑" },
    { id: "finanzas", label: "Finanzas", icon: "💰" },
    { id: "mantenimiento", label: "Taller & Mant.", icon: "🔧" },
    { id: "clientes", label: "Clientes", icon: "👥" },
    { id: "alertas", label: "Alertas Mora", icon: "⚠️", countBadge: "!" },
    { id: "consultas", label: "Queries Específicas", icon: "📊" },
    { id: "sql", label: "Vistas & DDL", icon: "🗄️" },
  ];

  return (
    <header className="border-b-3 border-black bg-white sticky top-0 z-40">
      {/* Top Banner */}
      <div className="bg-black text-white px-4 py-1.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-extrabold uppercase text-[#ff8093] tracking-widest">
            ● SISTEMA OPERATIVO FLOTA
          </span>
          <span className="hidden sm:inline text-zinc-400">|</span>
          <span className="hidden sm:inline text-zinc-300">
            OpenRental v1.0 • UTEC Base de Datos
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isFallbackActive ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400 text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Modo Demostración / Fallback
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Supabase Vistas Online
            </span>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-black font-title tracking-tight text-black">
              OPEN<span className="text-[#722f37]">RENTAL</span>
            </h1>
            <span className="text-xs uppercase font-extrabold tracking-widest px-1.5 py-0.5 border border-black bg-zinc-100">
              PostgreSQL Views
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Plataforma brutalista y minimalista para gestión de flota y analítica relacional
          </p>
        </div>

        {/* Navigation Tabs */}
        <nav
          className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1"
          aria-label="Navegación principal"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#722f37] text-white border-black shadow-[3px_3px_0px_0px_#000000]"
                    : "bg-white text-black border-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.countBadge && (
                  <span className="ml-0.5 px-1 py-0.2 bg-red-600 text-white text-[10px] font-black border border-white">
                    {tab.countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

