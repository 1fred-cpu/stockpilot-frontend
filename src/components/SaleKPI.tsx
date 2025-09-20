"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";
import { getCurrencySymbol } from "../../utils/currency";
export default function SaleKPI() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["sale-kpi", store?.store_id],
    queryFn: fetchSalesKPIAnalytics,
    enabled: !!store?.store_id,
    refetchOnWindowFocus: false,
  });

  async function fetchSalesKPIAnalytics() {
    try {
      const response = await axiosInstance.get(
        `/analytics/sale-kpi/${store?.store_id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className=" rounded-md h-40" />
        <Skeleton className=" rounded-md h-40" />
        <Skeleton className=" rounded-md h-40" />
      </div>
    );
  }

  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Revenue</CardTitle>
          <DollarSign className="h-5 w-5 dark:text-green-300 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {getCurrencySymbol(store?.currency as string)}
            {data?.revenue?.total}
          </div>
          <p className="text-xs dark:text-green-300 text-green-600 flex items-center mt-1.5 gap-1">
            {data?.revenue?.change !== undefined && (
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  data.revenue.change > 0
                    ? "text-green-600 dark:text-green-300"
                    : data.revenue.change < 0
                    ? "rotate-180 text-red-600 dark:text-red-300"
                    : "text-gray-400"
                }`}
              />
            )}
            {data?.revenue?.change !== undefined && (
              <>
                {data.revenue.change > 0 ? "+" : ""}
                {data.revenue.change}
              </>
            )}{" "}
            from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Sales</CardTitle>
          <ShoppingCart className="h-5 w-5 dark:text-blue-300 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            {data?.sales?.total}
          </div>
          <p className="text-xs dark:text-blue-300 text-blue-600 flex items-center mt-1.5">
            {data?.sales?.change !== undefined && (
              <>
                {data.sales.change > 0 ? "+" : ""}
                {data.sales.change}
              </>
            )}{" "}
            sales this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Average sale Value</CardTitle>
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            {getCurrencySymbol(store?.currency as string)}
            {data?.averageSaleValue?.value}
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-300 mt-1.5 flex items-center gap-1">
            {data?.averageSaleValue?.change !== undefined && (
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  data.averageSaleValue.change > 0
                    ? "text-green-600 dark:text-green-300"
                    : data.averageSaleValue.change < 0
                    ? "rotate-180 text-red-600 dark:text-red-300"
                    : "text-gray-400"
                }`}
              />
            )}
            {data?.averageSaleValue?.change !== undefined && (
              <>
                {data.averageSaleValue.change > 0 ? "+" : ""}
                {data.averageSaleValue.change}
              </>
            )}{" "}
            from last week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
