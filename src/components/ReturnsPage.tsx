"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Trash2, Check, X, PlusSquare } from "lucide-react";
import Spinner from "./Spinner";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "./PageHeader";

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

export default function ReturnsPage() {
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<ReturnRow[]>([]);
  const [credits, setCredits] = useState<StoreCredit[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [policy, setPolicy] = useState<{
    windowDays: number;
    allowDamaged: boolean;
  } | null>(null);
  const [editingPolicy, setEditingPolicy] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    windowDays: 14,
    allowDamaged: true,
  });

  useEffect(() => {
    fetchAll();
    fetchCredits();
    fetchPolicy();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/returns");
      setReturns(res.data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await axiosInstance.get("/api/store-credits");
      setCredits(res.data || []);
    } catch (err: any) {
      // don't block
    }
  };

  const fetchPolicy = async () => {
    try {
      const res = await axiosInstance.get("/api/return-policy");
      setPolicy(res.data ?? { windowDays: 14, allowDamaged: true });
      setPolicyForm(res.data ?? { windowDays: 14, allowDamaged: true });
    } catch (err) {
      // fallback
      setPolicy({ windowDays: 14, allowDamaged: true });
      setPolicyForm({ windowDays: 14, allowDamaged: true });
    }
  };

  const filtered = useMemo(() => {
    return returns.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      const si = r.sale_item?.name ?? r.sale_item?.variant_id ?? "";
      return (
        si.toLowerCase().includes(q) ||
        (r.reason ?? "").toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [returns, filterStatus, search]);

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
    setProcessing(true);
    try {
      const payload = {
        returnIds: selectedIds,
        approve: true,
        managerId: "manager_local", // replace with auth user
      };
      const res = await axiosInstance.post("/api/returns/review", payload);
      toast.success("Selected returns approved");
      // refresh
      await fetchAll();
      setSelected({});
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve returns");
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

  const savePolicy = async () => {
    try {
      setEditingPolicy(false);
      await axiosInstance.patch("/api/return-policy", policyForm);
      setPolicy(policyForm);
      toast.success("Return policy updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update policy");
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
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="flex-1 md:flex-0 flex items-center gap-2"
              >
                <PlusSquare className="w-4 h-4" /> Create Return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <CreateReturnForm
                onCreated={() => {
                  setShowCreate(false);
                  fetchAll();
                }}
                onCancel={() => setShowCreate(false)}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="secondary"
            onClick={() => fetchAll()}
            className="flex-1 md:flex-0"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="md:col-span-2">
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

              <div className="flex items-center gap-2">
                <Button
                  onClick={approveSelected}
                  disabled={processing || selectedIds.length === 0}
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

            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Resolution</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="w-8">
                          <Input
                            type="checkbox"
                            checked={!!selected[r.id]}
                            onChange={() => toggleSelect(r.id)}
                          />
                        </TableCell>
                        <TableCell>{r.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {r.sale_item?.name ?? r.sale_item?.variant_id}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {r.sale_item?.variant_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {r.resolution}
                        </TableCell>
                        <TableCell className="capitalize">{r.status}</TableCell>
                        <TableCell>{r.quantity}</TableCell>
                        <TableCell>
                          {new Date(r.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                /* open detail later */
                              }}
                            >
                              Details
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
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
              <CardTitle>Return Policy</CardTitle>
            </CardHeader>
            <CardContent>
              {!policy ? (
                <div>Loading policy...</div>
              ) : (
                <div className="space-y-3">
                  {!editingPolicy ? (
                    <>
                      <div className="text-sm">
                        Return window: <strong>{policy.windowDays} days</strong>
                      </div>
                      <div className="text-sm">
                        Accept damaged items:{" "}
                        <strong>{policy.allowDamaged ? "Yes" : "No"}</strong>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button onClick={() => setEditingPolicy(true)}>
                          Edit Policy
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-2">
                        <Label>Return window (days)</Label>
                        <Input
                          type="number"
                          value={String(policyForm.windowDays)}
                          onChange={(e) =>
                            setPolicyForm((p) => ({
                              ...p,
                              windowDays: Number(e.target.value),
                            }))
                          }
                        />
                        <Label>Allow damaged returns</Label>
                        <Select
                          onValueChange={(v) =>
                            setPolicyForm((p) => ({
                              ...p,
                              allowDamaged: v === "true",
                            }))
                          }
                          defaultValue={String(policyForm.allowDamaged)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button onClick={savePolicy}>Save</Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingPolicy(false);
                            setPolicyForm(policy!);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------
   CreateReturnForm component
   ---------------------------- */

function CreateReturnForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [saleId, setSaleId] = useState("");
  const [items, setItems] = useState<
    Array<{
      saleItemId: string;
      reason: string;
      resolution: ReturnResolution;
      quantity?: number;
      exchanges?: { newProductVariantId: string }[];
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  const addLine = () => {
    setItems((s) => [
      ...s,
      { saleItemId: "", reason: "", resolution: "refund", quantity: 1 },
    ]);
  };

  const removeLine = (idx: number) => {
    setItems((s) => s.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, patch: Partial<(typeof items)[number]>) => {
    setItems((s) => s.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const submit = async () => {
    if (!saleId) {
      toast.error("Enter sale id");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one return item");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        saleId,
        items: items.map((it) => ({
          saleItemId: it.saleItemId,
          reason: it.reason,
          resolution: it.resolution,
          quantity: it.quantity,
          exchanges: it.exchanges,
        })),
        staffId: "staff_local",
      };
      await axiosInstance.post("/api/returns", payload);
      toast.success("Return created");
      onCreated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create return");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Create Return</h3>
      <div className="grid gap-2">
        <Label>Sale ID</Label>
        <Input
          value={saleId}
          onChange={(e) => setSaleId(e.target.value)}
          placeholder="Enter sale id (scan or paste)"
        />
      </div>

      <div className="space-y-3">
        {items.map((it, idx) => (
          <Card key={idx}>
            <CardContent className="space-y-3">
              <div className="grid gap-2 md:grid-cols-3">
                <div>
                  <Label>Sale Item ID</Label>
                  <Input
                    value={it.saleItemId}
                    onChange={(e) =>
                      updateLine(idx, { saleItemId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={String(it.quantity ?? 1)}
                    onChange={(e) =>
                      updateLine(idx, { quantity: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Resolution</Label>
                  <Select
                    onValueChange={(v) =>
                      updateLine(idx, { resolution: v as ReturnResolution })
                    }
                    defaultValue={it.resolution}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="exchange">Exchange</SelectItem>
                      <SelectItem value="store_credit">Store Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea
                  value={it.reason}
                  onChange={(e) => updateLine(idx, { reason: e.target.value })}
                />
              </div>
              {it.resolution === "exchange" && (
                <div className="space-y-2">
                  <Label>Exchange Items (new variant ids)</Label>
                  {(it.exchanges ?? []).map((ex, exIdx) => (
                    <div key={exIdx} className="flex gap-2">
                      <Input
                        value={ex.newProductVariantId}
                        onChange={(e) => {
                          const copy = (it.exchanges ?? []).slice();
                          copy[exIdx] = { newProductVariantId: e.target.value };
                          updateLine(idx, { exchanges: copy });
                        }}
                      />
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const copy = (it.exchanges ?? []).slice();
                          copy.splice(exIdx, 1);
                          updateLine(idx, { exchanges: copy });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() =>
                      updateLine(idx, {
                        exchanges: [
                          ...(it.exchanges ?? []),
                          { newProductVariantId: "" },
                        ],
                      })
                    }
                  >
                    Add Exchange Item
                  </Button>
                </div>
              )}{" "}
            </CardContent>
          </Card>
        ))}{" "}
      </div>
    </div>
  );
}
