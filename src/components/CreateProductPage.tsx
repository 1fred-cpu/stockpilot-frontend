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
  id?: string;
  name: string;
  brand: string;
  categoryType: string;
  description: string;
  thumbnail: string | null; // can be URL
  tags: string[];
  productVariants: Variant[];
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
    quantity: "",
    lowQuantityThreshold: "",
    reserved: "",
  },
  sku: "",
};

/** --------------------------
 * Component
 * ---------------------------*/
export default function CreateProductPage() {
  const initialProduct: ProductDto = {
    name: "",
    description: "",
    categoryType: "",
    brand: "",
    tags: [],
    thumbnail: null,
    productVariants: [],
  };
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const [loading, setLoading] = useState<boolean>(false);

  const [product, setProduct] = useState<ProductDto>({
    ...initialProduct,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  // Local UI state for tags/attributes editors
  const [tagInput, setTagInput] = useState<string>("");

  // Error state for form fields and variants
  const [errors, setErrors] = useState<{
    name?: string;
    brand?: string;
    description?: string;
    categoryType?: string;
    thumbnail?: string | null;
    productVariants?: Array<{
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
    categoryType: "",
    thumbnail: null,
    productVariants: [],
  });

  /** ------- Validation: set errors for missing fields ------- */
  const validateAndSetErrors = () => {
    if (!product) return false;
    let valid = true;
    const newErrors: typeof errors = {
      name: "",
      brand: "",
      description: "",
      categoryType: "",
      thumbnail: null,
      productVariants: [],
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
    if (!product.categoryType?.trim()) {
      newErrors.categoryType = "Category is required";
      valid = false;
    }
    if (!thumbnailFile && !thumbnailPreview) {
      newErrors.thumbnail = "Thumbnail image file is required";
      valid = false;
    }

    // Validate variants
    if (!product.productVariants || product.productVariants.length === 0) {
      toast.error("At least one variant is required");
      valid = false;
    } else {
      newErrors.productVariants = product.productVariants.map((v) => {
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

      const updated = [...prev.productVariants];
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

      return { ...prev, productVariants: updated };
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
          const updated = [...prev.productVariants];
          updated[idx] = {
            ...updated[idx],
            imageFile: file,
            image_url: reader.result as string,
          };
          return { ...prev, productVariants: updated };
        });
      reader.readAsDataURL(file);
    }
  };

  const handleAddVariant = () => {
    if (!product) return;
    setProduct({
      ...product,
      productVariants: [...product.productVariants, { ...initialVariant }],
    });
  };

  const handleRemoveVariant = (idx: number) => {
    if (!product) return;

    // Prevent from removing all variant, at least one is required
    if (product.productVariants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }

    setProduct({
      ...product,
      productVariants: product.productVariants.filter((_, i) => i !== idx),
    });
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
    if (!product || !store?.storeId) return;

    if (!validateAndSetErrors()) {
      return;
    }

    setLoading(true);
    const formData = new FormData();

    // base fields
    formData.append("name", product.name);
    formData.append("storeId", store.storeId);
    formData.append("businessId", store.businessId);
    formData.append("businessName", store.businessName);
    formData.append("brand", product.brand);
    formData.append("category", product.categoryType);
    formData.append("description", product.description);

    // thumbnail (optional)
    if (thumbnailFile) {
      formData.append("thumbnailFile", thumbnailFile);
    }

    // arrays/objects
    formData.append("tags", JSON.stringify(product.tags || []));

    const variantsPayload = (product.productVariants || []).map((v) => {
      // compute the file index in the compact files list

      return {
        id: v.id,
        name: v.name,
        stock: v.inventory.quantity,
        price: v.price,
        inventory: {
          lowStockQuantity: v.inventory.lowQuantityThreshold,
          reserved: v.inventory.reserved,
          quantity: v.inventory.quantity,
        },
        sku: v.sku,
      };
    });

    // metadata first
    formData.append("productVariants", JSON.stringify(variantsPayload));

    // then the actual files, in the same compact order
    product.productVariants.forEach((v) => {
      formData.append("variantImages", v.imageFile as File);
    });

    try {
      const res = await axiosInstance.post(
        `/businesses/${store.businessId}/products`,
        formData
      );
      const data = res.data.product;
      toast.success(data.message || "Product created successfully");

      setProduct(initialProduct);
      setThumbnailPreview("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Creating product failed");
    } finally {
      setLoading(false);
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
      productVariants: prev.productVariants
        ? prev.productVariants.map((err, i) =>
            i === idx ? { ...err, [name]: "" } : err
          )
        : [],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Create Product"
        subtitle="Add new products to your catalog and keep your inventory up to date."
      />

      <Card>
        <CardContent>
          <div className="flex flex-col md:grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="name">Product Name</Label>
              <Input
                disabled={loading}
                id="name"
                name="name"
                placeholder="eg. Luxeline"
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
                disabled={loading}
                id="brand"
                name="brand"
                placeholder="eg. Ralph Lauren"
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
                disabled={loading}
                id="category"
                name="categoryType"
                placeholder="eg. Men Clothing"
                value={product.categoryType}
                onChange={handleChange}
                onFocus={handleOnFocusInput}
                className={`${errors.categoryType ? "border-destructive" : ""}`}
              />
              {errors.categoryType && (
                <p className="text-sm text-destructive">Category is required</p>
              )}
            </div>
            <div className="flex flex-col gap-2.5 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="eg. A short summary of the product, its features, and any important details customers should know."
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
              onDrop={(e) => {
                handleThumbnailChange(e);
                setErrors((prev) => ({
                  ...prev,
                  thumbnail: "",
                }));
              }}
            >
              {thumbnailPreview ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="w-12 h-12 mb-2" />
                  <p className="text-sm">Click or drag image to upload</p>
                  <p className="text-xs text-muted-foreground">
                    (Max size 1MB)
                  </p>
                </div>
              )}

              <Input
                disabled={loading}
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
                    disabled={loading}
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
              {product.productVariants
                ? product.productVariants.map((variant, idx) => (
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
                              disabled={loading}
                              name="name"
                              value={variant.name}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              placeholder="eg. Small - Red"
                              title="Name"
                              className={`${
                                errors?.productVariants?.[idx]?.name
                                  ? "border-destructive"
                                  : ""
                              }`}
                            />
                            {errors?.productVariants?.[idx]?.name && (
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
                              disabled={loading}
                              name="quantity"
                              type="number"
                              value={variant.inventory.quantity}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.productVariants?.[idx]?.quantity
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="eg. 50"
                              min={0}
                              title="Quantity"
                            />
                            {errors?.productVariants?.[idx]?.quantity && (
                              <p className="text-sm text-destructive">
                                Quantity is required
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <Label>Price</Label>
                            <Input
                              disabled={loading}
                              name="price"
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.productVariants?.[idx]?.price
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="eg. 59.99"
                              min={0}
                              step={0.01}
                              title="Price"
                            />
                            {errors?.productVariants?.[idx]?.price && (
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
                              disabled={loading}
                              name="lowQuantityThreshold"
                              type="number"
                              value={variant.inventory.lowQuantityThreshold}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.productVariants?.[idx]
                                  ?.lowQuantityThreshold
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="eg. 5"
                              min={0}
                              title="Low Quantity Threshold"
                            />
                            {errors?.productVariants?.[idx]
                              ?.lowQuantityThreshold && (
                              <p className="text-sm text-destructive">
                                Low Quantity Threshold is required
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2.5">
                            <Label>Reserved</Label>
                            <Input
                              disabled={loading}
                              name="reserved"
                              type="number"
                              value={variant.inventory.reserved}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.productVariants?.[idx]?.reserved
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="eg. 10"
                              min={0}
                              title="Reserved"
                            />
                            {errors?.productVariants?.[idx]?.reserved && (
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
                              disabled={loading}
                              name="sku"
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(idx, e)}
                              onFocus={(e) => handleVariantOnFocusInput(e, idx)}
                              className={`${
                                errors?.productVariants?.[idx]?.sku
                                  ? "border-destructive"
                                  : ""
                              }`}
                              placeholder="eg. WS-0001"
                              title="SKU"
                            />
                            {errors?.productVariants?.[idx]?.sku && (
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
                                  errors?.productVariants?.[idx]?.image
                                    ? "border-destructive"
                                    : ""
                                }`}
                                onClick={() =>
                                  document
                                    .getElementById(`variant-image-${idx}`)
                                    ?.click()
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  handleVariantFileChange(idx, e);
                                  setErrors((prev) => ({
                                    ...prev,
                                    productVariants: prev.productVariants
                                      ? prev.productVariants.map((err, i) =>
                                          i === idx
                                            ? { ...err, image: "" }
                                            : err
                                        )
                                      : [],
                                  }));
                                }}
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
                                  disabled={loading}
                                  id={`variant-image-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleVariantFileChange(idx, e);
                                    setErrors((prev) => ({
                                      ...prev,
                                      productVariants: prev.productVariants
                                        ? prev.productVariants.map((err, i) =>
                                            i === idx
                                              ? { ...err, image: "" }
                                              : err
                                          )
                                        : [],
                                    }));
                                  }}
                                />
                                {errors?.productVariants?.[idx]?.image && (
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
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <ClipLoader size={16} className="text-white" /> : ""}{" "}
              Create Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
