"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import useStore from "../../utils/zustand";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";

const pieData = [
  { name: "In Stock", value: 335, color: "#10B981" },
  { name: "Low Stock", value: 49, color: "#F59E0B" },
  { name: "Out of Stock", value: 11, color: "#EF4444" },
];

type PieData = {
  name: string;
  value: number;
  color: string;
};

export default function InventoryDistribution() {
  const { getActiveStore, reloadState } = useStore();
  const store = getActiveStore();
  const {
    data: pieData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["inventory-distribution", store?.storeId, reloadState],
    queryFn: fetchInventoryDistribution,
    enabled: !!store?.storeId,
    refetchOnWindowFocus: false,
  });

  async function fetchInventoryDistribution() {
    try {
      const response = await axiosInstance.get(
        `/analytics/inventory-distribution/${store?.storeId}`
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
        <CardTitle>Inventory Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData?.map((entry: PieData, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Items"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          {pieData?.map((entry: PieData, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
