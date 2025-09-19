"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axiosInstance from "../../utils/axiosInstance";
import useStore from "../../utils/zustand";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import ErrorScreen from "./ErrorScreen";
const salesData = [
  { date: "Jan 1", sales: 12000 },
  { date: "Jan 5", sales: 15000 },
  { date: "Jan 10", sales: 18000 },
  { date: "Jan 15", sales: 14000 },
  { date: "Jan 20", sales: 22000 },
  { date: "Jan 25", sales: 19000 },
  { date: "Jan 30", sales: 25000 },
];

export default function SalesTrendLast30DaysChart() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const queryClient = useQueryClient();

  async function fetchSalesTrend30Days() {
    try {
      const response = await axiosInstance.get(
        `/analytics/sales-trend/last-30-days/${store?.store_id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  function handleRetry() {
    queryClient.invalidateQueries({
      queryKey: ["sales-trend", store?.store_id],
    });
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["sales-trend", store?.store_id],
    queryFn: fetchSalesTrend30Days,
    enabled: !!store?.store_id,
  });

  if (isLoading) {
    return <Skeleton className="h-[380px] p-5" />;
  }

  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend (Last 30 Days)</CardTitle>
        <CardDescription>Daily sales performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.result ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#510cf3"
                strokeWidth={2}
                dot={{ fill: "#2563EB" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
