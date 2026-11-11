import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  accent?: boolean;
}

export function StatCard({
  title,
  value,
  subtitle,
  badge,
  accent = false,
}: StatCardProps) {
  return (
    <div
      className={`p-4 sm:p-5 border-2 transition-all ${
        accent
          ? "border-[#722f37] bg-white shadow-[4px_4px_0px_0px_#722f37]"
          : "border-black bg-white shadow-[4px_4px_0px_0px_#000000]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          {title}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 border ${
              accent
                ? "bg-[#722f37] text-white border-[#722f37]"
                : "bg-black text-white border-black"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div
        className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-title ${
          accent ? "text-[#722f37]" : "text-black"
        }`}
      >
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-zinc-600 mt-1 font-body">{subtitle}</p>
      )}
    </div>
  );
}

