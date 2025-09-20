"use client";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Accordion } from "@radix-ui/react-accordion";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { useState } from "react";
import Image from "next/image";
import useStore from "../../utils/zustand";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";
import { v4 as uuidv4 } from "uuid";
import { generateReference } from "../../utils/generate-reference";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";

export default function RestockedManagement() {
  const [restockData, setRestockData] = useState<Record<string, number>>({});
  const [idempotencyKey, setIdempotencyKey] = useState<string>(uuidv4());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { getActiveStore, appStore } = useStore();
  const store = getActiveStore();
  const [loading, setLoading] = useState<boolean>(false);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [`store-products`, store?.store_id],
    queryFn: fetchProductWithVariants,
    enabled: !!store?.store_id,
    refetchOnWindowFocus: false,
  });

  async function fetchProductWithVariants() {
    try {
      const response = await axiosInstance.get(
        `/businesses/stores/${store?.store_id}/products`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  const products = data?.products || [];
  const handleRestockChange = (variantId: string, value: number) => {
    setRestockData((prev) => ({
      ...prev,
      [variantId]: value,
    }));
  };

  const handleSubmitRestock = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/inventory/restock", {
        store_id: store?.store_id || "",
        business_id: store?.business_id || "",
        restocked_by: appStore.user?.id || "",
        idempotency_key: idempotencyKey,
        reference: generateReference("RSTK"),
        variants: selectedVariants?.map((variant: any) => ({
          variant_id: variant.id,
          quantity: restockData[variant.id] || 0,
        })),
      });
      if (response.data.results) {
        toast.success(response.data?.message);
        setRestockData({});
        setIdempotencyKey(uuidv4());
        refetch();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRestockData({});
  };

  // --- Filtering + Pagination ---
  const filteredProducts = products?.filter(
    (p: any) =>
      p?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p?.category_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const selectedVariants = products
    ?.flatMap((product: any) =>
      product.product_variants.map((v: any) => ({
        ...v,
        productName: product.name,
        sku: v.sku,
      }))
    )
    .filter(
      (v: any) => typeof restockData[v.id] === "number" && restockData[v.id] > 0
    );

  if (isLoading) {
    return <Skeleton className="h-[380px] p-5" />;
  }
  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }
  return (
    <div className=" flex flex-col lg:grid lg:grid-cols-3 gap-6">
      {/* Left: Table with Accordion */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Restock Management
          </CardTitle>
          <div className="flex items-center gap-3 mt-3">
            <Input
              type="text"
              placeholder="Search product or category..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {paginatedProducts.map((product: any) => (
              <AccordionItem key={product?.id} value={product?.id}>
                <AccordionTrigger className="cursor-pointer">
                  <div className="flex justify-between w-full text-left">
                    <div className="flex items-center gap-3">
                      <Image
                        src={product?.thumbnail || "/placeholder.png"}
                        alt="Product Image"
                        width={600}
                        height={400}
                        className="w-14 h-14 rounded-md object-cover"
                        loading="lazy"
                      />
                      <span className="font-medium">{product?.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product?.category_type}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variant</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Current</TableHead>
                        <TableHead>Minimum</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Restock Qty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product?.product_variants?.map((variant: any) => (
                        <TableRow key={variant.id}>
                          <TableCell>{variant.name}</TableCell>
                          <TableCell>{variant.sku}</TableCell>
                          <TableCell>{variant.inventory?.quantity}</TableCell>
                          <TableCell>
                            {variant.inventory?.low_stock_quantity}
                          </TableCell>
                          <TableCell>
                            <Progress
                              value={
                                (variant.inventory.quantity /
                                  variant.inventory?.low_stock_quantity) *
                                100
                              }
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              disabled={loading}
                              min={0}
                              placeholder="0"
                              className="w-24"
                              value={restockData[variant.id] || ""}
                              onChange={(e) =>
                                handleRestockChange(
                                  variant.id,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right: Selected Restock List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Selected Restocks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 ">
          {selectedVariants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No items selected for restock.
            </p>
          )}
          {selectedVariants.map((variant: any) => (
            <div
              key={variant?.id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{variant?.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {variant.name} • {variant.sku}
                </p>
              </div>
              <span className="font-semibold">+{restockData[variant.id]}</span>
            </div>
          ))}

          {selectedVariants.length > 0 && (
            <div className="flex gap-2.5 justify-end">
              <Button
                onClick={handleReset}
                variant={`secondary`}
                disabled={loading}
              >
                Reset
              </Button>
              <Button onClick={handleSubmitRestock} disabled={loading}>
                {loading ? <ClipLoader color="#ffffff" size={18} /> : ""}
                Submit Restock
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
