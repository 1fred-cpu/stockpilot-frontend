"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Store, Trash2, UserPlus } from "lucide-react";
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
import Spinner from "./Spinner";

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

type ActionType = "assignRole" | "remove";

interface UserAction {
  userId: string;
  action: ActionType;
  role?: string; // only needed if type = "assignRole"
}

export default function StoreDetailsPage({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [actions, setActions] = useState<UserAction[]>([]);
  const { getActiveStore, appStore } = useStore();

  const store = getActiveStore();
  const businessId = store?.business_id;

  // 🔹 Helper to add or update an action for a user
  const upsertAction = (newAction: UserAction) => {
    setActions((prev) => {
      const existingIndex = prev.findIndex(
        (a) => a.userId === newAction.userId && a.action === newAction.action
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...newAction };
        return updated;
      }
      return [...prev, newAction];
    });
  };

  // Handle role change
  const handleRoleChange = (userId: string, role: string) => {
    upsertAction({ userId, action: "assignRole", role });
  };

  // Handle user removal
  const handleRemoveUser = (userId: string) => {
    upsertAction({ userId, action: "remove" });
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

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
        setError(true);
        setErrorMessage(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, retry]);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
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
      const response = await axiosInstance.patch(`/stores/${id}`, {
        ...data,
        business_id: businessId,
      });
      if (!response.data) throw new Error("Failed to update store");

      setOriginalData(response.data);
      reset(response.data); // reset form -> clears isDirty

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

  // Save users (apply role changes/removals)
  const handleSaveUsers = async () => {
    if (actions.length === 0) return;
    try {
      setSaving(true);
      const response = await axiosInstance.patch(`/stores/${id}/users`, {
        actions,
      });
      toast.success(response.data?.message || "User updates saved!");
      setActions([]); // clear after save
      setUsers(response.data?.users);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update users");
    } finally {
      setSaving(false);
    }
  };

  // Send invite
  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email");
      return;
    }
    if (!inviteRole) {
      toast.error("Please enter a role");
      return;
    }
    setSaving(true);
    try {
      await axiosInstance.post(`/stores/${id}/send-invite`, {
        email: inviteEmail,
        store_id: id,
        business_id: businessId,
        invited_by: appStore.user?.id || "",
        store_name: store?.store_name || "",
        role: inviteRole || "staff",
      });
      toast.success("Invitation sent!");
      setInviteEmail("");
      setInviteRole("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send invite");
    } finally {
      setSaving(false);
    }
  };

  const hasUserChanges = actions.length > 0;
  if (loading) return <StoreDetailsSkeleton />;
  if (error)
    return (
      <StoreDetailsError
        message={errorMessage}
        onRetry={() => setRetry(!retry)}
      />
    );

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Store Management"
        subtitle="Manage store details, users, and invitations."
      />
      <Card>
        <CardContent>
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
                      disabled={saving || !isDirty}
                      className="w-full md:w-fit"
                    >
                      {saving ? (
                        <>
                          <Spinner /> Saving...
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
              <div className="p-6 rounded-md shadow-sm border">
                {users?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No users assigned yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {users?.map((user: any) => (
                      <div
                        key={user?.id}
                        className="flex flex-col md:flex-row gap-6 md:items-center justify-between px-3 py-4 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 justify-between md:justify-start">
                          <Select
                            value={(
                              actions.find(
                                (action) => action.userId === user?.id
                              )?.role ||
                              user.role ||
                              ""
                            ).toLowerCase()}
                            onValueChange={(value) =>
                              handleRoleChange(user?.id, value)
                            }
                          >
                            <SelectTrigger
                              className="w-28 cursor-pointer"
                              disabled={
                                user.role === "owner"
                                  ? true
                                  : saving
                                  ? true
                                  : false
                              }
                            >
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="owner" disabled>
                                Owner
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleRemoveUser(user?.id)}
                            disabled={
                              user.role === "owner"
                                ? true
                                : saving
                                ? true
                                : false
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="w-full mt-8 flex justify-end ">
                      <Button
                        onClick={handleSaveUsers}
                        disabled={saving || !hasUserChanges}
                      >
                        {saving ? (
                          <>
                            <Spinner />
                            Saving...
                          </>
                        ) : (
                          <>Save Changes</>
                        )}
                      </Button>
                    </div>
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
                  placeholder="Enter role (e.g. staff, manager, admin) needed for invite"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                />
                <Button
                  onClick={handleSendInvite}
                  disabled={saving}
                  className={`${saving ? "cursor-wait" : ""}`}
                >
                  {saving ? (
                    <>
                      <Spinner /> Sending...
                    </>
                  ) : (
                    <>
                      {" "}
                      <UserPlus className="w-5 h-5 mr-2" /> Send Invite
                    </>
                  )}
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
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Card>
        <CardContent className="space-y-8">
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
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <div className="md:col-span-2 flex justify-end">
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-[140px]" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
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

export function StoreDetailsError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Store Management"
        subtitle="Manage store details, users, and invitations."
      />
      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
            {/* Illustration (replace with your own SVG/PNG if you have one) */}
            {/* <Image
              src="/images/error-illustration.svg" // Add an illustration in your public/images folder
              alt="Error Illustration"
              width={200}
              height={200}
              className="mx-auto opacity-90"
            /> */}

            {/* Icon + Title */}
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-lg font-semibold">
                Oops! Something went wrong
              </h2>
            </div>

            {/* Error details */}
            <p className="text-sm text-muted-foreground max-w-md">
              We couldn’t load your store right now. Please try again.
              <span className="block mt-1 text-xs text-destructive">
                {message}
              </span>
            </p>

            {/* Retry button */}
            <Button variant="destructive" className="mt-2" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
