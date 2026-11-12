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

  const handleOpenSql = (item: SqlItem) => {
    setSelectedSqlItem(item);
  };

  const handleCloseSql = () => {
    setSelectedSqlItem(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-body selection:bg-[#722f37] selection:text-white">
      {/* Navbar with tabs and API status */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "flota" && (
          <FleetTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "alquileres" && (
          <RentalsTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "finanzas" && (
          <FinanceTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "mantenimiento" && (
          <MaintenanceTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "clientes" && (
          <ClientsTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "alertas" && (
          <AlertsTab onOpenSql={handleOpenSql} />
        )}

        {activeTab === "consultas" && (
          <QueriesTab onOpenSql={handleOpenSql} />
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
