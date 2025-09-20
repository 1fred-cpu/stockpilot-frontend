"use client";

import PageHeader from "./PageHeader";

import InventoryKPI from "./InventoryKPI";
import InventoryDistribution from "./InventoryDistribution";
import StockLevelsByCategory from "./StockLevelsByCategory";
import LowAndOutOfStockTable from "./LowAndOutStocks";
import RestockedManagement from "./RestockedManagement";

// -----------------------------
// Dashboard Component
// -----------------------------

export default function InventoryDashboard() {
  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Inventory Dashboard"
        subtitle="Manage your inventory effectively"
      />
      {/** KPI Cards */}
      <InventoryKPI />

      {/** Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryDistribution />
        <StockLevelsByCategory />
      </div>

      {/* Low Stock & Out of Stock Section */}
      <LowAndOutOfStockTable />

      {/** Restock Management */}
      <RestockedManagement />
    </div>
  );
}
