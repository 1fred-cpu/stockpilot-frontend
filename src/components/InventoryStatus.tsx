"use client";
import React, { use } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import useStore from "../../utils/zustand";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import ErrorScreen from "./ErrorScreen";

interface Inventory {
  category: string;
  stock: number;
  total: number;
}

export default function InventoryStatus() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();

  async function fetchInventoryStatus() {
    try {
      const response = await axiosInstance.get(
        `/analytics/inventory-status/${store?.storeId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["inventry-status", store?.storeId],
    queryFn: fetchInventoryStatus,
    enabled: !!store?.storeId,
  });

  const inventoryData = data ?? [];

  if (isLoading) {
    return <Skeleton className="h-[380px]" />;
  }

  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Inventory Status by Category</CardTitle>
        <CardDescription>Current stock levels</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex ">
        <div className="space-y-4 flex flex-col flex-1">
          {inventoryData.length ? (
            inventoryData.map((item: Inventory, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {item.category}
                  </span>
                  <span className="text-foreground">
                    {item.stock}/{item.total}
                  </span>
                </div>
                <Progress
                  value={(item.stock / item.total) * 100}
                  className="h-2"
                />
              </div>
            ))
          ) : (
            <div className="lg:flex-1 flex items-center justify-center text-muted-foreground text-sm h-40 lg:p-10">
              No inventory data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
