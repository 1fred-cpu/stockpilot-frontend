"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Plus,
} from "lucide-react";
import PageHeader from "./PageHeader";
import SaleKPI from "./SaleKPI";
import { useTheme } from "next-themes";
import TrendingSales from "./TrendingSales";
import { Button } from "./ui/button";

const transactions = [
  {
    id: "ORD-001",
    product: "Wireless Headphones",
    customer: "John Doe",
    quantity: 2,
    amount: "$259.98",
    date: "Jan 30, 2024",
    status: "Paid",
  },
  {
    id: "ORD-002",
    product: "Smart Watch",
    customer: "Jane Smith",
    quantity: 1,
    amount: "$299.99",
    date: "Jan 30, 2024",
    status: "Pending",
  },
  {
    id: "ORD-003",
    product: "Laptop Stand",
    customer: "Mike Johnson",
    quantity: 3,
    amount: "$149.97",
    date: "Jan 29, 2024",
    status: "Paid",
  },
  {
    id: "ORD-004",
    product: "USB-C Cable",
    customer: "Sarah Wilson",
    quantity: 5,
    amount: "$99.95",
    date: "Jan 29, 2024",
    status: "Refunded",
  },
  {
    id: "ORD-005",
    product: "Mouse Pad",
    customer: "David Brown",
    quantity: 1,
    amount: "$24.99",
    date: "Jan 28, 2024",
    status: "Paid",
  },
  {
    id: "ORD-006",
    product: "Phone Case",
    customer: "Lisa Garcia",
    quantity: 2,
    amount: "$49.98",
    date: "Jan 28, 2024",
    status: "Shipped",
  },
  {
    id: "ORD-007",
    product: "Bluetooth Speaker",
    customer: "Tom Anderson",
    quantity: 1,
    amount: "$79.99",
    date: "Jan 27, 2024",
    status: "Paid",
  },
];

export default function SalesPage() {
  const [viewMode, setViewMode] = useState("daily");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTransactions = transactions.filter((transaction) => {
    if (statusFilter === "all") return true;
    return transaction.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      Paid: "default",
      Pending: "secondary",
      Shipped: "outline",
      Refunded: "destructive",
    };
    switch (status) {
      case "Paid":
        return <span className="text-primary font-medium">Paid</span>;
      case "Pending":
        return <span className="text-warning font-medium">Pending</span>;
      case "Shipped":
        return <span className="text-green-600 font-medium">Shipped</span>;
      case "Refunded":
        return <span className="text-destructive font-medium">Refunded</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}

      <div className="flex md:justify-between md:items-center flex-col md:flex-row gap-6 md:gap-0">
        <PageHeader
          title="Sales Overview"
          subtitle="Track sales performance and manage transactions"
        />
        <div className="w-full md:w-fit">
          <Button className="w-full">
            <Plus />
            Create Sale
          </Button>
        </div>
      </div>

      {/* Sales KPIs */}
      <SaleKPI />

      {/* Sales Chart */}
      <TrendingSales />

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Transactions</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">
                    {transaction.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.product}
                  </TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell className="font-medium">
                    {transaction.amount}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {transaction.date}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
