"use client";

import React, { useState } from "react";
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
import { SqlModal } from "@/components/ui/SqlModal";
import { SqlItem } from "@/lib/sqlDefinitions";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("flota");
  const [selectedSqlItem, setSelectedSqlItem] = useState<SqlItem | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState<boolean>(false);

  const handleOpenSql = (item: SqlItem) => {
    setSelectedSqlItem(item);
  };

  const handleCloseSql = () => {
    setSelectedSqlItem(null);
  };

  const handleFallbackDetected = (fallback: boolean) => {
    if (fallback) {
      setIsFallbackActive(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-body selection:bg-[#722f37] selection:text-white">
      {/* Navbar with tabs and connection status */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isFallbackActive={isFallbackActive}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "flota" && (
          <FleetTab
            onOpenSql={handleOpenSql}
            onFallbackDetected={handleFallbackDetected}
          />
        )}

        {activeTab === "alquileres" && (
          <RentalsTab
            onOpenSql={handleOpenSql}
            onFallbackDetected={handleFallbackDetected}
          />
        )}

        {activeTab === "finanzas" && (
          <FinanceTab
            onOpenSql={handleOpenSql}
            onFallbackDetected={handleFallbackDetected}
          />
        )}

        {activeTab === "mantenimiento" && (
          <MaintenanceTab
            onOpenSql={handleOpenSql}
            onFallbackDetected={handleFallbackDetected}
          />
        )}

        {activeTab === "clientes" && (
          <ClientsTab
            onOpenSql={handleOpenSql}
            onFallbackDetected={handleFallbackDetected}
          />
        )}

        {activeTab === "alertas" && (
          <AlertsTab
            onOpenSql={handleOpenSql}
            onFallbackDetected={handleFallbackDetected}
          />
        )}

        {activeTab === "consultas" && (
          <QueriesTab
            onOpenSql={handleOpenSql}
            onFallbackDetected={handleFallbackDetected}
          />
        )}

        {activeTab === "sql" && (
          <SqlCatalogTab onOpenSql={handleOpenSql} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* SQL Inspector Modal */}
      <SqlModal item={selectedSqlItem} onClose={handleCloseSql} />
    </div>
  );
}
