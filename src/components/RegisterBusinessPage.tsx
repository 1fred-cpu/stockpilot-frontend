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

// ✅ Schema with correct File validation
const registerBusinessSchema = z.object({
  business_name: z.string().min(2, "Business name is required"),
  store_name: z.string().min(2, "Store name is required"),
  currency: z.string().min(1, "Currency is required"),
  location: z.string().min(1, "Location is required"),
  owner_name: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(6, "Invalid phone number"),
  website: z.string().optional(),
  image_file: z
    .custom<File>((val) => val instanceof File, {
      message: "Logo image file is required",
    })
    .transform((val) => val),
});

type RegisterBusinessForm = z.infer<typeof registerBusinessSchema>;

export default function RegisterBusinessPage() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { appStore, setAppStore } = useStore();
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
    try {
      setLoading(true);
      console.log(formData);

      const response = await axiosInstance.post(
        "/businesses/register",
        {
          owner_user_id: appStore.user?.id,
          ...formData,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = response.data;

      setAppStore({
        stores: data.stores,
        active_store: data.active_store,
      });

      router.push("/dashboard/overview");
    } catch (error: any) {
      const status = error.response.data.statusCode;

      if (status === 409) {
        toast.error(error.response.data.message);
      } else if (status === 404) {
        toast.error(error.response.data.message);
      } else if (status === 500) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response.data.message || error.message);
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
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/black-woman-running-small-business.jpg')] bg-cover bg-no-repeat bg-center">
      <div className="w-full max-w-3xl p-4">
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
                      {...register("business_name")}
                      className={
                        errors.business_name ? "border-destructive" : ""
                      }
                    />
                    {errors.business_name && (
                      <p className="text-sm text-destructive">
                        {errors.business_name.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>Store Name</Label>
                    <Input
                      placeholder="e.g. Luxeline Store"
                      {...register("store_name")}
                      className={errors.store_name ? "border-destructive" : ""}
                    />
                    {errors.store_name && (
                      <p className="text-sm text-destructive">
                        {errors.store_name.message}
                      </p>
                    )}
                  </div>

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

                {/* Owner info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2.5">
                    <Label>Owner Name</Label>
                    <Input
                      placeholder="e.g. John Doe"
                      {...register("owner_name")}
                      className={errors.owner_name ? "border-destructive" : ""}
                    />
                    {errors.owner_name && (
                      <p className="text-sm text-destructive">
                        {errors.owner_name.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="owner@email.com"
                      {...register("email")}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>Phone</Label>
                    <Input
                      placeholder="e.g. +233 55 123 4567"
                      {...register("phone")}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">
                        {errors.phone.message}
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
                    name="image_file"
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
                            errors.image_file && "border-destructive"
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
                  {errors.image_file && (
                    <p className="text-sm text-destructive text-center">
                      {errors.image_file.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <ClipLoader size={18} color="#ffffff" />
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
