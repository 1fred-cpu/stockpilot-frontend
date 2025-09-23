"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { Card, CardContent } from "./ui/card";
import PageHeader from "./PageHeader";
import { Skeleton } from "./ui/skeleton";

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
  currency: string;
  location: string;
};

export default function StoreDetailsPage({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const businessId = store?.business_id;

  // Fetch store + users
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get(`/stores/${id}`);
        const store = response.data;

        if (store) {
          setOriginalData(store);
          reset(store);

          setUsers(store?.storeUsers || []);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      address: "",
      currency: "USD",
      location: "",
    },
  });

  // Save details
  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      const response = await axiosInstance.patch(`/stores/${store?.store_id}`, {
        ...data,
        business_id: businessId,
      });
      if (!response.data) throw new Error("Failed to update store");
      setOriginalData(response.data);
      reset(response.data);

      const isCurrentStore = store?.store_id === response.data.id;
      if (isCurrentStore) {
        useStore.getState().setActiveStore({
          business_id: response.data.business_id,
          store_id: response.data.id,
          store_name: response.data.name,
          currency: response.data.currency,
          location: response.data.location,
          business_name: store?.business_name || "",
        });
      }
      toast.success("Store updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      await axiosInstance.delete(`/stores/${id}/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User removed successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user");
    }
  };

  // Change role
  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await axiosInstance.patch(`/stores/${id}/users/${userId}/role`, { role });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
      toast.success("Role updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    }
  };

  // Send invite
  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email");
      return;
    }
    try {
      await axiosInstance.post(`/stores/${id}/invite`, { email: inviteEmail });
      toast.success("Invitation sent!");
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    }
  };

  if (loading) return <StoreDetailsSkeleton />;

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Store Management"
        subtitle="Manage store details, users, and invitations."
      />
      <Card>
        <CardContent>
          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="flex gap-4 border-b mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details">
              <div className="p-6 rounded-md border">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid gap-6 md:grid-cols-2"
                >
                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="name">Store Name</Label>
                    <Input
                      id="name"
                      disabled={saving}
                      placeholder="e.g. Downtown Outlet"
                      {...register("name", {
                        required: "Store name is required",
                      })}
                      className={`${errors.name ? "border-destructive" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      disabled={saving}
                      placeholder="e.g. New York, NY"
                      {...register("location", {
                        required: "Location is required",
                      })}
                      className={`${
                        errors.location ? "border-destructive" : ""
                      }`}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      disabled={saving}
                      placeholder="e.g. 123 Main Street"
                      {...register("address", {
                        required: "Address is required",
                      })}
                      className={`${
                        errors.address ? "border-destructive" : ""
                      }`}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      disabled={saving}
                      placeholder="e.g. contact@store.com"
                      {...register("email", { required: "Email is required" })}
                      className={`${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      disabled={saving}
                      placeholder="e.g. +1 234 567 8900"
                      {...register("phone", { required: "Phone is required" })}
                      className={`${errors.phone ? "border-destructive" : ""}`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      disabled={saving}
                      placeholder="USD"
                      {...register("currency", {
                        required: "Currency is required",
                      })}
                      className={`${
                        errors.currency ? "border-destructive" : ""
                      }`}
                    />
                    {errors.currency && (
                      <p className="text-sm text-destructive">
                        {errors.currency.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full md:w-fit"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>Save Changes</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className=" p-6 rounded-md shadow-sm border">
                {users?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No users assigned yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {users?.map((u: any) => (
                      <div
                        key={u?.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{u?.user?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {u?.user?.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            value={u?.role}
                            onValueChange={(value) =>
                              handleRoleChange(u?.id, value)
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDeleteUser(u?.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Invites Tab */}
            <TabsContent value="invites">
              <div className="p-6 rounded-xl shadow-sm border flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Enter role (e.g. staff, manager)"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                />
                <Button onClick={handleSendInvite}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Send Invite
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export function StoreDetailsSkeleton() {
  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" /> {/* Title */}
        <Skeleton className="h-4 w-80" /> {/* Subtitle */}
      </div>

      {/* Main Card */}
      <Card>
        <CardContent className="space-y-8">
          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="flex gap-4 border-b mb-6">
              <TabsTrigger value="details">
                <Skeleton className="h-5 w-16" />
              </TabsTrigger>
              <TabsTrigger value="users">
                <Skeleton className="h-5 w-20" />
              </TabsTrigger>
              <TabsTrigger value="invites">
                <Skeleton className="h-5 w-20" />
              </TabsTrigger>
            </TabsList>

            {/* Details Tab Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2.5">
                  <Skeleton className="h-4 w-32" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
              ))}
              <div className="md:col-span-2 flex justify-end">
                <Skeleton className="h-10 w-40" /> {/* Save Button */}
              </div>
            </div>

            {/* Users Tab Skeleton */}
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" /> {/* Name */}
                    <Skeleton className="h-4 w-32" /> {/* Email */}
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-[140px]" /> {/* Role Select */}
                    <Skeleton className="h-10 w-10 rounded-md" />{" "}
                    {/* Delete Btn */}
                  </div>
                </div>
              ))}
            </div>

            {/* Invites Tab Skeleton */}
            <div className="flex gap-3 mt-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
