"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "next-themes";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function TrendingSales() {
  const [viewMode, setViewMode] = useState("daily");
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const themeConfig = useTheme();
  const strokeColor =
    themeConfig.theme === "system"
      ? "oklch(0.708 0 0)"
      : themeConfig.theme === "light"
      ? "oklch(0.556 0 0)"
      : "oklch(0.708 0 0)";

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["sale-weekly-trend", store?.store_id],
    queryFn: fetchTrendingSales,
    enabled: !!store?.store_id,
    refetchOnWindowFocus: false,
  });

  const salesTrendData = data || [];

  async function fetchTrendingSales() {
    try {
      const response = await axiosInstance.get(
        `/analytics/sale-weekly-trend/${store?.store_id}`
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
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Sales Trends</CardTitle>
        <Select
          value={viewMode}
          onValueChange={(val) => setViewMode(val as any)}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} />
              <XAxis dataKey="date" stroke={strokeColor} />
              <YAxis stroke={strokeColor} />
              <Tooltip
                formatter={(value) => [
                  `$${value}`,
                  viewMode.charAt(0).toUpperCase() + viewMode.slice(1),
                ]}
              />
              <Line
                type="monotone"
                dataKey={viewMode}
                stroke="#6122f4"
                strokeWidth={3}
                dot={{ fill: "#2563EB", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
