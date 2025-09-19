"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Plus, Search, Filter, Package, Eye, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { getCurrencySymbol } from "../../utils/currency";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import PageHeader from "./PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { getActiveStore } = useStore();
  const store = getActiveStore();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStatusBadge = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) {
      return <span className="text-destructive font-medium">Out of Stock</span>;
    } else if (stock < lowStockThreshold) {
      return <span className="text-yellow-500 font-medium">Low Stock</span>;
    } else {
      return <span className="text-green-500 font-medium">In Stock</span>;
    }
  };

  async function fetchProducts() {
    try {
      const response = await axiosInstance.get(
        `businesses/stores/${store?.store_id}/products`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  async function fetchCategories() {
    try {
      const response = await axiosInstance.get(
        `businesses/stores/${store?.store_id}/categories`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async function handleDeleteProduct(productId: string) {
    try {
      setLoading(true);
      const response = await axiosInstance.delete(
        `/businesses/${store?.business_id}/products/${productId}`
      );
      if (response.data) {
        queryClient.invalidateQueries({
          queryKey: ["products", store?.store_id],
        });

        toast.success("Product deleted successfully");
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    queryClient.invalidateQueries({ queryKey: ["products", store?.store_id] });
  }

  const { data, error, isLoading } = useQuery({
    queryKey: ["products", store?.store_id],
    queryFn: fetchProducts,
    enabled: !!store?.store_id,
  });

  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories", store?.store_id],
    queryFn: fetchCategories,
    enabled: !!store?.store_id,
  });

  const products = data?.products ?? [];
  const categories = categoriesData ?? [];

  const filteredProducts =
    products.length > 0
      ? products.filter((product: any, index: number) => {
          const matchesSearch =
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_variants?.[index]?.sku
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase());
          const matchesCategory =
            selectedCategory === "all" ||
            product.category_type === selectedCategory;
          return matchesSearch && matchesCategory;
        })
      : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (isLoading || categoriesLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Products"
          subtitle="Manage your product catalog and inventory"
        />
        <Skeleton className="h-18 w-full" />
        <Skeleton className="h-120 w-full" />
      </div>
    );
  }

  if (error || categoriesError) {
    console.log(error || categoriesError);
    return (
      <div className="p-6 space-y-6 ">
        <PageHeader
          title="Products"
          subtitle="Manage your product catalog and inventory"
        />

        <Card className="mt-6">
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <Package className="w-10 h-10 text-destructive mb-2" />
              <p className="text-lg lg:text-xl font-semibold text-destructive text-center">
                Failed to load products
              </p>
              <p className="text-muted-foreground text-sm lg:text-base text-center mb-2">
                There was a problem loading your product catalog. Please check
                your connection and try again.
              </p>
              <Button
                variant="default"
                className="font-medium bg-red-500 hover:bg-red-600 text-white"
                onClick={handleRetry}
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 ">
      {/* Page Header */}
      <div className="flex md:justify-between md:items-center flex-col md:flex-row gap-6 md:gap-0">
        <PageHeader
          title="Products"
          subtitle="Manage your product catalog and inventory"
        />
        <Link href="/dashboard/products/create" className="w-full md:w-fit">
          <Button variant="default" className="w-full">
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, brand, or SKU"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // reset to first page on new search
                }}
                className="pl-10 shadow-none"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1); // reset to first page on new filter
                }}
              >
                <SelectTrigger className="w-[180px] shadow-none">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {paginatedProducts.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Catalog ({filteredProducts.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>SKU(s)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Variations</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead>Original Price</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Has Discount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedProducts.map((product: any) => {
                  const totalStock = product.product_variants.reduce(
                    (total: number, v: any) =>
                      total + (v.inventory.quantity ?? 0),
                    0
                  );

                  const minOriginalPrice = Math.min(
                    ...product.product_variants.map((v: any) => v.originalPrice)
                  );
                  const maxOriginalPrice = Math.max(
                    ...product.product_variants.map((v: any) => v.originalPrice)
                  );

                  const minFinalPrice = Math.min(
                    ...product.product_variants.map((v: any) => v.finalPrice)
                  );
                  const maxFinalPrice = Math.max(
                    ...product.product_variants.map((v: any) => v.finalPrice)
                  );

                  const lowStockThreshold = Math.min(
                    ...product.product_variants.map(
                      (v: any) => v.inventory.low_stock_quantity ?? Infinity
                    )
                  );

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3 max-w-[14rem]">
                          <ImageWithFallback
                            src={product.thumbnail}
                            alt={product.name}
                            loading="lazy"
                            className="w-14 h-14 rounded-sm object-cover shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-medium truncate">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[8rem]">
                        {product.brand}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[8rem]">
                        {product.product_variants[0]?.sku}
                        {product.product_variants.length > 1 && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            +{product.product_variants.length - 1} more
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="truncate max-w-[8rem]">
                        {product.category_type}
                      </TableCell>
                      <TableCell>{product.product_variants.length}</TableCell>
                      <TableCell>{totalStock}</TableCell>
                      <TableCell className="font-medium">
                        {getCurrencySymbol(store?.currency as string)}
                        {minOriginalPrice === maxOriginalPrice
                          ? minOriginalPrice
                          : `${minOriginalPrice} - ${maxOriginalPrice}`}
                      </TableCell>
                      <TableCell className="font-medium">
                        {getCurrencySymbol(store?.currency as string)}
                        {minFinalPrice === maxFinalPrice
                          ? minFinalPrice
                          : `${minFinalPrice} - ${maxFinalPrice}`}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(totalStock, lowStockThreshold)}
                      </TableCell>
                      <TableCell>
                        {product.hasDiscount ? "Yes" : "No"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Button variant="ghost" size="icon" title="View">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <AlertDialog open={open} onOpenChange={setOpen}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete this product?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete your product and
                                  all its variants.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={loading}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      <ClipLoader size={16} color="white" />
                                    ) : (
                                      "Delete"
                                    )}
                                  </Button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Catalog (0 items)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Package className="w-10 h-10 text-gray-700 dark:text-gray-300 mb-2" />
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-200">
                No products found
              </p>
              <p className="text-muted-foreground text-base text-center">
                Try adjusting your search or filters, or add a new product to
                get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
