"use client";

import React, { useState, useEffect } from "react";
import { Navbar, TabId } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FleetTab } from "@/components/views/FleetTab";
import { RentalsTab } from "@/components/views/RentalsTab";
import { FinanceTab } from "@/components/views/FinanceTab";
import { MaintenanceTab } from "@/components/views/MaintenanceTab";
import { ClientsTab } from "@/components/views/ClientsTab";
import { AlertsTab } from "@/components/views/AlertsTab";
import { QueriesTab } from "@/components/views/QueriesTab";
import { SqlCatalogTab } from "@/components/views/SqlCatalogTab";
import { AvailabilityView } from "@/components/views/AvailabilityView";
import { MyReservationsView } from "@/components/views/MyReservationsView";
import { AgentReservationsView } from "@/components/views/AgentReservationsView";
import { AuthModal } from "@/components/auth/AuthModal";
import { SqlModal } from "@/components/ui/SqlModal";
import { SqlItem } from "@/lib/sqlDefinitions";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading: authLoading, isAgent, isClient } = useAuth();

  // Determine initial tab based on auth state (resolved after loading)
  const getInitialTab = (): TabId => {
    if (!user) return "disponibilidad";
    if (isClient()) return "disponibilidad";
    return "flota";
  };

  const [activeTab, setActiveTab] = useState<TabId>("disponibilidad");
  const [selectedSqlItem, setSelectedSqlItem] = useState<SqlItem | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Once auth resolves, set the correct initial tab
  useEffect(() => {
    if (!authLoading && !initialized) {
      setActiveTab(getInitialTab());
      setInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleOpenSql = (item: SqlItem) => {
    setSelectedSqlItem(item);
  };

  const handleCloseSql = () => {
    setSelectedSqlItem(null);
  };

  // Brutalista loading screen
  if (authLoading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="border-4 border-black p-10 shadow-[8px_8px_0px_0px_#000] text-center">
          <h1 className="text-3xl font-black font-title tracking-tight mb-2">
            OPEN<span className="text-[#722f37]">RENTAL</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-3 h-3 bg-black animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-3 h-3 bg-[#722f37] animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-3 h-3 bg-black animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-xs uppercase tracking-widest font-body text-zinc-500 mt-4">
            Verificando sesión…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-body selection:bg-[#722f37] selection:text-white">
      {/* Navbar with tabs and user menu */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userRole={user?.role}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Public / Client tabs */}
        {activeTab === "disponibilidad" && (
          <AvailabilityView currentUser={user} />
        )}

        {activeTab === "mis-reservas" && (
          <MyReservationsView />
        )}

        {/* Agent-only tabs */}
        {activeTab === "reservas" && isAgent() && (
          <AgentReservationsView />
        )}

        {activeTab === "flota" && isAgent() && (
          <FleetTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "alquileres" && isAgent() && (
          <RentalsTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "finanzas" && isAgent() && (
          <FinanceTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "mantenimiento" && isAgent() && (
          <MaintenanceTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "clientes" && isAgent() && (
          <ClientsTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "alertas" && isAgent() && (
          <AlertsTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "consultas" && isAgent() && (
          <QueriesTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "sql" && isAgent() && (
          <SqlCatalogTab onOpenSql={handleOpenSql} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* SQL Inspector Modal */}
      <SqlModal item={selectedSqlItem} onClose={handleCloseSql} />

      {/* Auth Modal (global) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}
