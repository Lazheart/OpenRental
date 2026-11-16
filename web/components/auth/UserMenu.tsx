"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";

export function UserMenu() {
  const { user, loading, signOut, isAgent } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 border-2 border-zinc-600 bg-zinc-800 text-zinc-400 text-xs font-mono animate-pulse">
        CARGANDO…
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="px-3 py-1 bg-white text-black border-2 border-white text-xs font-black uppercase tracking-widest hover:bg-[#722f37] hover:text-white hover:border-[#722f37] transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#722f37]"
        >
          INICIAR SESIÓN
        </button>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  const roleBadgeClass =
    user.role === "CLIENTE"
      ? "bg-zinc-500 text-white"
      : "bg-[#722f37] text-white";

  const displayName = user.display_name ?? user.username ?? user.email ?? "Usuario";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown((v) => !v)}
        className="flex items-center gap-2 px-3 py-1 border-2 border-white hover:border-[#722f37] transition-colors cursor-pointer"
      >
        <span className="text-white text-xs font-bold font-body max-w-[120px] truncate">
          {displayName}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 ${roleBadgeClass}`}>
          {user.role}
        </span>
        <span className="text-white text-xs">▾</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000]">
          <div className="border-b-2 border-black px-3 py-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-body">Sesión activa</p>
            <p className="text-xs font-black truncate">{user.email ?? displayName}</p>
          </div>
          {!isAgent() && (
            <button
              onClick={() => {
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 border-b border-zinc-200 cursor-pointer font-body"
            >
              Mi Perfil
            </button>
          )}
          <button
            onClick={async () => {
              setShowDropdown(false);
              await signOut();
            }}
            className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#722f37] hover:text-white transition-colors cursor-pointer font-body"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
