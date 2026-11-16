"use client";

import React from "react";
import { UserMenu } from "@/components/auth/UserMenu";

export type TabId =
  | "flota"
  | "alquileres"
  | "finanzas"
  | "mantenimiento"
  | "clientes"
  | "alertas"
  | "consultas"
  | "sql"
  | "disponibilidad"
  | "mis-reservas"
  | "reservas";

interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  userRole?: string;
}

export function Navbar({ activeTab, onSelectTab, userRole }: NavbarProps) {
  // All agent-facing tabs (operational)
  const agentTabs: { id: TabId; label: string; countBadge?: string }[] = [
    { id: "flota", label: "Flota" },
    { id: "alquileres", label: "Alquileres" },
    { id: "finanzas", label: "Finanzas" },
    { id: "mantenimiento", label: "Mantenimiento" },
    { id: "clientes", label: "Clientes" },
    { id: "alertas", label: "Alertas Mora", countBadge: "!" },
    { id: "consultas", label: "Queries Específicas" },
    { id: "sql", label: "Vistas y DDL" },
    { id: "reservas", label: "Reservas" },
  ];

  // Determine visible tabs based on role
  let visibleTabs: { id: TabId; label: string; countBadge?: string }[];

  if (!userRole) {
    // Not authenticated: only Disponibilidad
    visibleTabs = [{ id: "disponibilidad", label: "Disponibilidad" }];
  } else if (userRole === "CLIENTE") {
    // Client: Disponibilidad + Mis Reservas
    visibleTabs = [
      { id: "disponibilidad", label: "Disponibilidad" },
      { id: "mis-reservas", label: "Mis Reservas" },
    ];
  } else {
    // Agent (any non-CLIENTE authenticated role): all agent tabs + Disponibilidad first
    visibleTabs = [
      { id: "disponibilidad", label: "Disponibilidad" },
      ...agentTabs,
    ];
  }

  return (
    <header className="border-b-3 border-black bg-white sticky top-0 z-40">
      {/* Top Banner */}
      <div className="bg-black text-white px-4 py-1.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-extrabold uppercase text-[#ff8093] tracking-widest">
            SISTEMA OPERATIVO DE FLOTA
          </span>
          <span className="hidden sm:inline text-zinc-500">|</span>
          <span className="hidden sm:inline text-zinc-300">
            OpenRental v1.0
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl sm:text-3xl font-black font-title tracking-tight text-black">
              OPEN<span className="text-[#722f37]">RENTAL</span>
            </h1>
          </div>
          <p className="text-xs text-zinc-600 font-body mt-0.5">
            Plataforma para gestión de flota y analítica
          </p>
        </div>

        {/* Navigation Tabs */}
        <nav
          className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1"
          aria-label="Navegación principal"
        >
          {visibleTabs.map((tab) => {
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
