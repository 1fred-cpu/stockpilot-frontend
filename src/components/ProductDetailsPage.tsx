"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import PageHeader from "./PageHeader";
import axiosInstance from "../../utils/axiosInstance";
import useStore from "../../utils/zustand";
import ProductDetailsSkeleton from "./ProductDetailsSkeleton";
import { set } from "react-hook-form";
import ProductNotFound from "./ProductNotFound";
import { HelpCircle, Upload } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

/** --------------------------
 * Types
 * ---------------------------*/

type Inventory = {
  quantity: number | string;
  lowQuantityThreshold: number | string;
  reserved: number | string;
};

interface Variant {
  id?: string;
  imageFile: File | null;
  image_url?: string; // dataURL or blob URL for preview
  name: string;
  price: number | string;
  inventory: Inventory;
  sku: string;
}

interface ProductDto {
  id: string;
  name: string;
  brand: string;
  category_type: string;
  description: string;
  thumbnail: string; // can be URL
  tags: string[];
  product_variants: Variant[];
}

/** --------------------------
 * Constants
 * ---------------------------*/
const ONE_MB = 1 * 1024 * 1024;

const initialVariant: Variant = {
  imageFile: null,
  image_url: "",
  name: "",
  price: "",
  inventory: {
    quantity: 0,
    lowQuantityThreshold: 0,
    reserved: 0,
  },
  sku: "",
};

/** --------------------------
 * Component
 * ---------------------------*/
