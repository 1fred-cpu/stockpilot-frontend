"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { getCurrencySymbol } from "../../utils/currency";
import ErrorScreen from "./ErrorScreen";

type Product = {
  name: string | null;
  sales: number | null;
  revenue: number | null;
};
// const topProducts = [
//   { name: "Wireless Headphones", sales: 1245, revenue: "$124,500" },
//   { name: "Smart Watch", sales: 987, revenue: "$98,700" },
//   { name: "Laptop Stand", sales: 756, revenue: "$37,800" },
//   { name: "USB-C Cable", sales: 654, revenue: "$13,080" },
//   { name: "Mouse Pad", sales: 543, revenue: "$10,860" },
// ];

export default function TopSellingProducts() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const queryClient = useQueryClient();
  async function fetchTopSellingProducts() {
    try {
      const response = await axiosInstance.get(
        `/analytics/top-selling-products/${store?.store_id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  function handleRetry() {
    queryClient.invalidateQueries({
      queryKey: ["top-selling-products", store?.store_id],
    });
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["top-selling-products", store?.store_id],
    queryFn: fetchTopSellingProducts,
    enabled: !!store?.store_id,
  });

  const topProducts = data ?? [];

  if (isLoading) {
    return <Skeleton className="h-[380px]" />;
  }

  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performing items this month</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1">
        <div className="space-y-4 flex flex-col flex-1">
          {topProducts.length ? (
            topProducts.map((product: Product, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.sales} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {getCurrencySymbol(store?.currency as string)}
                    {product.revenue}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="lg:flex-1 flex items-center justify-center text-muted-foreground text-sm h-40">
              No top selling products data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
