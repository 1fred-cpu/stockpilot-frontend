"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type FormData = {
  name: string;
  address: string;
  email: string;
  phone: string;
  description?: string;
  currency: string;
  managerId?: string;
  location: string;
};

export default function CreateStorePage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { getActiveStore, appStore } = useStore();
  const router = useRouter();
  const store = getActiveStore();
  const businessId = store?.business_id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      address: "",
      description: "",
      currency: "USD",
      location: "",
      managerId: undefined,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const res = await axiosInstance.post("/stores", {
        ...data,
        store_name: data.name,
        owner_id: appStore.user?.id,
        business_id: businessId,
      });
      if (!res.data) throw new Error("Failed to create store");

      toast.success("Store created successfully!");
      router.push("/dashboard/stores");
      reset();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-xl shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Create New Store
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                placeholder="e.g. Downtown Outlet"
                {...register("name", { required: "Store name is required" })}
                className={errors.name ? "border-destructive" : "capitalize"}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. New York, NY"
                className={
                  errors.location ? "border-destructive" : "capitalize"
                }
                {...register("location", { required: "Location is required" })}
              />
              {errors.location && (
                <p className="text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="e.g. 123 Main Street, City"
                className={errors.address ? "border-destructive" : "capitalize"}
                {...register("address", { required: "Address is required" })}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                className={errors.email ? "border-destructive" : "lowercase"}
                placeholder="e.g. contact@store.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="Phone">Contact Phone</Label>
              <Input
                id="phone"
                placeholder="e.g. +1 234 567 8900"
                type="tel"
                pattern="^\+?[1-9]\d{1,14}$"
                className={errors.phone ? "border-destructive" : ""}
                {...register("phone", { required: "Phone is required" })}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="e.g. USD"
                className={errors.currency ? "border-destructive" : "uppercase"}
                {...register("currency", { required: "Currency is required" })}
              />
              {errors.currency && (
                <p className="text-sm text-red-500">
                  {errors.currency.message}
                </p>
              )}
            </div>

            {/* Manager Selection */}
            {/* <div className="space-y-2">
              <Label>Assign Manager</Label>
              <Select onValueChange={(value) => setValue("managerId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u) => u.role === "manager")
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div> */}

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full ">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Create Store
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
