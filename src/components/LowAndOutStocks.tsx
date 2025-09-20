"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";
import Image from "next/image";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getStatusColor } from "./RecentTransactions";

interface LowStockItem {
  variant_id: string;
  product_name: string;
  variant_name: string;
  sku: string;
  stock: number;
  status: "Low Stock" | "Out of Stock";
}

export default function LowAndOutOfStockTable() {
  const [loading, setLoading] = useState(true);
  //   const [items, setItems] = useState<LowStockItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const { data, isLoading, refetch, error } = useQuery({
    queryKey: ["low-and-out-stocks", store?.store_id],
    queryFn: fetchLowAndOutOfStockItems,
    enabled: !!store?.store_id,
    refetchOnWindowFocus: false,
  });

  const items = data?.items || [];

  async function fetchLowAndOutOfStockItems() {
    try {
      const response = await axiosInstance.get(
        `/inventory/low-and-out-stocks/${store?.store_id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(items?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items?.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (isLoading) {
    return <Skeleton className="h-[380px] p-5" />;
  }
  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Low & Out Stocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items?.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems?.map((item: any) => (
                  <TableRow key={item.variant_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3 max-w-[14rem]">
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          width={600}
                          height={400}
                          loading="lazy"
                          className="w-14 h-14 rounded-md object-cover shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-medium truncate">
                            {item.product_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.variant_name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-center">{item.stock}</TableCell>
                    <TableCell className="text-center">
                      <p className={`${getStatusColor(item.status)} text-sm`}>
                        {item.status}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mb-2 text-orange-400" />
            <p className="font-semibold text-lg">
              No low or out of stock items
            </p>
            <p className="text-sm">
              All your products are sufficiently stocked.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
