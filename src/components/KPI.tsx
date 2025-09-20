"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  AlertTriangle,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import useStore from "../../utils/zustand";
import { Skeleton } from "./ui/skeleton";
import { getCurrencySymbol } from "../../utils/currency";
import ErrorScreen from "./ErrorScreen";
export default function KPI() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const queryClient = useQueryClient();

  async function fetchKPIData() {
    try {
      const response = await axiosInstance(`/analytics/kpi/${store?.store_id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["kpiData", store?.store_id],
    queryFn: fetchKPIData,
    enabled: !!store?.store_id, // Only run the query if storeId is available
  });

  if (isLoading) {
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
    return <ErrorScreen handleRetry={refetch} height="h-80" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Sales</CardTitle>
          <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1 dark:text-gray-300">
            {data?.sales.currentMonth > 0
              ? getCurrencySymbol(store?.currency as string)
              : null}
            {data?.sales.currentMonth}
          </div>
          {data?.sales.percentageChange > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {data?.sales.percentageChange > 0 ? "+" : ""}
              {data?.sales.percentageChange}% from last month
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Products</CardTitle>
          <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-300">
            {data?.products.total}
          </div>
          {data?.products.percentageChange > 0 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
              {data?.products.percentageChange > 0 ? "+" : ""}
              {data?.products.percentageChange}% from last month
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Stock Alerts</CardTitle>
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-300">
            {data?.products.lowStock}
          </div>
          {data?.products.lowStock > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {data?.products.lowStock} Items running low
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>New Customers</CardTitle>
          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-300">
            {data?.customers.new}
          </div>
          {data?.customers.percentageChange > 0 && (
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {data?.customers.percentageChange > 0 ? "+" : ""}
              {data?.customers.percentageChange}% from last month
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
