"use client";

import React, { useState, useEffect } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = "login" | "register";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="border-b-4 border-black px-6 py-4 flex items-start justify-between bg-black text-white">
          <div>
            <h2 className="text-2xl font-black font-title tracking-tight">
              OPEN<span className="text-[#ff8093]">RENTAL</span>
            </h2>
            <p className="text-xs font-body text-zinc-400 mt-0.5 uppercase tracking-widest">
              {mode === "login" ? "Inicia sesión en tu cuenta" : "Crea una nueva cuenta"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="mt-0.5 text-white hover:text-[#ff8093] font-black text-xl leading-none cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Area */}
        <div className="px-6 py-5">
          {mode === "login" ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={() => setMode("register")}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setMode("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
