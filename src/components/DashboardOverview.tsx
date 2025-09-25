"use client";
import KPI from "./KPI";
import SalesTrendLast30DaysChart from "./SalesTrendChart";
import TopSellingProducts from "./TopSellingProducts";
import InventoryStatus from "./InventoryStatus";
import RecentTransactions from "./RecentTransactions";
import PageHeader from "./PageHeader";
import useStore from "../../utils/zustand";

export default function DashboardOverview() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  return (
    <div className="p-6 space-y-6 ">
      {/* Page Header */}
      <PageHeader
        title={`Welcome Back, ${store?.storeName}`}
        subtitle="Here's what's happening with your store today."
      />

      {/* KPI Cards */}
      <KPI />
      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <SalesTrendLast30DaysChart />

        {/* Top Products */}
        <TopSellingProducts />
      </section>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Status */}
        <InventoryStatus />

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>
    </div>
  );
}
