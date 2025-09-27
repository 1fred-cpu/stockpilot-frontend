// components/CreateSalePage.tsx
"use client";

import { ShoppingCart, X, Mail, Printer, MessageSquare } from "lucide-react";
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
import PageHeader from "./PageHeader";
import { getCurrencySymbol } from "../../utils/currency";
import Spinner from "./Spinner";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export default function CreateSalePage() {
  // cart quantities keyed by variant id
  const [saleData, setSaleData] = useState<Record<string, number>>({});
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => uuidv4());
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

  // --- Receipt Options ---
  const [generateReceipt, setGenerateReceipt] = useState(false);
  const [receiptChannel, setReceiptChannel] = useState<
    "email" | "whatsapp" | "printer" | ""
  >("");

  const { getActiveStore, appStore } = useStore();
  const store = getActiveStore();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [`store-products`, store?.storeId],
    queryFn: fetchProductWithVariants,
    enabled: !!store?.storeId,
    refetchOnWindowFocus: false,
  });

  async function fetchProductWithVariants() {
    try {
      const response = await axiosInstance.get(
        `/businesses/stores/${store?.storeId}/products`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  const products = data?.products || [];

  const ensureNewIntentIfNeeded = () => {
    if (submitted) {
      setSubmitted(false);
      setIdempotencyKey(uuidv4());
    }
  };

  const handleSaleChange = (variantId: string, value: number) => {
    ensureNewIntentIfNeeded();
    setSaleData((prev) => {
      const next = { ...prev };
      if (!value || value <= 0) {
        delete next[variantId];
      } else {
        next[variantId] = value;
      }
      return next;
    });
  };

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
    const selectedVariants = products
      ?.flatMap((product: any) =>
        product.productVariants.map((v: any) => ({
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

    // Receipt validation
    if (generateReceipt) {
      if (receiptChannel === "email" && !customerEmail.trim()) {
        toast.error("Customer email is required to send receipt by email.");
        return;
      }
      if (receiptChannel === "whatsapp" && !customerPhone.trim()) {
        toast.error("Customer phone is required to send receipt by WhatsApp.");
        return;
      }
      if (!receiptChannel) {
        toast.error("Please select a receipt channel.");
        return;
      }
    }

    if (submitted) {
      toast.info("This sale has already been submitted.");
      return;
    }

    const toastId = toast.loading("Creating a sale");
    setLoading(true);

    const keyToUse = idempotencyKey || uuidv4();
    if (!idempotencyKey) setIdempotencyKey(keyToUse);

    try {
      const payload = {
        storeId: store?.storeId || "",
        businessId: store?.businessId || "",
        createdBy: appStore.user?.id || "",
        idempotencyKey: keyToUse,
        totalAmount: selectedVariants.reduce(
          (acc: number, v: any) => acc + (saleData[v.id] || 0) * v?.finalPrice,
          0
        ),
        paymentMethod,
        reference: generateReference("SALE"),
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
        },
        items: selectedVariants.map((variant: any) => ({
          variantId: variant.id,
          quantity: saleData[variant.id] || 0,
          unitPrice: variant?.finalPrice,
          discount: variant?.discount?.value || 0,
        })),
        isRecieptNeeded: generateReceipt,
        deliveryChannel: receiptChannel,
      };

      const response = await axiosInstance.post("/sales/create", payload);

      if (response?.data?.message) {
        toast.success(response.data?.message || "Sale created successfully", {
          id: toastId,
        });

        setSaleData({});
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setPaymentMethod("");
        setGenerateReceipt(false);
        setReceiptChannel("");
        setSubmitted(true);

        await refetch();
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err.message || "Submit failed",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSaleData({});
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setPaymentMethod("");
    setSearchQuery("");
    setCurrentPage(1);
    setIdempotencyKey(uuidv4());
    setSubmitted(false);
    setGenerateReceipt(false);
    setReceiptChannel("");
  };

  const filteredProducts = products?.filter(
    (p: any) =>
      p?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p?.categoryType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts?.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const selectedVariants = products
    ?.flatMap((product: any) =>
      product.productVariants.map((v: any) => ({
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
        {/* Left: Products */}
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
                        {product?.categoryType}
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
                        {product?.productVariants?.map((variant: any) => (
                          <TableRow key={variant.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={variant?.imageUrl || "/placeholder.png"}
                                  alt="Variant Image"
                                  width={600}
                                  height={400}
                                  className="w-14 h-14 rounded-md object-cover"
                                  loading="lazy"
                                />
                                <span className="text-sm truncate">
                                  {variant.name}
                                </span>
                              </div>
                            </TableCell>
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

        {/* Right: Sale Summary */}
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
                placeholder="Payment Method eg. cash, card, momo, etc"
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Selected Cart */}
            {selectedVariants.length === 0 && (
              <p className="text-sm text-muted-foreground py-6">
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

            {/* Receipt Options */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="generate-receipt"
                  className="text-sm font-medium"
                >
                  Generate Receipt
                </Label>
                <Switch
                  id="generate-receipt"
                  checked={generateReceipt}
                  onCheckedChange={setGenerateReceipt}
                  disabled={loading}
                />
              </div>

              {generateReceipt && (
                <RadioGroup
                  className="space-y-2"
                  value={receiptChannel}
                  onValueChange={(val) => setReceiptChannel(val as any)}
                >
                  <div className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="email" id="email" />
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-blue-500" /> Email
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label
                      htmlFor="whatsapp"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-green-500" />{" "}
                      WhatsApp
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted cursor-pointer">
                    <RadioGroupItem value="printer" id="printer" />
                    <Label
                      htmlFor="printer"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-gray-500" /> Printer
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleSubmitSale}
                disabled={
                  loading ||
                  totalItems === 0 ||
                  submitted ||
                  (generateReceipt && !receiptChannel)
                }
              >
                {loading ? (
                  <>
                    <Spinner />
                    Submitting
                  </>
                ) : (
                  "Submit Sale"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
