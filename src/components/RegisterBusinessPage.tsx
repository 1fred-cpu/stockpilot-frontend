"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";
import useStore from "../../utils/zustand";
import { redirect, useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";
import Spinner from "./Spinner";

// ✅ Schema with correct File validation
const registerBusinessSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  storeName: z.string().min(2, "Store name is required"),
  currency: z.string().min(1, "Currency is required"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  businessEmail: z.string().email("Invalid business email"),
  storeEmail: z.string().email("Invalid store email"),
  businessPhone: z.string().min(6, "Invalid business phone number"),
  storePhone: z.string().min(6, "Invalid store phone number"),
  website: z.string().optional(),
  imageFile: z
    .custom<File | null>((val) => (val instanceof File ? File : null), {
      message: "Logo image file is required",
    })
    .transform((val) => val),
});

type RegisterBusinessForm = z.infer<typeof registerBusinessSchema>;

export default function RegisterBusinessPage() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { appStore, setActiveStore } = useStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterBusinessForm>({
    resolver: zodResolver(registerBusinessSchema),
  });

  const onSubmit = async (formData: RegisterBusinessForm) => {
    const toastId = toast.loading("Registering your business");
    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/businesses/register",
        {
          ownerUserId: appStore.user?.id,
          ...formData,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = response.data;

      setActiveStore(data?.activeStore);
      toast.success("Business registered successfully", {
        id: toastId,
      });
      router.push("/dashboard/overview");
    } catch (error: any) {
      const status = error.response.data.statusCode;

      if (status === 409) {
        toast.error(error.response.data.message, {
          id: toastId,
        });
      } else if (status === 404) {
        toast.error(error.response.data.message, {
          id: toastId,
        });
      } else if (status === 500) {
        toast.error(error.response.data.message, {
          id: toastId,
        });
      } else {
        toast.error(error.response.data.message || error.message, {
          id: toastId,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/black-woman-running-small-business.jpg')] bg-cover bg-no-repeat bg-center relative">
      <div className="w-full max-w-3xl p-4">
        <div className="inset-0 backdrop-blur-sm absolute" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1], // smooth cubic bezier
            delay: 0.5,
          }}
        >
          <Card className="w-full shadow-2xl backdrop-blur-md py-8">
            <CardHeader className="text-center mb-2">
              <CardTitle className="text-2xl font-bold">
                Register Your Business
              </CardTitle>
              <CardDescription>
                Create your business profile to start using StockPilot
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Business info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2.5">
                    <Label>Business Name</Label>
                    <Input
                      placeholder="e.g. Luxeline Ltd."
                      {...register("businessName")}
                      className={
                        errors.businessName ? "border-destructive" : ""
                      }
                    />
                    {errors.businessName && (
                      <p className="text-sm text-destructive">
                        {errors.businessName.message}
                      </p>
                    )}
                  </div>

                  {/** Business Email */}
                  <div className="flex flex-col gap-2.5">
                    <Label>Business Email</Label>
                    <Input
                      placeholder="e.g. techsolutions@example.com"
                      {...register("businessEmail")}
                      className={
                        errors.businessEmail ? "border-destructive" : ""
                      }
                    />
                    {errors.businessEmail && (
                      <p className="text-sm text-destructive">
                        {errors.businessEmail.message}
                      </p>
                    )}
                  </div>

                  {/** Business Phone */}
                  <div className="flex flex-col gap-2.5">
                    <Label>Business Phone</Label>
                    <Input
                      placeholder="e.g. +233550097593"
                      {...register("businessPhone")}
                      type="tel"
                      pattern="^\+?[1-9]\d{6,14}$"
                      className={
                        errors.businessPhone ? "border-destructive" : ""
                      }
                    />
                    {errors.businessPhone && (
                      <p className="text-sm text-destructive">
                        {errors.businessPhone.message}
                      </p>
                    )}
                  </div>

                  {/** Store info */}
                  {/** Store name */}
                  <div className="flex flex-col gap-2.5">
                    <Label>Store Name</Label>
                    <Input
                      placeholder="e.g. Luxeline Store"
                      {...register("storeName")}
                      className={errors.storeName ? "border-destructive" : ""}
                    />
                    {errors.storeName && (
                      <p className="text-sm text-destructive">
                        {errors.storeName.message}
                      </p>
                    )}
                  </div>
                  {/** Currency */}
                  <div className="flex flex-col gap-2.5">
                    <Label>Currency</Label>
                    <Input
                      placeholder="e.g. GHS"
                      {...register("currency")}
                      className={errors.currency ? "border-destructive" : ""}
                    />
                    {errors.currency && (
                      <p className="text-sm text-destructive">
                        {errors.currency.message}
                      </p>
                    )}
                  </div>
                  {/** Location */}

                  <div className="flex flex-col gap-2.5">
                    <Label>Location</Label>
                    <Input
                      placeholder="e.g. Accra, Ghana"
                      {...register("location")}
                      className={errors.location ? "border-destructive" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">
                        {errors.location.message}
                      </p>
                    )}
                  </div>
                </div>

                {/** Address */}

                <div className="flex flex-col gap-2.5">
                  <Label>Address</Label>
                  <Input
                    placeholder="e.g. 123 street markway"
                    {...register("address")}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2.5">
                    <Label>Owner Name</Label>
                    <Input
                      placeholder="e.g. John Doe"
                      {...register("ownerName")}
                      className={errors.ownerName ? "border-destructive" : ""}
                    />
                    {errors.ownerName && (
                      <p className="text-sm text-destructive">
                        {errors.ownerName.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>Store Email</Label>
                    <Input
                      type="email"
                      placeholder="eg. techsolutionsaccra@example.com"
                      {...register("storeEmail")}
                      className={errors.storeEmail ? "border-destructive" : ""}
                    />
                    {errors.storeEmail && (
                      <p className="text-sm text-destructive">
                        {errors.storeEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>Store Phone</Label>
                    <Input
                      placeholder="e.g. +233551234567"
                      {...register("storePhone")}
                      className={errors.storePhone ? "border-destructive" : ""}
                      pattern="^\+?[1-9]\d{6,14}$"
                      type="tel"
                    />
                    {errors.storePhone && (
                      <p className="text-sm text-destructive">
                        {errors.storePhone.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>Website (Optional)</Label>
                    <Input
                      placeholder="https://example.com"
                      {...register("website")}
                    />
                  </div>
                </div>

                {/* Logo upload */}
                <div className="flex flex-col gap-2.5">
                  <Label>Business Logo</Label>
                  <Controller
                    name="imageFile"
                    control={control}
                    render={({ field }) => (
                      <Label htmlFor="file">
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              handleFile(file);
                              field.onChange(file);
                            }
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50/50 overflow-hidden",
                            errors.imageFile && "border-destructive"
                          )}
                        >
                          {preview ? (
                            <Image
                              src={preview}
                              alt="Logo Preview"
                              width={200}
                              height={200}
                              className="object-cover  max-h-32"
                            />
                          ) : (
                            <>
                              <Upload className="h-6 w-6 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                Click or drag file to upload
                              </p>
                            </>
                          )}
                          <Input
                            id="file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFile(file);
                                field.onChange(file);
                              }
                            }}
                          />
                        </div>
                      </Label>
                    )}
                  />
                  {errors.imageFile && (
                    <p className="text-sm text-destructive text-center">
                      {errors.imageFile.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner />
                      Creating Business...
                    </>
                  ) : (
                    "Register Business"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
