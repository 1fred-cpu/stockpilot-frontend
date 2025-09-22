"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Grid,
  List,
  Settings,
  Trash2,
  Edit,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import useStore from "../../utils/zustand"; // adjust path if needed
import { formatDistanceToNowStrict } from "date-fns";
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
import { get } from "http";
import { getCurrencySymbol } from "../../utils/currency";

type StoreItem = {
  id: string;
  name: string;
  location?: string;
  created_at?: string;
  manager?: string;
  currency?: string;
  todays_sales: {
    revenue?: number;
    quantity?: number;
  };
  stock: {
    low_stock_count?: number;
    total_products?: number;
  };
};

export default function StoresPage() {
  const setActiveStore = useStore((s: any) => s.setActiveStore);
  const getActiveStore = useStore((s) => s.getActiveStore);
  const store = getActiveStore();

  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer / detail state
  const [openStore, setOpenStore] = useState<StoreItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Replace with axiosInstance if you prefer
    async function fetchStores() {
      try {
        const response = await axiosInstance.get(
          `stores/${store?.business_id}/all`
        );
        if (cancelled) return;
        setStores(response.data || []);
      } catch (error) {
        console.log(error);
        if (cancelled) return;
        setError("Failed to load stores");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStores();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived filtered list
  const filtered = useMemo(() => {
    return stores.filter((store: any) => {
      // if (filterStatus !== "all" && store.status !== filterStatus) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (store?.name || "").toLowerCase().includes(q) ||
        (store?.location || "").toLowerCase().includes(q) ||
        (store?.managers?.[0]?.name || "").toLowerCase().includes(q)
      );
    });
  }, [stores, query, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages]);

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Quick actions (replace with real API calls)
  async function handleSwitchStore(store: StoreItem) {
    try {
      // Optionally call backend to set session store
      setActiveStore?.(store);
      toast.success(`Switched to ${store.name}`);
    } catch (err: any) {
      toast.error(err?.message || "Could not switch store");
    }
  }

  async function handleDeleteStore(store: StoreItem) {
    if (!confirm(`Delete "${store.name}"? This action is irreversible.`))
      return;
    try {
      // TODO: replace with real DELETE call
      const res = await fetch(`/api/stores/${store.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setStores((prev) => prev.filter((s) => s.id !== store.id));
      setOpenStore(null);
      toast.success(`${store.name} removed`);
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  }

  function handleEditStore(store: StoreItem) {
    // navigate to edit page or open modal
    window.location.href = `/dashboard/stores/${store.id}/edit`;
  }

  // Utility: display small KPI badges
  function KpiRow({
    label,
    value,
  }: {
    label: string;
    value?: number | string;
  }) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value ?? "—"}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Stores</h1>
          <p className="text-sm text-muted-foreground">
            Manage and switch between your business stores.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3">
              <Input
                placeholder="Search stores, location or manager..."
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 lg:w-[290px]"
              />
              <div className="text-muted-foreground absolute ml-3  pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
            </div>

            {/* <Select
            onValueChange={(val) => {
              setFilterStatus(val as any);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select> */}

            <div className=" flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "secondary"}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "secondary"}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Link
            href="/dashboard/stores/create"
            className="w-full md:w-auto mt-4 md:mt-0"
          >
            <Button className=" w-full ml-2">Create Store</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All stores</span>
            <span className="text-sm text-muted-foreground">
              {stores.length} total
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              <p className="mb-2">Failed to load stores</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-medium">No stores found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting filters or create a new store.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map((store: any) => (
                <div
                  key={store?.id}
                  className="border rounded-lg p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-medium">{store?.name}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          {store.location
                            ? `${store?.location} • ${store.address ?? ""}`
                            : "No address"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Created{" "}
                          {store?.created_at
                            ? formatDistanceToNowStrict(
                                new Date(store.created_at)
                              ) + " ago"
                            : "—"}
                        </div>
                      </div>

                      {/* <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            store.status === "active" ? undefined : "destructive"
                          }
                        >
                          {store.status ?? "active"}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Products
                        </div>
                        <div className="font-medium">
                          {store.total_products ?? "—"}
                        </div>
                      </div> */}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-1">
                      <KpiRow
                        label="Today's sales"
                        value={
                          getCurrencySymbol(store?.currency) +
                          store?.todays_sales?.revenue.toFixed(2)
                        }
                      />
                      <KpiRow
                        label="Low stock"
                        value={store?.stock?.low_stock_count ?? 0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setOpenStore({
                            name: store?.name,
                            id: store?.id,
                            location: store?.location,
                            created_at: store?.created_at,
                            manager: store?.managers?.[0]?.name,
                            currency: store?.currency,
                            stock: {
                              total_products: store?.stock?.total_products,
                              low_stock_count: store?.stock?.low_stock_count,
                            },
                            todays_sales: {
                              revenue: store?.todays_sales.revenue,
                              quantity: store?.todays_sales.quantity,
                            },
                          })
                        }
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditStore(store)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSwitchStore(store)}
                      >
                        Switch
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteStore(store)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List view (table)
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Low Stock</TableHead>
                    <TableHead>Today's Sales</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((store: any) => (
                    <TableRow key={store?.id}>
                      <TableCell className="font-medium">
                        {store?.name}
                      </TableCell>
                      <TableCell>{store?.location ?? "—"}</TableCell>
                      <TableCell>{store?.managers?.[0]?.name ?? "—"}</TableCell>
                      <TableCell>
                        {store?.stock?.total_products ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            store?.stock?.low_stock_count &&
                            store?.stock?.low_stock_count > 0
                              ? "secondary"
                              : undefined
                          }
                        >
                          {store?.stock?.low_stock_count ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getCurrencySymbol(store?.currency)}
                        {store?.todays_sales?.revenue?.toFixed(2) ?? 0}
                      </TableCell>
                      <TableCell colSpan={2}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setOpenStore({
                                name: store?.name,
                                id: store?.id,
                                location: store?.location,
                                created_at: store?.created_at,
                                manager: store?.managers?.[0]?.name,
                                currency: store?.currency,
                                stock: {
                                  total_products: store?.stock?.total_products,
                                  low_stock_count:
                                    store?.stock?.low_stock_count,
                                },
                                todays_sales: {
                                  revenue: store?.todays_sales.revenue,
                                  quantity: store?.todays_sales.quantity,
                                },
                              })
                            }
                          >
                            Details
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSwitchStore(store)}
                          >
                            Switch
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
                  {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <div className="px-3 text-sm">
                    Page {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Store Details Drawer */}
      <Sheet
        open={!!openStore}
        onOpenChange={(open) => {
          if (!open) setOpenStore(null);
        }}
      >
        <SheetContent className="overflow-y-auto">
          {openStore ? (
            <>
              <SheetHeader>
                <SheetTitle>{openStore.name}</SheetTitle>
              </SheetHeader>

              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {openStore.location}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Created{" "}
                      {openStore.created_at
                        ? formatDistanceToNowStrict(
                            new Date(openStore.created_at)
                          ) + " ago"
                        : "—"}
                    </div>
                  </div>

                  <div className="text-right">
                    {/* <Badge
                      variant={
                        openStore.status === "active"
                          ? undefined
                          : "destructive"
                      }
                    >
                      {openStore.status}
                    </Badge> */}
                    <div className="mt-2 text-sm">Manager</div>
                    <div className="font-medium">
                      {openStore.manager ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Today's Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-semibold">
                        {getCurrencySymbol(store?.currency)}
                        {openStore.todays_sales.revenue?.toFixed(2) ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Transactions today
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Inventory Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <KpiRow
                          label="Low stock"
                          value={openStore.stock.low_stock_count ?? 0}
                        />
                        <KpiRow
                          label="Total products"
                          value={openStore.stock.total_products ?? 0}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleSwitchStore(openStore)}
                          className="w-full"
                        >
                          Switch to this store
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEditStore(openStore)}
                          className="w-full"
                        >
                          Edit store
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteStore(openStore)}
                          className="w-full"
                        >
                          Delete store
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">More Info</h4>
                  <div className="text-sm text-muted-foreground">
                    {/* expand this section with manager contact, opening hours, address map embed, recent alerts etc */}
                    <div>
                      <strong>Currency:</strong> {openStore.currency ?? "—"}
                    </div>
                    <div>
                      <strong>Store ID:</strong> {openStore.id}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
