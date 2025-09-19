"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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
import { TrendingUp, DollarSign, ShoppingCart, Calendar } from "lucide-react";

const salesTrendData = [
  { date: "Week 1", daily: 3200, weekly: 22400, monthly: 89600 },
  { date: "Week 2", daily: 4100, weekly: 28700, monthly: 114800 },
  { date: "Week 3", daily: 3800, weekly: 26600, monthly: 106400 },
  { date: "Week 4", daily: 4500, weekly: 31500, monthly: 126000 },
];

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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Sales Overview
          </h1>
          <p className="text-gray-600">
            Track sales performance and manage transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sales KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">$87,456</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              +15.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">1,247</div>
            <p className="text-xs text-blue-600">+89 orders this week</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">$70.15</div>
            <p className="text-xs text-purple-600">+5.2% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card className="bg-white shadow-none border-0">
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `$${value}`,
                    viewMode.charAt(0).toUpperCase() + viewMode.slice(1),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey={viewMode}
                  stroke="#6122f4"
                  strokeWidth={3}
                  dot={{ fill: "#2563EB", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-white shadow-none border-0">
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
                  <TableCell className="text-gray-600">
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
