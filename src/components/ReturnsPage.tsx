"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axiosInstance from "../../utils/axiosInstance";
import { Trash2, Check, X, PlusSquare, RefreshCcw } from "lucide-react";
import Spinner from "./Spinner";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "./PageHeader";
import { Switch } from "./ui/switch";
import useStore from "../../utils/zustand";
import { success } from "zod";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { getStatusClasses } from "./SaleTable";
interface ReturnPolicyFormProps {
  setPolicyForm: (policy: any) => void;
  setPolicy: (policy: any) => void;
  setDisplayPolicyForm: (displayPolicyForm: any) => void;
}
type ReturnResolution = "refund" | "exchange" | "store_credit";
type ReturnStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "refunded"
  | "exchanged"
  | "credited";

type ReturnRow = {
  id: string;
  sale_id: string;
  sale_item_id: string;
  reason?: string;
  resolution: ReturnResolution;
  status: ReturnStatus;
  quantity: number;
  staff_id?: string;
  manager_id?: string;
  created_at: string;
  sale_item?: {
    id: string;
    variant_id: string;
    name?: string;
    unit_price: number;
    quantity: number;
  };
  sale?: {
    id: string;
    net_amount: number;
    payment_method?: string;
    customer_id?: string;
    store_id?: string;
  };
  exchanges?: Array<{
    id: string;
    new_product_variant_id: string;
    price_difference: number;
  }>;
  refunds?: Array<{ id: string; amount: number; status: string }>;
};

type StoreCredit = {
  id: string;
  customer_id: string;
  return_id: string;
  amount: number;
  used_amount: number;
  status: string;
  created_at: string;
};

type Policy = {
  daysAllowed: number;
  allowRefund: boolean;
  allowExchange: boolean;
  allowStoreCredit: boolean;
  requireReceipt: boolean;
  restockingFee: number;
  maxItemsPerReturn: number;
  notes: string;
};

