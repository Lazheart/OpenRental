import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "burgundy"
    | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  let variantClasses = "bg-zinc-100 text-black border-black";

  switch (variant) {
    case "success":
      variantClasses = "bg-emerald-100 text-emerald-950 border-emerald-900";
      break;
    case "warning":
      variantClasses = "bg-amber-100 text-amber-950 border-amber-900";
      break;
    case "danger":
      variantClasses = "bg-red-100 text-red-950 border-red-900";
      break;
    case "burgundy":
      variantClasses = "bg-[#722f37] text-white border-black";
      break;
    case "outline":
      variantClasses = "bg-transparent text-black border-black";
      break;
    default:
      variantClasses = "bg-black text-white border-black";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wider border ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
}

export function getStatusBadge(status: string) {
  const s = status.toUpperCase();
  if (s === "DISPONIBLE" || s === "COMPLETADO" || s === "FINALIZADO" || s === "APROBADO") {
    return <Badge variant="success">{s}</Badge>;
  }
  if (s === "EN_CURSO" || s === "EN_PROCESO" || s === "CONFIRMADA" || s === "CONFIRMADO") {
    return <Badge variant="burgundy">{s}</Badge>;
  }
  if (s === "RESERVADO" || s === "PROGRAMADO" || s === "PENDIENTE") {
    return <Badge variant="warning">{s}</Badge>;
  }
  if (s === "ATRASADO" || s === "EN_DISPUTA" || s === "CANCELADA" || s === "CANCELADO" || s === "NO_SHOW" || s === "RECHAZADO" || s === "DE_BAJA") {
    return <Badge variant="danger">{s}</Badge>;
  }
  return <Badge variant="outline">{s}</Badge>;
}

