"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";

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
          <div className="text-2xl font-bold text-foreground">$87,456</div>
          <p className="text-xs dark:text-green-300 text-green-600 flex items-center mt-1.5">
            <TrendingUp className="w-4 h-4 mr-1" />
            +15.3% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Total Orders</CardTitle>
          <ShoppingCart className="h-5 w-5 dark:text-blue-300 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">1,247</div>
          <p className="text-xs dark:text-blue-300 text-blue-600">
            +89 orders this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Average Order Value</CardTitle>
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-300" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">$70.15</div>
          <p className="text-xs text-purple-600 dark:text-purple-300">
            +5.2% from last week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