export default function ProductDetailsPage({
  productId,
}: {
  productId: string;
}) {
  const { getActiveStore } = useStore();
  const store = getActiveStore();

  const [product, setProduct] = useState<ProductDto | null>(null);
  const [original, setOriginal] = useState<ProductDto | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [variantsToDelete, setVariantsToDelete] = useState<Variant[]>([]);

  // Local UI state for tags/attributes editors
  const [tagInput, setTagInput] = useState<string>("");
  const [attributeKey, setAttributeKey] = useState<string>("");
  const [attributeValue, setAttributeValue] = useState<string>("");
  const [notFound, setNotFound] = useState<boolean>(false);
  // Error state for form fields and variants
  const [errors, setErrors] = useState<{
    name?: string;
    brand?: string;
    description?: string;
    category_type?: string;
    thumbnail?: string | null;
    product_variants?: Array<{
      name?: string;
      image?: string | null;
      sku?: string;
      price?: string;
      quantity?: string;
      lowQuantityThreshold?: string;
      reserved?: string;
    }>;
  }>({
    name: "",
    brand: "",
    description: "",
    category_type: "",
    thumbnail: null,
    product_variants: [],
  });

  /** ------- Validation: set errors for missing fields ------- */
  const validateAndSetErrors = () => {
    if (!product) return false;
    let valid = true;
    const newErrors: typeof errors = {
      name: "",
      brand: "",
      description: "",
      category_type: "",
      thumbnail: null,
      product_variants: [],
    };

    if (!product.name?.trim()) {
      newErrors.name = "Product name is required";
      valid = false;
    }
    if (!product.brand?.trim()) {
      newErrors.brand = "Brand is required";
      valid = false;
    }
    if (!product.description?.trim()) {
      newErrors.description = "Description is required";
      valid = false;
    }
    if (!product.category_type?.trim()) {
      newErrors.category_type = "Category is required";
      valid = false;
    }
    if (!product.thumbnail && !thumbnailFile && !thumbnailPreview) {
      newErrors.thumbnail = "Thumbnail image file is required";
      valid = false;
    }

    // Validate variants
    if (!product.product_variants || product.product_variants.length === 0) {
      toast.error("At least one variant is required");
      valid = false;
    } else {
      newErrors.product_variants = product.product_variants.map((v) => {
        const vErr: any = {};
        if (!v.name?.trim()) {
          vErr.name = "Name is required";
          valid = false;
        }
        // Only require imageFile if creating a new variant (no id and no image_url)
        if (!v.imageFile && !v.image_url) {
          vErr.image = "Variant image is required";
          valid = false;
        }
        if (!v.sku?.trim()) {
          vErr.sku = "SKU is required";
          valid = false;
        }
        if (!v.price || Number(v.price) <= 0) {
          vErr.price = "Price is required";
          valid = false;
        }
        if (
          !v.inventory ||
          v.inventory.quantity === undefined ||
          v.inventory.quantity === 0 ||
          Number(v.inventory.quantity) < 0
        ) {
          vErr.quantity = "Quantity is required";
          valid = false;
        }
        if (
          v.inventory.lowQuantityThreshold === undefined ||
          v.inventory.lowQuantityThreshold === 0 ||
          Number(v.inventory.lowQuantityThreshold) < 0
        ) {
          vErr.lowQuantityThreshold = "Low quantity threshold is required";
          valid = false;
        }

        if (!v.imageFile && !v.image_url) {
          vErr.image = "Variant image is required";
          valid = false;
        }
        return vErr;
      });
    }

    setErrors(newErrors);
    return valid;
  };

  // track created blob URLs to revoke on unmount
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      if (!store?.store_id || !productId) return; // wait for store
      setLoadingPage(true);
      try {
        const res = await axiosInstance.get(
          `businesses/stores/${store.store_id}/products/${productId}`,
          { signal: controller.signal }
        );
        const data: ProductDto = res.data?.product;

        setProduct({
          ...data,
          product_variants: data?.product_variants?.map((v: any) => {
            return {
              ...v,
              inventory: {
                ...v.inventory,
                lowQuantityThreshold: v.inventory.low_stock_quantity,
              },
            };
          }),
        });
        setOriginal({
          ...data,
          product_variants: data?.product_variants?.map((v: any) => {
            return {
              ...v,
              inventory: {
                ...v.inventory,
                lowQuantityThreshold: v.inventory.low_stock_quantity,
              },
            };
          }),
        });
        setThumbnailPreview(data.thumbnail || "");
      } catch (error: any) {
        if (error?.response?.data?.statusCode === 404) {
          setNotFound(true);
        } else if (error?.response?.data?.statusCode === 500) {
          setNotFound(true);
        } else if (error?.response?.data?.statusCode === 400) {
          setNotFound(true);
        } else if (error?.name !== "CanceledError") {
          toast.error(
            error?.response?.data?.message || "Failed to load product details"
          );
        }
      } finally {
        setLoadingPage(false);
      }
    }

    fetchProduct();

    return () => {
      controller.abort();
      // cleanup blob urls from variant previews
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    };
  }, [store?.store_id, productId]);

  /** ------- Handlers: product fields ------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleThumbnailChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    let file: File | null = null;

    // Case 1: Input change
    if ("target" in e && e.target instanceof HTMLInputElement) {
      file = e.target.files?.[0] || null;
    }

    // Case 2: Drag event
    if ("dataTransfer" in e && e.dataTransfer) {
      file = e.dataTransfer.files?.[0] || null;
    }

    // Validate file
    if (file && file.size > ONE_MB) {
      toast.error("Thumbnail exceeds 1MB");
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
      setThumbnailFile(file);
    }
  };

  /** ------- Handlers: variants ------- */
  const handleVariantChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!product) return;

    const { name, value } = e.target;

    setProduct((prev) => {
      if (!prev) return prev;

      const updated = [...prev.product_variants];
      const variant = { ...updated[idx] };

      // Ensure inventory exists
      const inventory = { ...variant.inventory };

      // Parse numbers for numeric fields
      if (
        name === "quantity" ||
        name === "lowQuantityThreshold" ||
        name === "reserved"
      ) {
        inventory[name] = Number(value);
        updated[idx] = { ...variant, inventory };
      } else if (name === "price") {
        updated[idx] = { ...variant, price: Number(value) };
      } else if (name === "name" || name === "sku") {
        updated[idx] = { ...variant, [name]: value };
      } else {
        updated[idx] = { ...variant };
      }

      return { ...prev, product_variants: updated };
    });
  };

  const handleVariantFileChange = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    if (!product) return;

    e.preventDefault();
    let file: File | null = null;

    // Case 1: Input change
    if ("target" in e && e.target instanceof HTMLInputElement) {
      file = e.target.files?.[0] || null;
    }

    // Case 2: Drag event
    if ("dataTransfer" in e && e.dataTransfer) {
      file = e.dataTransfer.files?.[0] || null;
    }

    // Validate file
    if (file && file.size > ONE_MB) {
      toast.error("Variant image exceeds 1MB");
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setProduct((prev) => {
          if (!prev) return prev;
          const updated = [...prev.product_variants];
          updated[idx] = {
            ...updated[idx],
            imageFile: file,
            image_url: reader.result as string,
          };
          return { ...prev, product_variants: updated };
        });
      reader.readAsDataURL(file);
    }
  };

  const handleAddVariant = () => {
    if (!product) return;
    setProduct({
      ...product,
      product_variants: [...product.product_variants, { ...initialVariant }],
    });
  };

  const handleRemoveVariant = (idx: number) => {
    if (!product) return;

    // Prevent from removing all variant, at least one is required
    if (product.product_variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }

    setProduct({
      ...product,
      product_variants: product.product_variants.filter((_, i) => i !== idx),
    });

    // Add remove variant to variantsToDelete (only if it came from backend)
    const variant = product.product_variants[idx];

    if (variant?.id) {
      const alreadyAdded = variantsToDelete.some((v) => v.id === variant.id);

      if (!alreadyAdded) {
        setVariantsToDelete((prev) => [...prev, variant]);
      }
    }
  };

  /** ------- Handlers: tags & attributes ------- */
  const handleAddTag = () => {
    if (!product) return;
    const t = tagInput.trim();
    if (!t) return;
    setProduct({ ...product, tags: [...product.tags, t] });
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!product) return;
    setProduct({ ...product, tags: product.tags.filter((x) => x !== tag) });
  };

  const handleSubmit = async () => {
    if (!product || !store?.store_id) return;

    if (!validateAndSetErrors()) {
      return;
    }

    setSaving(true);
    const formData = new FormData();

    // base fields
    formData.append("name", product.name);
    formData.append("store_id", store.store_id);
    formData.append("business_id", store.business_id);
    formData.append("brand", product.brand);
    formData.append("category", product.category_type);
    formData.append("description", product.description);

    // thumbnail (optional)
    if (thumbnailFile) {
      formData.append("thumbnail_file", thumbnailFile);
    }

    // arrays/objects
    formData.append("tags", JSON.stringify(product.tags || []));

    // Build variants with imageFileIndex if needed
    const filesToSend: File[] = [];

    const variantsPayload = (product.product_variants || []).map((v) => {
      // compute the file index in the compact files list
      let imageFileIndex: number | null = null;
      if (v.imageFile instanceof File) {
        imageFileIndex = filesToSend.length; // <-- index in compact file list
        filesToSend.push(v.imageFile); // push AFTER computing index
      }

      return {
        id: v.id,
        name: v.name,
        stock: v.inventory.quantity,
        price: v.price,
        inventory: {
          low_stock_quantity: v.inventory.lowQuantityThreshold,
          reserved: v.inventory.reserved,
        },
        sku: v.sku,
        image_url: v.image_url,
        image_file_index: imageFileIndex, // <-- send the compact index
      };
    });

    // metadata first
    formData.append("product_variants", JSON.stringify(variantsPayload));

    // then the actual files, in the same compact order
    filesToSend.forEach((file) => {
      formData.append("variantImages", file);
    });

    formData.append(
      "removed_variant_ids",
      JSON.stringify((variantsToDelete || []).map((v) => v.id))
    );

    try {
      const res = await axiosInstance.patch(
        `/businesses/stores/${store.store_id}/products/${product.id}`,
        formData
      );
      const data = res.data.credentials.product;
      console.log(data);
      toast.success(data.message || "Product updated successfully");
      setProduct({
        ...data,
        tags: data.tags || [],
        product_variants: data?.product_variants?.map((v: any) => ({
          ...v,
          inventory: {
            ...v.inventory,
            lowQuantityThreshold: v.inventory.low_stock_quantity,
          },
        })),
      });
      setOriginal({
        ...data,
        tags: data.tags || [],
        product_variants: data?.product_variants?.map((v: any) => ({
          ...v,
          inventory: {
            ...v.inventory,
            lowQuantityThreshold: v.inventory.low_stock_quantity,
          },
        })),
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (original) {
      setProduct(original);
      setThumbnailPreview(original.thumbnail || "");
      setThumbnailFile(null);
      toast("Changes discarded");
    }
  };

  const handleOnFocusInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleVariantOnFocusInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const { name } = e.target;
    setErrors((prev) => ({
      ...prev,
      product_variants: prev.product_variants
        ? prev.product_variants.map((err, i) =>
            i === idx ? { ...err, [name]: "" } : err
          )
        : [],
    }));
  };

  /** ------- Derived ------- */
  const isDirty = useMemo(() => {
    return (
      JSON.stringify(product) !== JSON.stringify(original) || !!thumbnailFile
    );
  }, [product, original, thumbnailFile]);

  if (notFound) {
    return <ProductNotFound />;
  }
  if (loadingPage || !product) {
    return <ProductDetailsSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Product Details"
        subtitle="Update product information and manage variants."
      />

      <Card>
        <CardContent>
          {/* General Info */}
          <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                onFocus={handleOnFocusInput}
                className={`${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  Product name is required
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                value={product.brand}
                onChange={handleChange}
                onFocus={handleOnFocusInput}
                className={`${errors.brand ? "border-destructive" : ""}`}
              />
              {errors.brand && (
                <p className="text-sm text-destructive">Brand is required</p>
              )}
            </div>
            <div className="flex flex-col gap-2.5 col-span-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category_type"
                value={product.category_type}
                onChange={handleChange}
                onFocus={handleOnFocusInput}
                className={`${
                  errors.category_type ? "border-destructive" : ""
                }`}
              />
              {errors.category_type && (
                <p className="text-sm text-destructive">Category is required</p>
              )}
            </div>
            <div className="flex flex-col gap-2.5 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                className={`${errors.description ? "border-destructive" : ""}`}
                onFocus={() =>
                  setErrors((prev) => ({ ...prev, description: "" }))
                }
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  Description is required
                </p>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <Label>Thumbnail</Label>
              <Tooltip>
                <TooltipTrigger type="button">
                  <HelpCircle size={12} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="bg-background border shadow max-w-80 leading-5 text-foreground">
                  Upload a main image that best represents your product. This
                  will be shown as the primary product image in listings and
                  search results.
                </TooltipContent>
              </Tooltip>
            </div>

            <div
              className={`border-2 border-dashed rounded-md p-2 flex flex-col items-center justify-center cursor-pointer text-center w-full md:w-80 h-70 hover:bg-background/10 transition overflow-hidden ${
                errors.thumbnail ? "border-destructive" : ""
              }`}
              onClick={() =>
                document.getElementById("choose-thumbnail")?.click()
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleThumbnailChange}
            >
              <div className="w-full md:w-75 h-65 overflow-hidden rounded-md relative group">
                {/* Thumbnail Image */}
                <Image
                  src={`${thumbnailPreview}`}
                  alt="Thumbnail preview"
                  width={600}
                  height={400}
                  loading="lazy"
                  className="object-cover w-full h-full rounded-md group-hover:scale-110 transition duration-300"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center rounded-md">
                  <span className="text-white text-sm font-medium ">
                    Change Thumbnail
                  </span>
                </div>
              </div>

              <Input
                id="choose-thumbnail"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailChange}
              />
            </div>
            {errors.thumbnail && (
              <p className="text-sm text-destructive">
                Thumbnail image file is required
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-4.5 mt-8">
            <div className="flex items-center gap-2">
              <Label>Tags</Label>
              <Tooltip>
                <TooltipTrigger type="button">
                  <HelpCircle size={12} className="text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="bg-background border shadow max-w-80 leading-5 text-foreground">
                  Tags help categorize and group products. Use them for search,
                  filtering, or promotions (e.g., summer, bestseller,
                  eco-friendly).
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
              {product.tags?.map((tag, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <Input
                    value={tag || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setProduct((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          tags: prev.tags.map((tag, i) =>
                            i === idx ? e.target.value : tag
                          ),
                        };
                      })
                    }
                    placeholder="Enter tag"
                    className="w-full md:w-30"
                  />

                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      setProduct((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          tags: prev.tags.filter((t, index) => idx !== index),
                        };
                      })
                    }
                    className=""
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setProduct((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      tags: [...prev.tags, ""],
                    };
                  })
                }
              >
                Add Tag
              </Button>
            </div>
          </div>

          {/* Variants */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Label>Variants</Label>
                <Tooltip>
                  <TooltipTrigger type="button">
                    <HelpCircle size={12} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-background border shadow max-w-80 leading-5 text-foreground">
                    Variants let you offer different versions of the same
                    product (e.g., size, color, material), each with its own
                    stock and price
                  </TooltipContent>
                </Tooltip>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={handleAddVariant}
              >
                Add Variant
              </Button>
            </div>

            <Accordion
              type="multiple"
              className="mt-2 border px-3 py-2 rounded-md"
            >
              {product.product_variants
                ? product.product_variants.map((variant, idx) => (
                    <AccordionItem key={idx} value={`variant-${idx}`}>
                      <AccordionTrigger className="cursor-pointer px-3">
                        <div className="flex items-center gap-3 text-left">
                          <span className="font-medium">
                            {variant.name || "Unnamed Variant"}
                          </span>

                          <span className="text-sm text-muted-foreground">
                            SKU: {variant.sku || "—"}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-2 gap-4 p-2 md:p-4 mt-4">
                          <div className="flex flex-col gap-2.5">
                            <Label>Name</Label>
                            <Input
                              name="name"
                              value={variant.name}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              placeholder="Name"
                              title="Name"
                              className={`${
                                errors?.product_variants?.[idx]?.name
                                  ? "border-destructive"
                                  : ""
                              }`}
                            />
                            {errors?.product_variants?.[idx]?.name && (
                              <p className="text-sm text-destructive">
                                Name is required
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                              <Label>Quantity</Label>
                              <Tooltip>
                                <TooltipTrigger type="button">
                                  <HelpCircle
                                    size={12}
                                    className="text-muted-foreground"
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="bg-background border shadow max-w-80 leading-5 text-foreground">
                                  Quantity can only be set when creating a new
                                  variant or updated via Inventory adjustments
                                </TooltipContent>
                              </Tooltip>
                            </div>{" "}
                            <Input
                              name="quantity"
                              type="number"
                              value={variant.inventory.quantity}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.product_variants?.[idx]?.quantity
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="Quantity"
                              min={0}
                              title="Quantity"
                              disabled={variant?.id ? true : false}
                            />
                            {errors?.product_variants?.[idx]?.quantity && (
                              <p className="text-sm text-destructive">
                                Quantity is required
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <Label>Price</Label>
                            <Input
                              name="price"
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.product_variants?.[idx]?.price
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="Price"
                              min={0}
                              step={0.01}
                              title="Price"
                            />
                            {errors?.product_variants?.[idx]?.price && (
                              <p className="text-sm text-destructive">
                                Price is required
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                              <Label>Low Quantity Threshold</Label>
                              <Tooltip>
                                <TooltipTrigger type="button">
                                  <HelpCircle
                                    size={12}
                                    className="text-muted-foreground"
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="bg-background border shadow max-w-80 leading-5 text-foreground">
                                  Low Quantity Threshold is the minimum stock
                                  level at which you want to be alerted to
                                  restock the product.
                                </TooltipContent>
                              </Tooltip>
                            </div>{" "}
                            <Input
                              name="lowQuantityThreshold"
                              type="number"
                              value={variant.inventory.lowQuantityThreshold}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.product_variants?.[idx]
                                  ?.lowQuantityThreshold
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="Low Quantity Threshold"
                              min={0}
                              title="Low Quantity Threshold"
                            />
                            {errors?.product_variants?.[idx]
                              ?.lowQuantityThreshold && (
                              <p className="text-sm text-destructive">
                                Low Quantity Threshold is required
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <Label>Reserved</Label>
                            <Input
                              name="reserved"
                              type="number"
                              value={variant.inventory.reserved}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.product_variants?.[idx]?.reserved
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="Reserved"
                              min={0}
                              title="Reserved"
                            />
                            {errors?.product_variants?.[idx]?.reserved && (
                              <p className="text-sm text-destructive">
                                Reserved is required
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center gap-2">
                              <Label>SKU</Label>
                              <Tooltip>
                                <TooltipTrigger type="button">
                                  <HelpCircle
                                    size={12}
                                    className="text-muted-foreground"
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="bg-background border shadow max-w-80 leading-5 text-foreground">
                                  Stock Keeping Unit (SKU) is a unique
                                  identifier for each variant, used for
                                  inventory tracking and management.
                                </TooltipContent>
                              </Tooltip>
                            </div>{" "}
                            <Input
                              name="sku"
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.product_variants?.[idx]?.sku
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="SKU"
                              title="SKU"
                            />
                            {errors?.product_variants?.[idx]?.sku && (
                              <p className="text-sm text-destructive">
                                SKU is required
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col  col-span-2 mt-6">
                            {/* Variant Image */}
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-center gap-2">
                                <Label>Variant Image</Label>
                                <Tooltip>
                                  <TooltipTrigger type="button">
                                    <HelpCircle
                                      size={12}
                                      className="text-muted-foreground"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-background border shadow max-w-80 leading-5 text-foreground">
                                    Upload an image that represents this
                                    specific variant (e.g., color, size, or
                                    style).
                                  </TooltipContent>
                                </Tooltip>
                              </div>

                              <div
                                className={`border-2 border-dashed rounded-md p-2 flex flex-col items-center justify-center cursor-pointer text-center w-full md:w-80 h-70 hover:bg-background/10 transition overflow-hidden ${
                                  errors?.product_variants?.[idx]?.image
                                    ? "border-destructive"
                                    : ""
                                }`}
                                onClick={() =>
                                  document
                                    .getElementById(`variant-image-${idx}`)
                                    ?.click()
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleVariantFileChange(idx, e)}
                              >
                                {variant.image_url ? (
                                  <div className="w-full md:w-75 h-65 overflow-hidden rounded-md relative group">
                                    {/* Variant Image */}
                                    <Image
                                      src={`${variant.image_url}`}
                                      alt="Variant preview"
                                      width={600}
                                      height={400}
                                      loading="lazy"
                                      className="object-cover w-full h-full rounded-md group-hover:scale-110 transition duration-300"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center rounded-md">
                                      <span className="text-white text-sm font-medium ">
                                        Change Variant Image
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                                    <Upload className="w-12 h-12 mb-2" />
                                    <p className="text-sm">
                                      Click or drag image to upload
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      (Max size 1MB)
                                    </p>
                                  </div>
                                )}

                                <Input
                                  id={`variant-image-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleVariantFileChange(idx, e);
                                    setErrors((prev) => ({
                                      ...prev,
                                      product_variants: prev.product_variants
                                        ? prev.product_variants.map((err, i) =>
                                            i === idx
                                              ? { ...err, image: "" }
                                              : err
                                          )
                                        : [],
                                    }));
                                  }}
                                />
                                {errors?.product_variants?.[idx]?.image && (
                                  <p className="text-sm text-destructive mt-2.5">
                                    Variant image file is required
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end gap-3">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveVariant(idx)}
                                className="w-full md:w-fit mt-4"
                              >
                                Remove Variant
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                : null}
            </Accordion>
          </div>

          {/* Sticky Save Bar */}
          <div className="sticky bottom-0 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4 flex justify-end gap-3 rounded-b-md">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={!isDirty}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !isDirty}>
              {saving ? <ClipLoader size={16} className="text-white" /> : ""}{" "}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
