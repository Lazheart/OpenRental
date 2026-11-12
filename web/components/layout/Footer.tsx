import React from "react";

export function Footer() {
  return (
    <footer className="mt-auto border-t-3 border-black bg-zinc-100 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-body">
        <div>
          <p className="font-bold uppercase tracking-wider text-black">
            OpenRental - Base de Datos I (UTEC)
          </p>
          <p className="text-zinc-600 mt-0.5">
            Arquitectura desacoplada: Next.js + PostgreSQL + Supabase. Estética brutalista y minimalista sin datos mockeados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-zinc-600 font-mono text-[11px]">
          <span>Tipografías: EB Garamond y Roboto Slab</span>
          <span>|</span>
          <span>Acento: Burgundy #722F37</span>
          <span>|</span>
          <span>Vistas: 7 relacionales</span>
          <span>|</span>
          <span>Queries: 5 avanzadas</span>
        </div>
      </div>
    </footer>
  );
}
