import type { Metadata } from "next";
import { EB_Garamond, Roboto_Slab } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenRental - Sistema de Gestión y Analítica de Flota",
  description: "Plataforma minimalista y brutalista de gestión de alquiler de vehículos basada en vistas relacionales y PostgreSQL.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${ebGaramond.variable} ${robotoSlab.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-white text-black">
        {children}
      </body>
    </html>
  );
}
