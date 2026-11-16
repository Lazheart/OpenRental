"use client";

import React, { useState } from "react";
import { signUp } from "@/services/auth.service";

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp(email, password, displayName);

    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Error al crear la cuenta. Intenta de nuevo.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="border-4 border-black bg-black text-white px-4 py-3 text-center">
          <p className="font-black text-sm uppercase tracking-widest">¡Cuenta creada!</p>
          <p className="text-xs font-body mt-1 text-zinc-300">
            Revisa tu correo para verificar tu cuenta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="border-2 border-[#722f37] bg-[#722f37]/10 px-3 py-2 text-sm font-bold text-[#722f37] font-body">
          {error}
        </div>
      )}

      {/* Info note */}
      <div className="border-2 border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-body text-zinc-600">
        Tu cuenta se crea como <strong>cliente</strong>. Para acceso de agente, contacta al administrador.
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-widest font-body">
          Nombre completo
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          disabled={loading}
          placeholder="Juan Pérez García"
          className="border-2 border-black px-3 py-2 text-sm font-body bg-white focus:outline-none focus:border-[#722f37] shadow-[2px_2px_0px_0px_#000] disabled:opacity-60"
        />
      </div>

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
          Contraseña <span className="font-normal normal-case">(mín. 8 caracteres)</span>
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

      <div className="flex flex-col gap-1">
        <label className="text-xs font-black uppercase tracking-widest font-body">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? "CREANDO CUENTA…" : "CREAR CUENTA"}
      </button>

      <p className="text-center text-xs font-body text-zinc-600">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-black underline hover:text-[#722f37] cursor-pointer"
        >
          Inicia sesión
        </button>
      </p>
    </form>
  );
}
