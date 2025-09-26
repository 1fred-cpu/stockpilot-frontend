"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axiosInstance from "../../utils/axiosInstance";
import useStore from "../../utils/zustand";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";

export default function StockLevelsByCategory() {
  const { getActiveStore, reloadState } = useStore();
  const store = getActiveStore();
  const {
    data: stockData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["stock-level", store?.storeId, reloadState],
    queryFn: fetchStockLevelsByCategory,
    enabled: !!store?.storeId,
    refetchOnWindowFocus: false,
  });

  async function fetchStockLevelsByCategory() {
    try {
      const response = await axiosInstance.get(
        `/analytics/stock-level/${store?.storeId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  if (isLoading) {
    return <Skeleton className="h-[380px] p-5" />;
  }
  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Levels by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="inStock"
                stackId="a"
                fill="#10B981"
                name="In Stock"
              />
              <Bar
                dataKey="lowStock"
                stackId="a"
                fill="#F59E0B"
                name="Low Stock"
              />
              <Bar
                dataKey="outOfStock"
                stackId="a"
                fill="#EF4444"
                name="Out of Stock"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
