// components/CreateSalePage.tsx
"use client";

import { ShoppingCart, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  Accordion,
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
import React, { useState } from "react";
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
import PageHeader from "./PageHeader";
import { getCurrencySymbol } from "../../utils/currency";

export default function CreateSalePage() {
  // cart quantities keyed by variant id
  const [saleData, setSaleData] = useState<Record<string, number>>({});

  // idempotency key: created once per "intent". We generate once on mount.
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => uuidv4());

  // submitted indicates the last payload was successfully processed.
  // When true (and cart hasn't changed) we will prevent duplicate submits.
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const itemsPerPage = 5;

  // --- Customer Info ---
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState("");

  const { getActiveStore, appStore } = useStore();
  const store = getActiveStore();

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

  // Helper: when the user edits the cart or customer data after a successful submit,
  // this indicates a new intent -> generate a new idempotency key and mark submitted=false
  const ensureNewIntentIfNeeded = () => {
    if (submitted) {
      setSubmitted(false);
      setIdempotencyKey(uuidv4());
    }
  };

  // Called when user changes a variant's quantity
  const handleSaleChange = (variantId: string, value: number) => {
    // if user edits after successful submit, create a new intent/key
    ensureNewIntentIfNeeded();

    setSaleData((prev) => {
      // if value is 0 or empty, remove from map to keep selectedVariants logic clean
      const next = { ...prev };
      if (!value || value <= 0) {
        delete next[variantId];
      } else {
        next[variantId] = value;
      }
      return next;
    });
  };

  // Watchers for customer fields: if edited after submission, create new intent
  const handleCustomerNameChange = (v: string) => {
    ensureNewIntentIfNeeded();
    setCustomerName(v);
  };
  const handleCustomerPhoneChange = (v: string) => {
    ensureNewIntentIfNeeded();
    setCustomerPhone(v);
  };
  const handleCustomerEmailChange = (v: string) => {
    ensureNewIntentIfNeeded();
    setCustomerEmail(v);
  };
  const handlePaymentMethodChange = (v: string) => {
    ensureNewIntentIfNeeded();
    setPaymentMethod(v);
  };

  const handleSubmitSale = async () => {
    // guard: nothing to submit
    const selectedVariants = products
      ?.flatMap((product: any) =>
        product.product_variants.map((v: any) => ({
          ...v,
          productName: product.name,
          sku: v.sku,
        }))
      )
      .filter(
        (v: any) => typeof saleData[v.id] === "number" && saleData[v.id] > 0
      );

    const totalItems = selectedVariants.reduce(
      (acc: number, v: any) => acc + (saleData[v.id] || 0),
      0
    );

    if (totalItems === 0) {
      toast.error("Add at least one item to the cart before submitting.");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!paymentMethod.trim()) {
      toast.error("Payment method is required");
      return;
    }

    // If already successfully submitted and nothing changed, prevent duplicate.
    if (submitted) {
      toast.info("This sale has already been submitted.");
      return;
    }

    setLoading(true);

    // ensure we have an idempotency key (we set one on mount, but be robust)
    const keyToUse = idempotencyKey || uuidv4();
    if (!idempotencyKey) setIdempotencyKey(keyToUse);

    try {
      const payload = {
        store_id: store?.store_id || "",
        business_id: store?.business_id || "",
        created_by: appStore.user?.id || "",
        idempotency_key: keyToUse,
        total_amount: selectedVariants.reduce(
          (acc: number, v: any) => acc + (saleData[v.id] || 0) * v?.finalPrice,
          0
        ),
        payment_method: paymentMethod,
        reference: generateReference("SALE"),
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        items: selectedVariants.map((variant: any) => ({
          variant_id: variant.id,
          quantity: saleData[variant.id] || 0,
          unit_price: variant?.finalPrice,
          discount: variant?.discount?.value || 0,
        })),
      };

      const response = await axiosInstance.post("/sales/create", payload);

      // On success, mark as submitted to prevent accidental duplicate retries.
      if (response?.data?.message) {
        toast.success(response.data?.message || "Sale created successfully");

        // clear cart & customer fields (UI reset)
        setSaleData({});
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setPaymentMethod("");

        // mark as submitted (prevents duplicate submits of same payload/key)
        setSubmitted(true);

        // Do NOT auto-generate a new idempotency key here.
        // A new key will be generated only when user edits the cart or clicks Reset.
        // If you regenerate here, a quickly-clicked Submit may create a new sale.
        // setIdempotencyKey(uuidv4()); <-- intentionally omitted

        await refetch();
      }
    } catch (err: any) {
      // Let user retry with same idempotency key (backend should dedupe)
      toast.error(
        err?.response?.data?.message || err.message || "Submit failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset EVERYTHING (new sale session)
  const handleReset = () => {
    setSaleData({});
    setCustomerName("");
    setCustomerPhone("");
    setSearchQuery("");
    setCurrentPage(1);
    // New session -> new idempotency key
    setIdempotencyKey(uuidv4());
    setSubmitted(false);
  };

  // --- Filtering + Pagination (UI) ---
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
      (v: any) => typeof saleData[v.id] === "number" && saleData[v.id] > 0
    );

  const totalItems = selectedVariants.reduce(
    (acc: number, v: any) => acc + (saleData[v.id] || 0),
    0
  );
  const totalCost = selectedVariants.reduce(
    (acc: number, v: any) => acc + (saleData[v.id] || 0) * v.finalPrice,
    0
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <PageHeader
          title="Create Sale"
          subtitle="Create a new sale for your store"
        />
        <Skeleton className="h-[380px] p-5" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 space-y-8">
        <PageHeader
          title="Create Sale"
          subtitle="Create a new sale for your store"
        />
        <ErrorScreen handleRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Create Sale"
        subtitle="Create a new sale for your store"
      />
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Left: Products Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Create Sale
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
                          <TableHead>Stock</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product?.product_variants?.map((variant: any) => (
                          <TableRow key={variant.id}>
                            <TableCell>{variant.name}</TableCell>
                            <TableCell>{variant.sku}</TableCell>
                            <TableCell>{variant.inventory?.quantity}</TableCell>
                            <TableCell>
                              {getCurrencySymbol(store?.currency)}
                              {variant.finalPrice?.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Progress
                                value={
                                  (variant.inventory.quantity /
                                    (variant.inventory?.low_stock_quantity ||
                                      1)) *
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
                                value={saleData[variant.id] || ""}
                                onChange={(e) =>
                                  handleSaleChange(
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

            {/* Pagination */}
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

        {/* Right: Cart + Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Sale Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Info */}
            <div className="space-y-2">
              <Input
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => handleCustomerNameChange(e.target.value)}
                disabled={loading}
              />
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="[0-9]*"
                placeholder="Customer Phone (optional)"
                value={customerPhone}
                onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                disabled={loading}
              />
              <Input
                type="email"
                autoComplete="email"
                placeholder="Customer Email (optional)"
                value={customerEmail}
                onChange={(e) => handleCustomerEmailChange(e.target.value)}
                disabled={loading}
              />
              <Input
                type="text"
                placeholder="Payment Method eg. CASH, CARD, MOMO"
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Selected Cart */}
            {selectedVariants.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No items added to cart.
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
                <div className="flex items-center gap-3">
                  <span className="font-semibold">x{saleData[variant.id]}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() =>
                      setSaleData((prev) => {
                        const newData = { ...prev };
                        delete newData[variant.id];
                        // if removing after a successful submit, this is a new intent
                        ensureNewIntentIfNeeded();
                        return newData;
                      })
                    }
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Summary Totals */}
            {selectedVariants.length > 0 && (
              <div className="border-t pt-3 space-y-1 text-sm">
                <p>
                  Total Items: <span className="font-medium">{totalItems}</span>
                </p>
                <p>
                  Total Cost:{" "}
                  <span className="font-medium">
                    {getCurrencySymbol(store?.currency)}
                    {totalCost.toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 justify-end">
              <Button
                onClick={handleReset}
                variant="secondary"
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                onClick={handleSubmitSale}
                disabled={loading || totalItems === 0 || submitted}
                title={
                  submitted
                    ? "Sale already submitted for this cart"
                    : loading
                    ? "Submitting..."
                    : totalItems === 0
                    ? "Add items to cart"
                    : "Submit Sale"
                }
              >
                {loading ? (
                  <ClipLoader color="#ffffff" size={18} />
                ) : submitted ? (
                  "Submitted"
                ) : (
                  "Submit Sale"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
