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
import Image from "next/image";

type Product = {
  name: string;
  sales: number;
  imageUrl: string;
  revenue: number;
};

export default function TopSellingProducts() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  async function fetchTopSellingProducts() {
    try {
      const response = await axiosInstance.get(
        `/analytics/top-selling-products/${store?.storeId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["top-selling-products", store?.storeId],
    queryFn: fetchTopSellingProducts,
    enabled: !!store?.storeId,
    refetchOnWindowFocus: false,
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
                <div className="flex items-center gap-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={600}
                    height={400}
                    className="rounded-md object-cover w-16 h-16"
                    loading="lazy"
                  />
                  <p className="font-medium text-foreground text-sm">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.sales} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {getCurrencySymbol(store?.currency as string)}
                    {product.revenue?.toFixed(2)}
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
