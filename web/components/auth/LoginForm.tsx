"use client";

import React, { useState } from "react";
import { signIn } from "@/services/auth.service";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Error al iniciar sesión. Verifica tus credenciales.");
      return;
    }

    onSuccess();
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="border-2 border-[#722f37] bg-[#722f37]/10 px-3 py-2 text-sm font-bold text-[#722f37] font-body">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-widest font-body">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          placeholder="tu@correo.com"
          className="border-2 border-black px-3 py-2 text-sm font-body bg-white focus:outline-none focus:border-[#722f37] shadow-[2px_2px_0px_0px_#000] disabled:opacity-60"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-widest font-body">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          placeholder="••••••••"
          className="border-2 border-black px-3 py-2 text-sm font-body bg-white focus:outline-none focus:border-[#722f37] shadow-[2px_2px_0px_0px_#000] disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-1 bg-black text-white font-black uppercase tracking-widest text-sm px-4 py-3 border-2 border-black hover:bg-[#722f37] hover:border-[#722f37] transition-colors shadow-[3px_3px_0px_0px_#722f37] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "INICIANDO…" : "INICIAR SESIÓN"}
      </button>

      {/* Demo credentials */}
      <div className="flex flex-col gap-1.5 pt-1 border-t-2 border-black">
        <span className="text-[10px] uppercase tracking-widest font-black text-zinc-500 font-body">
          Acceso rápido demo
        </span>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fillDemo("demo@openrental.pe", "Demo1234!")}
            className="text-[11px] font-bold border border-zinc-400 px-2 py-1 hover:border-black hover:bg-zinc-100 transition-colors font-body cursor-pointer"
          >
            Demo cliente
          </button>
          <button
            type="button"
            onClick={() => fillDemo("agente@openrental.pe", "Agente1234!")}
            className="text-[11px] font-bold border border-zinc-400 px-2 py-1 hover:border-black hover:bg-zinc-100 transition-colors font-body cursor-pointer"
          >
            Demo agente
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 font-body">
          demo@openrental.pe / Demo1234! &nbsp;|&nbsp; agente@openrental.pe / Agente1234!
        </p>
      </div>

      <p className="text-center text-xs font-body text-zinc-600">
        ¿No tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-black underline hover:text-[#722f37] cursor-pointer"
        >
          Regístrate
        </button>
      </p>
    </form>
  );
}
