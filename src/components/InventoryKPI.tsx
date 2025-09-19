import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, TrendingDown, Warehouse } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";

export default function InventoryKPI() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const {
    data: inventoryKPIs,
    isLoading: loadingKPIs,
    refetch: refetchKPIs,
    error,
  } = useQuery({
    queryKey: ["inventory-kpis", store?.store_id],
    queryFn: fetchInventoryKPIs,
    enabled: !!store?.store_id,
    refetchOnWindowFocus: false,
  });

  async function fetchInventoryKPIs() {
    try {
      const response = await axiosInstance.get(
        `/analytics/inventory-kpi/${store?.store_id}`
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
  if (loadingKPIs) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Skeleton className=" rounded-md h-40" />
        <Skeleton className=" rounded-md h-40" />
        <Skeleton className=" rounded-md h-40" />
        <Skeleton className=" rounded-md h-40" />
      </div>
    );
  }

  if (error) {
    return <ErrorScreen handleRetry={refetchKPIs} height="h-80" />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Items</CardTitle>
          <Warehouse className="h-5 w-5 text-blue-600" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold mb-1">
            {inventoryKPIs?.totals?.total_items || 0}
          </div>
          <p className="text-xs text-blue-600">Across all categories</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Low Stock Alerts</CardTitle>
          <AlertTriangle className="h-5 w-5 text-orange-600" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold  mb-1">
            {inventoryKPIs?.totals?.low_stock_count || 0}
          </div>
          <p className="text-xs text-orange-600">Items need restocking</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Out of Stock</CardTitle>
          <TrendingDown className="h-5 w-5 text-red-600" />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold  mb-1">
            {inventoryKPIs?.totals?.out_of_stock_count || 0}
          </div>
          <p className="text-xs text-red-600">Items unavailable</p>
        </CardContent>
      </Card>
    </div>
  );
}
