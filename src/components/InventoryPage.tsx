"use client";

import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { AlertTriangle, Package, TrendingDown, Warehouse } from "lucide-react";
import { useState } from "react";
import PageHeader from "./PageHeader";

import InventoryKPI from "./InventoryKPI";
import InventoryDistribution from "./InventoryDistribution";
import StockLevelsByCategory from "./StockLevelsByCategory";

// -----------------------------
// Mock Data
// -----------------------------

const lowStockProducts = [
  {
    id: "p1",
    name: "Wireless Charger",
    category: "Electronics",
    variants: [
      { id: "v1", sku: "WC-001", name: "Black", current: 5, minimum: 20 },
      { id: "v2", sku: "WC-002", name: "White", current: 12, minimum: 20 },
    ],
  },
  {
    id: "p2",
    name: "Phone Case",
    category: "Accessories",
    variants: [
      { id: "v3", sku: "WC-003", name: "Navy Blue", current: 8, minimum: 30 },
      { id: "v4", sku: "WC-004", name: "Red", current: 2, minimum: 30 },
    ],
  },
  {
    id: "p3",
    name: "IPhone 12 pro",
    category: "Electronics",
    variants: [
      { id: "v5", sku: "WC-005", name: "Navy Blue", current: 8, minimum: 30 },
      { id: "v6", sku: "WC-006", name: "Red", current: 2, minimum: 30 },
    ],
  },
  {
    id: "p4",
    name: "Macbook Air",
    category: "Electronics",
    variants: [
      { id: "v7", sku: "WC-007", name: "Navy Blue", current: 8, minimum: 30 },
      { id: "v8", sku: "WC-008", name: "Red", current: 2, minimum: 30 },
    ],
  },
];

// -----------------------------
// Dashboard Component
// -----------------------------

export default function InventoryDashboard() {
  const [restockData, setRestockData] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 2;

  const handleRestockChange = (variantId: string, value: number) => {
    setRestockData((prev) => ({
      ...prev,
      [variantId]: value,
    }));
  };

  const handleSubmitRestock = () => {
    console.log("Restock data:", restockData);
    // TODO: integrate with Supabase update
  };

  const handleReset = () => {
    setRestockData({});
  };

  // --- Filtering + Pagination ---
  const filteredProducts = lowStockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const selectedVariants = lowStockProducts
    .flatMap((product) =>
      product.variants.map((v) => ({
        ...v,
        productName: product.name,
        sku: v.sku,
      }))
    )
    .filter((v) => restockData[v.id] && restockData[v.id] > 0);

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Inventory Dashboard"
        subtitle="Manage your inventory effectively"
      />
      {/** KPI Cards */}
      <InventoryKPI />

      {/** Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryDistribution />
        <StockLevelsByCategory />
      </div>

      {/* Low Stock & Restock Section */}
      <div className=" flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Left: Table with Accordion */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Low Stock & Restock Management
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
              {paginatedProducts.map((product) => (
                <AccordionItem key={product.id} value={product.id}>
                  <AccordionTrigger className="cursor-pointer">
                    <div className="flex justify-between w-full text-left">
                      <div className="flex items-center gap-3">
                        <Image
                          src="/images/lucas-gallone-4X_tgtRA4XM-unsplash.jpg"
                          alt="Product Image"
                          width={60}
                          height={60}
                          className="w-14 h-14 rounded-md object-cover"
                          loading="lazy"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {product.category}
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
                        {product.variants.map((variant) => (
                          <TableRow key={variant.id}>
                            <TableCell>{variant.name}</TableCell>
                            <TableCell>{variant.sku}</TableCell>
                            <TableCell>{variant.current}</TableCell>
                            <TableCell>{variant.minimum}</TableCell>
                            <TableCell>
                              <Progress
                                value={
                                  (variant.current / variant.minimum) * 100
                                }
                                className="w-28"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
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
            {selectedVariants.map((variant) => (
              <div
                key={variant.id}
                className="p-3 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{variant.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {variant.name} • {variant.sku}
                  </p>
                </div>
                <span className="font-semibold">
                  +{restockData[variant.id]}
                </span>
              </div>
            ))}

            {selectedVariants.length > 0 && (
              <div className="flex gap-2.5 justify-end">
                <Button onClick={handleReset} variant={`secondary`}>
                  Reset
                </Button>
                <Button onClick={handleSubmitRestock}>Submit Restock</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