export default function ReturnsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setsaving] = useState<boolean>(false);
  const [loadingReturns, setLoadingReturns] = useState<boolean>(false);
  const { getActiveStore, appStore } = useStore();
  const store = getActiveStore();
  const [returns, setReturns] = useState<ReturnRow[]>([]);
  const [credits, setCredits] = useState<StoreCredit[]>([]);
  const [displayPolicyForm, setDisplayPolicyForm] = useState<boolean>(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editing, setEditing] = useState(false);

  const initialPolicy: Policy = {
    daysAllowed: 14,
    allowRefund: true,
    allowExchange: true,
    allowStoreCredit: true,
    requireReceipt: true,
    restockingFee: 0,
    maxItemsPerReturn: 5,
    notes: "",
  };

  const [policy, setPolicy] = useState<Policy>(initialPolicy);
  const [policyForm, setPolicyForm] = useState<Policy>({ ...initialPolicy });

  useEffect(() => {
    const init = async () => {
      try {
        const { onSuccess } = await fetchPolicy();
        if (!onSuccess) {
          setDisplayPolicyForm(true);
          return;
        }
        fetchAll();
        fetchCredits();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [displayPolicyForm]);

  const fetchAll = async () => {
    setLoadingReturns(true);
    try {
      const res = await axiosInstance.get(`/returns/${store?.storeId}`);
      setReturns(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load returns");
    } finally {
      setLoadingReturns(false);
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await axiosInstance.get(
        `/returns/store-credits/${store?.storeId}`
      );
      setCredits(res.data || []);
    } catch (err: any) {
      // don't block
    }
  };

  const fetchPolicy = async () => {
    try {
      const res = await axiosInstance.get(`/returns/policy/${store?.storeId}`);
      const data = res.data;
      if (data?.policy) {
        setPolicyForm({
          daysAllowed: data.policy.days_allowed,
          allowRefund: data.policy.allow_refund,
          allowExchange: data.policy.allow_exchange,
          allowStoreCredit: data.policy.allow_store_credit,
          requireReceipt: data.policy.require_reciept,
          restockingFee: data.policy.restocking_fee,
          maxItemsPerReturn: data.policy.max_items_per_return,
          notes: data.policy.notes,
        });
        setPolicy({
          daysAllowed: data.policy.days_allowed,
          allowRefund: data.policy.allow_refund,
          allowExchange: data.policy.allow_exchange,
          allowStoreCredit: data.policy.allow_store_credit,
          requireReceipt: data.policy.require_reciept,
          restockingFee: data.policy.restocking_fee,
          maxItemsPerReturn: data.policy.max_items_per_return,
          notes: data.policy.notes,
        });
      }
      return { data, onSuccess: true };
    } catch (error: any) {
      const status = error?.response?.data?.statusCode;
      if (status === 404) {
        return { onSuccess: false, data: null };
      } else {
        return {};
      }
    }
  };

  const filtered = useMemo(() => {
    return returns.filter((r: any) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const si = r.saleItem?.productVariant?.name;
      return (
        si.toLowerCase().includes(q) ||
        (r.reason ?? "").toLowerCase().includes(q)
      );
    });
  }, [returns, filterStatus, search]);

  const update = (field: string, value: any) => {
    setPolicyForm((prev) => ({ ...prev, [field]: value }));
  };

  const savePolicy = async () => {
    const toastId = toast.loading("Updating return policy");
    try {
      setsaving(true);
      const res = await axiosInstance.patch(
        `/returns/policy/${store?.storeId}`,
        policyForm
      );
      const data = res.data;
      const newPolicy = {
        daysAllowed: data?.days_allowed,
        allowRefund: data?.allow_refund,
        allowExchange: data?.allow_exchange,
        allowStoreCredit: data?.allow_store_credit,
        requireReceipt: data?.require_receipt,
        restockingFee: data?.restocking_fee,
        maxItemsPerReturn: data?.max_items_per_return,
        notes: data?.notes,
      };
      setPolicyForm(newPolicy);
      setPolicy(newPolicy);
      setEditing(false);
      toast.success("Return policy updated successfully", {
        id: toastId,
      });
    } catch (error: any) {
      const status = error?.response?.data?.statusCode;

      if (status === 404) {
        toast.error(error?.response?.data?.message || error.message, {
          id: toastId,
        });
      } else {
        toast.error(error?.response?.data?.message || error.message, {
          id: toastId,
        });
      }
    } finally {
      setsaving(false);
    }
  };
  const toggleSelect = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const approveSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("No returns selected");
      return;
    }
    const toastId = toast.loading("Approving selected returns");
    setProcessing(true);
    try {
      const payload = {
        returnIds: selectedIds,
        approve: true,
        storeId: store?.storeId,
        managerId: appStore.user?.id,
      };
      const res = await axiosInstance.post("/returns/review", payload);
      toast.success("Selected returns approved", { id: toastId });
      // refresh
      await fetchAll();
      setSelected({});
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve returns", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const rejectSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("No returns selected");
      return;
    }
    setProcessing(true);
    try {
      const payload = {
        returnIds: selectedIds,
        approve: false,
        managerId: "manager_local",
      };
      await axiosInstance.post("/api/returns/review", payload);
      toast.success("Selected returns rejected");
      await fetchAll();
      setSelected({});
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject returns");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this return? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/api/returns/${id}`);
      toast.success("Return deleted");
      setReturns((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete return");
    }
  };

  if (loading) {
    return <p>loading</p>;
  }

  if (displayPolicyForm) {
    return (
      <ReturnPolicyForm
        setPolicyForm={setPolicyForm}
        setPolicy={setPolicy}
        setDisplayPolicyForm={setDisplayPolicyForm}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "dark:text-yellow-300 text-yellow-600";

      case "approved":
        return "dark:text-green-300 text-green-600";

      case "rejected":
        return "dark:text-red-300 text-red-600";

      case "refunded":
        return "dark:text-amber-300 text-amber-600";

      case "exchanged":
        return "dark:text-blue-300 text-blue-600";

      case "store Credit":
        return "dark:text-purple-300 text-purple-600";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Returns & Refunds"
          subtitle="Manage customer returns, refunds and store credits."
        />
        <div className="flex items-center gap-2 w-full md:w-fit">
          <Link href={`/dashboard/returns/create`} className="flex-1 md:flex-0">
            <Button
              variant="default"
              className=" w-full flex items-center gap-2"
            >
              <PlusSquare className="w-4 h-4" /> Create Return
            </Button>
          </Link>

          <Button
            variant="secondary"
            onClick={() => fetchAll()}
            title="refresh"
            className="flex-1 md:flex-0"
          >
            <RefreshCcw className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by item, reason or return id..."
                />
                <Select
                  onValueChange={(v) => setFilterStatus(v)}
                  defaultValue="all"
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="exchanged">Exchanged</SelectItem>
                    <SelectItem value="credited">Store Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full md:w-fit mt-4 md:mt-0">
                <Button
                  onClick={approveSelected}
                  disabled={processing || selectedIds.length === 0}
                  className="flex-1 md:flex-0"
                >
                  {processing ? (
                    <Spinner />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Approve
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={rejectSelected}
                  disabled={processing || selectedIds.length === 0}
                  className="flex-1 md:flex-0"
                >
                  {processing ? (
                    <Spinner />
                  ) : (
                    <>
                      <X className="w-4 h-4" /> Reject
                    </>
                  )}
                </Button>
              </div>
            </div>

            {loadingReturns ? (
              <div className="py-16 flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Resolution</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="w-8">
                          <Input
                            type="checkbox"
                            checked={!!selected[r.id]}
                            onChange={() => toggleSelect(r.id)}
                            disabled={[
                              "approved",
                              "refunded",
                              "rejected",
                              "exchanged",
                              "store credit",
                            ].includes(r.status)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image
                              src={r?.saleItem?.productVariant?.image_url}
                              alt={r.saleItem?.productVariant.name}
                              width={600}
                              height={400}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <span className="font-medium truncate">
                              {r.saleItem?.productVariant?.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {r.resolution}
                        </TableCell>
                        <TableCell
                          className={`capitalize ${getStatusClasses(r.status)}`}
                        >
                          {r.status}
                        </TableCell>
                        <TableCell>{r.quantity}</TableCell>
                        <TableCell>
                          <span>
                            {r?.created_at
                              ? format(new Date(r.created_at), "MMMM dd, yyyy")
                              : ""}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(r.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No returns found.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Credits</CardTitle>
            </CardHeader>
            <CardContent>
              {credits.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active store credits.
                </p>
              ) : (
                <div className="space-y-3">
                  {credits.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          Credit: {c.id.slice(0, 8)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Customer: {c.customer_id}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ₵{c.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Return Policy
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                These rules apply to all returns and exchanges for this store.
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {!editing ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Return Window
                      </span>
                      <span className="font-medium ">
                        {policyForm.daysAllowed} days
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Require Receipt
                      </span>
                      <Badge
                        variant={
                          policyForm.requireReceipt ? "default" : "secondary"
                        }
                      >
                        {policyForm.requireReceipt ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Allow Refund
                      </span>
                      <Badge
                        variant={
                          policyForm.allowRefund ? "default" : "secondary"
                        }
                      >
                        {policyForm.allowRefund ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Allow Exchange
                      </span>
                      <Badge
                        variant={
                          policyForm.allowExchange ? "default" : "secondary"
                        }
                      >
                        {policyForm.allowExchange ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Allow Store Credit
                      </span>
                      <Badge
                        variant={
                          policyForm.allowStoreCredit ? "default" : "secondary"
                        }
                      >
                        {policyForm.allowStoreCredit ? "Yes" : "No"}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Restocking Fee
                      </span>
                      <span className="font-medium">
                        {policyForm.restockingFee}%
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Max Items Per Return
                      </span>
                      <span className="font-medium">
                        {policyForm.maxItemsPerReturn}
                      </span>
                    </div>
                  </div>

                  {policyForm.notes && (
                    <div className="pt-2 border-t">
                      <span className="block text-muted-foreground text-sm mb-1">
                        Additional Notes
                      </span>
                      <p className="text-sm leading-relaxed">
                        {policyForm.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={() => setEditing(true)}>
                      Edit Policy
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-6 text-sm">
                    <div>
                      <Label>Return Window (days)</Label>
                      <p className="text-xs text-muted-foreground my-2">
                        The number of days after purchase that customers are
                        allowed to return items.
                      </p>
                      <Input
                        type="number"
                        value={policyForm.daysAllowed}
                        onChange={(e) =>
                          update("daysAllowed", Number(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <Label>Require Receipt</Label>
                      <p className="text-xs text-muted-foreground my-2">
                        Customers must present their purchase receipt to qualify
                        for a return.
                      </p>
                      <Switch
                        checked={policyForm.requireReceipt}
                        onCheckedChange={(v) => update("requireReceipt", v)}
                      />
                    </div>

                    <div>
                      <Label>Allow Refund</Label>
                      <p className="text-xs text-muted-foreground my-2">
                        Determines if customers can get their money back for
                        returned items.
                      </p>
                      <Switch
                        checked={policyForm.allowRefund}
                        onCheckedChange={(v) => update("allowRefund", v)}
                      />
                    </div>

                    <div>
                      <Label>Allow Exchange</Label>
                      <p className="text-xs text-muted-foreground my-2">
                        Allows customers to swap returned items for different
                        products.
                      </p>
                      <Switch
                        checked={policyForm.allowExchange}
                        onCheckedChange={(v) => update("allowExchange", v)}
                      />
                    </div>

                    <div>
                      <Label>Allow Store Credit</Label>
                      <p className="text-xs text-muted-foreground my-2">
                        Instead of cash refunds, customers can receive credit to
                        use in future purchases.
                      </p>
                      <Switch
                        checked={policyForm.allowStoreCredit}
                        onCheckedChange={(v) => update("allowStoreCredit", v)}
                      />
                    </div>

                    <div>
                      <Label>Restocking Fee (%)</Label>
                      <p className="text-xs text-muted-foreground my-2">
                        A percentage deducted from the refund to cover
                        restocking costs (e.g., 10%).
                      </p>
                      <Input
                        type="number"
                        value={policyForm.restockingFee}
                        onChange={(e) =>
                          update("restockingFee", Number(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <Label>Max Items Per Return</Label>
                      <p className="text-xs text-muted-foreground my-2">
                        The maximum number of items a customer can return in a
                        single transaction.
                      </p>
                      <Input
                        type="number"
                        value={policyForm.maxItemsPerReturn}
                        onChange={(e) =>
                          update("maxItemsPerReturn", Number(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <Label>Additional Notes</Label>
                      <p className="text-xs text-muted-foreground my-2">
                        Any extra rules or instructions (e.g., items must be
                        unopened).
                      </p>
                      <Textarea
                        value={policyForm.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        placeholder="E.g., Items must be unused and in original packaging..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      disabled={saving}
                      onClick={() => {
                        setEditing(false);
                        setPolicyForm(policy);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={savePolicy} disabled={saving}>
                      {saving ? (
                        <>
                          <Spinner /> Saving
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ReturnPolicyForm({
  setDisplayPolicyForm,
  setPolicy,
  setPolicyForm,
}: ReturnPolicyFormProps) {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const [form, setForm] = useState({
    daysAllowed: 14,
    allowRefund: true,
    allowExchange: true,
    allowStoreCredit: true,
    requireReceipt: true,
    restockingFee: 0,
    maxItemsPerReturn: 5,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const toastId = toast.loading("Setting up store return policy");
    try {
      const res = await axiosInstance.post("/returns/policy/create", {
        ...form,
        storeId: store?.storeId,
      });
      const data = res.data;
      toast.success("Return policy created successfully", {
        id: toastId,
      });
      if (res.data.onSuccess) {
        const newPolicy = {
          daysAllowed: data.policy.days_allowed,
          allowRefund: data.policy.allow_refund,
          allowExchange: data.policy.allow_exchange,
          allowStoreCredit: data.policy.allow_store_credit,
          requireReceipt: data.policy.require_receipt,
          restockingFee: data.policy.restocking_fee,
          maxItemsPerReturn: data.policy.max_items_per_return,
          notes: data.policy.notes,
        };
        setPolicyForm(newPolicy);
        setPolicy(newPolicy);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create return policy", {
        id: toastId,
      });
    } finally {
      setSaving(false);
      setDisplayPolicyForm(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="w-full max-w-3xl mx-auto shadow-lg border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Create Return Policy
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Define your store’s rules for handling returns, exchanges, and
            refunds.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Days Allowed */}
          <div className="grid gap-2">
            <Label>Return Window (days)</Label>
            <Input
              type="number"
              min={1}
              value={form.daysAllowed}
              onChange={(e) => update("daysAllowed", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Customers can return items within this window.
            </p>
          </div>

          {/* Toggles */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div>
                <Label className="font-medium">Allow Refunds</Label>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Customers can get their money back.
                </p>
              </div>
              <Switch
                checked={form.allowRefund}
                onCheckedChange={(v) => update("allowRefund", v)}
              />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div>
                <Label className="font-medium">Allow Exchanges</Label>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Customers can swap items for another variant.
                </p>
              </div>
              <Switch
                checked={form.allowExchange}
                onCheckedChange={(v) => update("allowExchange", v)}
              />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div>
                <Label className="font-medium">Allow Store Credit</Label>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Credit can be applied for future purchases.
                </p>
              </div>
              <Switch
                checked={form.allowStoreCredit}
                onCheckedChange={(v) => update("allowStoreCredit", v)}
              />
            </div>

            <div className="flex items-center justify-between border p-3 rounded-lg">
              <div>
                <Label className="font-medium">Require Receipt</Label>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Proof of purchase must be shown.
                </p>
              </div>
              <Switch
                checked={form.requireReceipt}
                onCheckedChange={(v) => update("requireReceipt", v)}
              />
            </div>
          </div>

          {/* Restocking Fee */}
          <div className="grid gap-2">
            <Label>Restocking Fee (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.restockingFee}
              onChange={(e) => update("restockingFee", Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              A percentage deducted from refund amount. Set to 0 for none.
            </p>
          </div>

          {/* Max items per return */}
          <div className="grid gap-2">
            <Label>Max Items Per Return</Label>
            <Input
              type="number"
              min={1}
              value={form.maxItemsPerReturn}
              onChange={(e) =>
                update("maxItemsPerReturn", Number(e.target.value))
              }
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Limit how many items can be returned in a single request.
            </p>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="E.g., Items must be unused and returned with original packaging..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>

          {/* Save */}
          <Button
            className="w-full md:w-auto"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner /> Saving...
              </>
            ) : (
              "Save Policy"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
