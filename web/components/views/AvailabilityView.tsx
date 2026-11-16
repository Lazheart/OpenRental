"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  checkAvailability,
  createReserva,
  VehiculoDisponible,
} from "@/services/booking.service";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";

interface AvailabilityViewProps {
  onOpenSql?: (item: unknown) => void;
  currentUser?: unknown;
}

interface Sucursal {
  id_sucursal: number;
  nombre: string;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

export function AvailabilityView({ currentUser }: AvailabilityViewProps) {
  const { user, isClient } = useAuth();

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [idSucursal, setIdSucursal] = useState<string>("");
  const [idCategoria, setIdCategoria] = useState<string>("");

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [results, setResults] = useState<VehiculoDisponible[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reservation modal state
  const [selectedVehiculo, setSelectedVehiculo] = useState<VehiculoDisponible | null>(null);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [reservaLoading, setReservaLoading] = useState(false);
  const [reservaError, setReservaError] = useState<string | null>(null);
  const [reservaSuccess, setReservaSuccess] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Load sucursales and categorias on mount
  useEffect(() => {
    supabase
      .from("sucursal")
      .select("id_sucursal, nombre")
      .then(({ data }) => setSucursales((data as Sucursal[]) ?? []));

    supabase
      .from("categoria")
      .select("id_categoria, nombre")
      .then(({ data }) => setCategorias((data as Categoria[]) ?? []));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults([]);
    setSearched(false);

    if (!fechaInicio || !fechaFin) {
      setError("Selecciona las fechas de inicio y fin.");
      return;
    }

    if (new Date(fechaFin) <= new Date(fechaInicio)) {
      setError("La fecha fin debe ser posterior a la fecha inicio.");
      return;
    }

    setLoading(true);

    const { data, error: fetchError } = await checkAvailability(
      idCategoria ? parseInt(idCategoria) : 0,
      fechaInicio,
      fechaFin,
      idSucursal ? parseInt(idSucursal) : 0
    );

    setLoading(false);
    setSearched(true);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setResults(data);
  };

  const handleReservar = (vehiculo: VehiculoDisponible) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedVehiculo(vehiculo);
    setReservaError(null);
    setReservaSuccess(false);
    setShowReservaModal(true);
  };

  const getDays = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const diff = new Date(fechaFin).getTime() - new Date(fechaInicio).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleConfirmReserva = async () => {
    if (!selectedVehiculo || !user) return;

    setReservaLoading(true);
    setReservaError(null);

    const days = getDays();
    const totalEstimado = days * selectedVehiculo.tarifa_diaria;

    const { error } = await createReserva({
      id_categoria: selectedVehiculo.id_categoria,
      id_vehiculo: selectedVehiculo.id_vehiculo,
      id_sucursal_retiro: selectedVehiculo.id_sucursal,
      id_sucursal_devolucion: selectedVehiculo.id_sucursal,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      tarifa_diaria_pactada: selectedVehiculo.tarifa_diaria,
      total_estimado: totalEstimado,
    });

    setReservaLoading(false);

    if (error) {
      setReservaError(error.message);
      return;
    }

    setReservaSuccess(true);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000]">
        <h2 className="text-2xl font-black font-title tracking-tight">
          Consulta Disponibilidad de Vehículos
        </h2>
        <p className="text-sm font-body text-zinc-600 mt-1">
          Selecciona fechas, sucursal y categoría para ver los vehículos disponibles.
        </p>
      </div>

      {/* Not authenticated banner */}
      {!user && (
        <div className="border-2 border-black bg-zinc-900 text-white px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm font-body">
            <strong>Inicia sesión o regístrate</strong> para hacer una reserva.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="text-xs font-black uppercase tracking-widest px-3 py-2 bg-white text-black border-2 border-white hover:bg-[#722f37] hover:text-white hover:border-[#722f37] transition-colors cursor-pointer"
          >
            INICIAR SESIÓN
          </button>
        </div>
      )}

      {/* Filter Form */}
      <form
        onSubmit={handleSearch}
        className="border-2 border-black p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-[3px_3px_0px_0px_#000]"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest font-body">
            Fecha inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            min={today}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border-2 border-black px-3 py-2 text-sm font-body bg-white focus:outline-none focus:border-[#722f37] shadow-[2px_2px_0px_0px_#000]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest font-body">
            Fecha fin
          </label>
          <input
            type="date"
            value={fechaFin}
            min={fechaInicio || today}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border-2 border-black px-3 py-2 text-sm font-body bg-white focus:outline-none focus:border-[#722f37] shadow-[2px_2px_0px_0px_#000]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest font-body">
            Sucursal
          </label>
          <select
            value={idSucursal}
            onChange={(e) => setIdSucursal(e.target.value)}
            className="border-2 border-black px-3 py-2 text-sm font-body bg-white focus:outline-none focus:border-[#722f37] shadow-[2px_2px_0px_0px_#000]"
          >
            <option value="">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id_sucursal} value={s.id_sucursal}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase tracking-widest font-body">
            Categoría
          </label>
          <select
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
            className="border-2 border-black px-3 py-2 text-sm font-body bg-white focus:outline-none focus:border-[#722f37] shadow-[2px_2px_0px_0px_#000]"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          {error && (
            <p className="text-sm font-bold text-[#722f37] mb-2 font-body">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-black uppercase tracking-widest text-sm px-6 py-3 border-2 border-black hover:bg-[#722f37] hover:border-[#722f37] transition-colors shadow-[3px_3px_0px_0px_#722f37] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "BUSCANDO…" : "BUSCAR DISPONIBILIDAD"}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && !loading && (
        <>
          {results.length === 0 ? (
            <div className="border-2 border-black p-6 text-center">
              <p className="font-black text-lg uppercase font-title">Sin resultados</p>
              <p className="text-sm font-body text-zinc-500 mt-1">
                No hay vehículos disponibles para los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs uppercase tracking-widest font-black font-body mb-3 text-zinc-600">
                {results.length} vehículo{results.length !== 1 ? "s" : ""} disponible{results.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((v) => (
                  <div
                    key={v.id_vehiculo}
                    className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] flex flex-col"
                  >
                    {/* Card header */}
                    <div className="border-b-2 border-black px-4 py-3 flex items-center justify-between bg-zinc-900 text-white">
                      <span className="font-black font-mono tracking-widest text-sm">
                        {v.placa}
                      </span>
                      <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-green-600 text-white">
                        DISPONIBLE
                      </span>
                    </div>

                    <div className="px-4 py-3 flex flex-col gap-2 flex-1">
                      <p className="font-black text-base font-title">
                        {v.modelo}
                      </p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-body">
                        <div>
                          <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Categoría</span>
                          <p className="font-bold">{v.nombre_categoria}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Sucursal</span>
                          <p className="font-bold">{v.nombre_sucursal}</p>
                        </div>
                        {v.transmision != null && (
                          <div>
                            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Transmisión</span>
                            <p className="font-bold">{String(v.transmision as string)}</p>
                          </div>
                        )}
                        {v.combustible != null && (
                          <div>
                            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Combustible</span>
                            <p className="font-bold">{String(v.combustible as string)}</p>
                          </div>
                        )}
                        {v.capacidad_pasajeros != null && (
                          <div>
                            <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Capacidad</span>
                            <p className="font-bold">{String(v.capacidad_pasajeros as number)} pers.</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto pt-3 border-t-2 border-black flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-black font-body">Tarifa/día</span>
                          <p className="text-xl font-black font-title text-[#722f37]">
                            S/ {Number(v.tarifa_diaria).toFixed(2)}
                          </p>
                        </div>
                        {(user && isClient()) ? (
                          <button
                            onClick={() => handleReservar(v)}
                            className="text-xs font-black uppercase tracking-widest px-3 py-2 bg-black text-white border-2 border-black hover:bg-[#722f37] hover:border-[#722f37] transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#722f37]"
                          >
                            RESERVAR
                          </button>
                        ) : !user ? (
                          <button
                            onClick={() => setShowAuthModal(true)}
                            className="text-xs font-bold uppercase tracking-wider px-3 py-2 border-2 border-black hover:bg-zinc-100 cursor-pointer"
                          >
                            INICIAR SESIÓN
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* AuthModal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      {/* Reservation confirmation modal */}
      {showReservaModal && selectedVehiculo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !reservaLoading && setShowReservaModal(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
            <div className="border-b-4 border-black px-5 py-4 bg-black text-white flex items-center justify-between">
              <h3 className="font-black text-lg uppercase tracking-widest font-title">
                Confirmar Reserva
              </h3>
              <button
                onClick={() => setShowReservaModal(false)}
                disabled={reservaLoading}
                className="text-white hover:text-[#ff8093] font-black text-xl cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              {reservaSuccess ? (
                <div className="border-4 border-black bg-black text-white p-4 text-center">
                  <p className="font-black uppercase tracking-widest">¡Reserva creada!</p>
                  <p className="text-xs font-body text-zinc-300 mt-1">
                    Recibirás la confirmación por correo.
                  </p>
                  <button
                    onClick={() => setShowReservaModal(false)}
                    className="mt-3 text-xs font-black uppercase px-4 py-2 bg-white text-black hover:bg-zinc-100 cursor-pointer"
                  >
                    CERRAR
                  </button>
                </div>
              ) : (
                <>
                  {reservaError && (
                    <div className="border-2 border-[#722f37] bg-[#722f37]/10 px-3 py-2 text-sm font-bold text-[#722f37] font-body">
                      {reservaError}
                    </div>
                  )}

                  <div className="border-2 border-black p-3 flex flex-col gap-2 text-sm font-body">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Vehículo</span>
                      <span className="font-bold">{selectedVehiculo.placa} – {selectedVehiculo.modelo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Categoría</span>
                      <span className="font-bold">{selectedVehiculo.nombre_categoria}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Sucursal</span>
                      <span className="font-bold">{selectedVehiculo.nombre_sucursal}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 pt-2 mt-1">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Fecha inicio</span>
                      <span className="font-bold">{fechaInicio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Fecha fin</span>
                      <span className="font-bold">{fechaFin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Días</span>
                      <span className="font-bold">{getDays()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-black">Tarifa/día</span>
                      <span className="font-bold">S/ {Number(selectedVehiculo.tarifa_diaria).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-black pt-2 mt-1">
                      <span className="font-black uppercase tracking-wider text-[11px]">Total estimado</span>
                      <span className="font-black text-lg text-[#722f37]">
                        S/ {(getDays() * Number(selectedVehiculo.tarifa_diaria)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmReserva}
                    disabled={reservaLoading}
                    className="bg-black text-white font-black uppercase tracking-widest text-sm px-4 py-3 border-2 border-black hover:bg-[#722f37] hover:border-[#722f37] transition-colors shadow-[3px_3px_0px_0px_#722f37] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {reservaLoading ? "PROCESANDO…" : "CONFIRMAR RESERVA"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
