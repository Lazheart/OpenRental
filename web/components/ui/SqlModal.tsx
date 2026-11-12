"use client";

import React, { useState } from "react";
import { SqlItem } from "@/lib/sqlDefinitions";

interface SqlModalProps {
  item: SqlItem | null;
  onClose: () => void;
}

export function SqlModal({ item, onClose }: SqlModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white border-3 border-black w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_#000000]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 border border-black bg-[#722f37] text-white">
                {item.viewOrType}
              </span>
              <span className="text-xs font-mono text-zinc-600">
                {item.target}
              </span>
            </div>
            <h2 className="text-xl font-bold font-title mt-1 text-black">
              {item.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-black hover:text-white font-bold transition-colors cursor-pointer text-xs font-mono"
            aria-label="Cerrar modal"
          >
            [X]
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Propósito y Reglas de Negocio
            </h4>
            <p className="text-sm text-zinc-800 font-body leading-relaxed">
              {item.purpose}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Roles y Usuarios Autorizados
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {item.roles.map((r) => (
                <span
                  key={r}
                  className="text-xs px-2 py-0.5 border border-black bg-zinc-50 font-medium"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Definición SQL en PostgreSQL
              </h4>
              <button
                onClick={handleCopy}
                className="text-xs font-bold uppercase px-3 py-1 border border-black bg-white hover:bg-zinc-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copied ? "[ COPIADO ]" : "COPIAR SQL"}
              </button>
            </div>
            <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto border-2 border-black rounded-none selection:bg-zinc-700 selection:text-white leading-relaxed">
              <code>{item.sql}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-black bg-zinc-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border-2 border-black bg-white hover:bg-black hover:text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
