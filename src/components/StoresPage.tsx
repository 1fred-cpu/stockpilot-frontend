"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Plus, Store, Trash2, CheckCircle2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import axiosInstance from "../../utils/axiosInstance";
import useStore from "../../utils/zustand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "./PageHeader";

type StoreType = {
  id: string;
  name: string;
  logoUrl?: string;
  currency: string;
  businessName: string;
  businessId: string;
  location: string;
  created_at: string;
};

// Zod schema for validation
const storeSchema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  currency: z.string().min(1, "Currency is required"),
  logoUrl: z.string().url("Must be a valid URL").optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

export default function StoresPage() {
  const { getActiveStore, setActiveStore } = useStore();
  const store = getActiveStore();
  const storeId = store?.storeId;
  const [stores, setStores] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // control dialog

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  });

  // Fetch stores
  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/stores/${store?.businessId}/all`
        ); // API to get all stores
        setStores(response.data || []);
      } catch (error) {
        toast.error("Failed to fetch stores.");
      } finally {
        setLoading(false);
      }
    }
    fetchStores();
  }, []);

  // Switch store
  const handleSwitchStore = (store: StoreType) => {
    setActiveStore({
      storeId: store.id,
      storeName: store.name,
      currency: store.currency,
      location: store.location,
      businessName: store.businessName,
      businessId: store.businessId,
    });
    toast.success(`Switched to ${store.name}`);
  };

  // Delete store
  const handleDeleteStore = async (id: string) => {
    try {
      setDeletingId(id);
      await axiosInstance.delete(`/stores/${id}`);
      setStores(stores.filter((s) => s.id !== id));
      toast.success("Store deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete store.");
    } finally {
      setDeletingId(null);
    }
  };

  // Add store
  const onSubmit = async (data: StoreFormData) => {
    try {
      const response = await axiosInstance.post("/stores", data);
      setStores([...stores, response.data.store]);
      toast.success("Store created successfully.");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create store.");
    }
  };

  return (
    <div className="p-6 space-y-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
        <PageHeader
          title="Your Stores"
          subtitle="Manage all your stores in one place. Add, switch, or remove stores as needed."
        />

        {/* Add Store Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 w-full md:w-fit">
              <Plus className="w-4 h-4" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  placeholder="Enter store name"
                  {...register("storeName")}
                  className={errors.storeName ? "border-red-500" : ""}
                />
                {errors.storeName && (
                  <p className="text-sm text-red-500">
                    {errors.storeName.message}
                  </p>
                )}
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  placeholder="USD, GHS, EUR..."
                  {...register("currency")}
                  className={errors.currency ? "border-red-500" : ""}
                />
                {errors.currency && (
                  <p className="text-sm text-red-500">
                    {errors.currency.message}
                  </p>
                )}
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  placeholder="https://example.com/logo.png"
                  {...register("logoUrl")}
                  className={errors.logoUrl ? "border-red-500" : ""}
                />
                {errors.logoUrl && (
                  <p className="text-sm text-red-500">
                    {errors.logoUrl.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <ClipLoader size={18} color="#fff" />
                ) : (
                  "Create Store"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Store List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <ClipLoader size={18} />
        </div>
      ) : stores.length === 0 ? (
        <Card className=" h-120 flex">
          <CardContent className="flex-1 flex justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <Store className="w-10 h-10 text-gray-700 dark:text-gray-300 mb-2" />
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-200">
                No stores found
              </p>
              <p className="text-muted-foreground text-base text-center">
                Add a new store to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.id} className="relative group">
              <CardHeader className="flex items-center gap-2">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <Store className="w-12 h-12 text-gray-400" />
                )}
                <CardTitle>{store.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Currency:</span>{" "}
                  {store.currency}
                </p>
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(store.created_at).toLocaleDateString()}
                </p>
              </CardContent>

              {/* Active Store Badge */}
              {storeId === store.id && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-green-600 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSwitchStore(store)}
                >
                  Switch
                </Button>

                {/* Delete Store Confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === store.id}
                    >
                      {deletingId === store.id ? (
                        <ClipLoader size={14} color="#fff" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {store.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. It will permanently delete
                        the store and all related data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteStore(store.id)}
                      >
                        Yes, Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
