"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import axiosInstance from "../../utils/axiosInstance";
import useStore from "../../utils/zustand";
import Image from "next/image";
import { getCurrencySymbol } from "../../utils/currency";
import Spinner from "./Spinner";
import { tree } from "next/dist/build/templates/app-page";
import { Skeleton } from "./ui/skeleton";

// Types
interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  productVariants: ProductVariant[];
}

interface SaleItem {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  purchasedAt: string;
  productVariant: {
    id: string;
    name: string;
    image_url: string;
  };
}

interface ReturnPolicy {
  daysAllowed: number;
  allowRefund: boolean;
  allowExchange: boolean;
  allowStoreCredit: boolean;
  requireReceipt: boolean;
  restockingFee: number;
  maxItemsPerReturn: number;
}

export default function CreateReturnPage() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [policy, setPolicy] = useState<ReturnPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saleLoading, setSaleLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const { getActiveStore, appStore } = useStore();
  const store = getActiveStore();

  const [formItems, setFormItems] = useState<any[]>([]);
  const [saleCode, setSaleCode] = useState("");
  const debounceSaleCode = useDebounce(saleCode, 800);

  useEffect(() => {
    init();
    if (!debounceSaleCode) return;
    fetchSale();
  }, [debounceSaleCode]);

  const init = async () => {
    try {
      await fetchReturnPolicy();
      await fetchProducts();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchSale = async () => {
    try {
      setSaleLoading(true);
      const res = await axiosInstance.get(`/sales/${debounceSaleCode}`);
      setSaleItems(res.data?.saleItems || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setSaleLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get(
        `/businesses/stores/${store?.storeId}/products`
      );
      setProducts(res.data?.products || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchReturnPolicy = async () => {
    try {
      const res = await axiosInstance.get(`/returns/policy/${store?.storeId}`);
      const policy = res.data?.policy;
      setPolicy({
        daysAllowed: policy?.days_allowed,
        allowRefund: policy?.allow_refund,
        allowExchange: policy?.allow_exchange,
        allowStoreCredit: policy?.allow_store_credit,
        requireReceipt: policy?.require_receipt,
        restockingFee: policy?.restocking_fee,
        maxItemsPerReturn: policy?.max_items_per_return,
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addReturnItem = (saleItem: SaleItem) => {
    if (!policy) return;
    if (formItems.length >= policy.maxItemsPerReturn) {
      toast.error(`Max ${policy.maxItemsPerReturn} items can be returned.`);
      return;
    }
    setFormItems((prev) => [
      ...prev,
      {
        saleItemId: saleItem.id,
        reason: "",
        resolution: "",
        quantity: 1,
        exchanges: [],
      },
    ]);
  };

  const removeReturnItem = (saleItemId: string) => {
    setFormItems((prev) =>
      prev.filter((item) => item.saleItemId !== saleItemId)
    );
  };

  const handleResolutionChange = (index: number, resolution: string) => {
    if (!policy) return;
    if (resolution === "REFUND" && !policy.allowRefund) {
      toast.error("Refunds are not allowed by policy.");
      return;
    }
    if (resolution === "EXCHANGE" && !policy.allowExchange) {
      toast.error("Exchanges are not allowed by policy.");
      return;
    }
    if (resolution === "STORE_CREDIT" && !policy.allowStoreCredit) {
      toast.error("Store credits are not allowed by policy.");
      return;
    }
    setFormItems((items) =>
      items.map((it, i) => (i === index ? { ...it, resolution } : it))
    );
  };

  const handleExchangeSelection = (
    index: number,
    variant: ProductVariant,
    exchangeQty: number
  ) => {
    setFormItems((items) =>
      items.map((it, i) =>
        i === index
          ? {
              ...it,
              exchanges: [
                { newProductVariantId: variant.id, quantity: exchangeQty },
              ],
            }
          : it
      )
    );
  };

  const saveReturn = async () => {
    if (!policy) return;
    const toastId = toast.loading("Creating return ");
    try {
      formItems.forEach((item) => {
        if (!item.reason || !item.resolution) {
          throw new Error("Resolution and reason fields are required");
        }
      });
      const payload = {
        storeId: store?.storeId,
        saleCode,
        staffId: appStore.user?.id,
        items: formItems.map((item) => ({
          saleItemId: item.saleItemId,
          reason: item.reason,
          exchanges: item.exchanges,
          quantity: item.quantity,
          resolution: item.resolution,
        })),
      };
      const res = await axiosInstance.post(`/returns/create`, payload);
      if (res.data) {
        setFormItems([]);
      }
      toast.success("Return created successfully", {
        id: toastId,
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message, {
        id: toastId,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <Card className="w-full max-w-6xl mx-auto ">
          <CardContent>
            <Skeleton className="w-30 h-6" />
            <Skeleton className="w-80 h-6 mt-2.5" />
            <Skeleton className="w-full h-8 mt-6.5" />
            <Skeleton className="w-30 h-8 mt-8.5" />
            <Skeleton className="w-full h-8 mt-6.5" />
            <div className="w-full flex justify-end mt-8.5">
              <Skeleton className="w-35 h-8 " />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Create Return</CardTitle>
          <p className="text-sm text-muted-foreground">
            Process customer returns according to your store’s return policy.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {policy && (
            <div className="p-3 border rounded-md bg-muted/40 text-sm">
              <strong>Policy Reminder:</strong> Return within{" "}
              {policy.daysAllowed} days, max {policy.maxItemsPerReturn} items.
            </div>
          )}

          {/* Sale ID input */}
          <div className="grid gap-2.5">
            <Label>Sale Code</Label>
            <Input
              placeholder="Enter sale code"
              value={saleCode}
              onChange={(e) => setSaleCode(e.target.value)}
            />
          </div>

          {saleLoading ? (
            <div className="w-full flex justify-center items-center py-4">
              <Spinner color="purple" />
            </div>
          ) : (
            <div>
              {/* <h3 className="font-medium mb-2 text-sm">Sale Items</h3> */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {saleItems.map((item: any) => {
                  const isAdded = formItems.some(
                    (fi) => fi.saleItemId === item.id
                  );
                  return (
                    <Card
                      key={item.id}
                      className={`p-3 flex flex-col justify-between relative shadow  ${
                        isAdded ? "border-primary" : ""
                      }`}
                    >
                      {isAdded && (
                        <span className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                      <div className="flex flex-col gap-2">
                        <Image
                          src={item?.productVariant?.image_url}
                          alt={item?.productVariant?.name}
                          loading="lazy"
                          className="w-full h-45 object-cover rounded-md"
                          width={600}
                          height={400}
                        />
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium text-sm">
                            {item?.productVariant?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            Quantity:
                          </span>
                          <p className="font-medium text-sm">
                            {item?.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">
                            Unit price:
                          </span>
                          <p className="font-medium text-sm">
                            {getCurrencySymbol(store?.currency)}
                            {item?.unit_price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="mt-1"
                        variant={isAdded ? "secondary" : "outline"}
                        onClick={() => addReturnItem(item)}
                        disabled={
                          isAdded ||
                          formItems.length >= policy!.maxItemsPerReturn
                        }
                      >
                        {isAdded ? "Added for return" : "Return this item"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Return form items */}
          {formItems.length > 0 && (
            <div className="space-y-4 mt-9">
              {formItems.map((item, index) => {
                const sale: any = saleItems.find(
                  (s) => s.id === item.saleItemId
                );
                return (
                  <Card key={index} className="p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <p className="font-medium text-sm">
                        {sale?.productVariant.name}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
                      <div className="flex flex-col gap-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min={1}
                          max={sale?.quantity ?? 1}
                          value={item.quantity}
                          onChange={(e) =>
                            setFormItems((items) =>
                              items.map((it, i) =>
                                i === index
                                  ? { ...it, quantity: Number(e.target.value) }
                                  : it
                              )
                            )
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Reason</Label>
                        <Input
                          placeholder="Enter reason"
                          value={item.reason}
                          onChange={(e) =>
                            setFormItems((items) =>
                              items.map((it, i) =>
                                i === index
                                  ? { ...it, reason: e.target.value }
                                  : it
                              )
                            )
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Resolution</Label>
                        <Select
                          onValueChange={(v) =>
                            handleResolutionChange(index, v)
                          }
                          value={item.resolution}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select resolution" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="refund">Refund</SelectItem>
                            <SelectItem value="exchange">Exchange</SelectItem>
                            <SelectItem value="store_credit">
                              Store Credit
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          onClick={() => removeReturnItem(item.saleItemId)}
                          disabled={saving}
                          className="w-full"
                        >
                          Remove item
                        </Button>
                      </div>
                    </div>

                    {/* Exchange options */}
                    {item.resolution === "EXCHANGE" && (
                      <div className="grid md:grid-cols-3 gap-3 mt-3">
                        <div className="flex flex-col gap-2">
                          <Label>Exchange With</Label>
                          <Select
                            onValueChange={(variantId) => {
                              const productVariant = products
                                .flatMap((p) => p.productVariants)
                                .find((v) => v.id === variantId);
                              if (productVariant) {
                                handleExchangeSelection(
                                  index,
                                  productVariant,
                                  item.quantity
                                );
                              }
                            }}
                            disabled={saving}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product variant" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <div key={product.id}>
                                  <p className="px-2 py-1 text-xs text-muted-foreground">
                                    {product.name}
                                  </p>
                                  {product.productVariants.map(
                                    (variant: any) => (
                                      <SelectItem
                                        key={variant.id}
                                        value={variant.id}
                                        disabled={
                                          variant.name ===
                                            sale.productVariant.name ||
                                          variant.inventory.quantity === 0
                                        }
                                      >
                                        {variant.name} (Stock:{" "}
                                        {variant.inventory.quantity}) —{" "}
                                        {getCurrencySymbol(store?.currency)}
                                        {variant.price.toFixed(2)}
                                      </SelectItem>
                                    )
                                  )}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-2 ">
                          <Label>Exchange Quantity</Label>
                          <Input
                            type="number"
                            disabled={saving}
                            min={1}
                            value={
                              item.exchanges?.[0]?.quantity || item.quantity
                            }
                            onChange={(e) => {
                              const exchangeQty = Number(e.target.value);
                              const variantId =
                                item.exchanges?.[0]?.newProductVariantId;
                              if (variantId) {
                                const productVariant = products
                                  .flatMap((p) => p.productVariants)
                                  .find((v) => v.id === variantId);
                                if (productVariant) {
                                  handleExchangeSelection(
                                    index,
                                    productVariant,
                                    exchangeQty
                                  );
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={saveReturn} disabled={!formItems.length}>
              Submit Return
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
