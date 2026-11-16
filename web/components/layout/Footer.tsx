import React from "react";
import { Github } from "@deemlol/next-icons";

export function Footer() {
  return (
    <footer className="mt-auto border-t-3 border-black bg-zinc-100 p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-body">
        <div>
          <p className="font-bold uppercase tracking-wider text-black">
            OpenRental
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-zinc-600 font-mono text-[11px]">

          <a
            href="https://github.com/Lazheart/OpenRental"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 font-bold uppercase tracking-wider text-black hover:bg-[#722f37] hover:text-white hover:border-[#722f37] transition-colors shadow-[2px_2px_0px_0px_#000000]"
          >
            <Github size={16} strokeWidth={2} />
            <span>Lazheart/OpenRental</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

