"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Search, Users, Mail, Phone, Eye, MessageCircle } from "lucide-react";

const customers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    avatar: "JD",
    totalPurchases: "$2,450.00",
    orderCount: 15,
    lastPurchase: "Jan 28, 2024",
    status: "Active",
    joinDate: "Mar 15, 2023",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@email.com",
    avatar: "JS",
    totalPurchases: "$1,890.50",
    orderCount: 12,
    lastPurchase: "Jan 30, 2024",
    status: "Active",
    joinDate: "Jun 22, 2023",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@email.com",
    avatar: "MJ",
    totalPurchases: "$3,200.75",
    orderCount: 23,
    lastPurchase: "Jan 29, 2024",
    status: "VIP",
    joinDate: "Jan 10, 2023",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    avatar: "SW",
    totalPurchases: "$675.25",
    orderCount: 5,
    lastPurchase: "Jan 15, 2024",
    status: "Active",
    joinDate: "Nov 8, 2023",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@email.com",
    avatar: "DB",
    totalPurchases: "$150.00",
    orderCount: 2,
    lastPurchase: "Dec 20, 2023",
    status: "Inactive",
    joinDate: "Oct 5, 2023",
  },
  {
    id: 6,
    name: "Lisa Garcia",
    email: "lisa.garcia@email.com",
    avatar: "LG",
    totalPurchases: "$4,120.00",
    orderCount: 31,
    lastPurchase: "Jan 30, 2024",
    status: "VIP",
    joinDate: "Feb 18, 2023",
  },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      Active: "default",
      VIP: "default",
      Inactive: "secondary",
    };
    const colors = {
      Active: "bg-green-100 text-green-800",
      VIP: "bg-purple-100 text-purple-800",
      Inactive: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge variant={variants[status] as any} className={colors[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-600">
            Manage customer relationships and track purchase history
          </p>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Customers
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">2,847</div>
            <p className="text-xs text-blue-600">+245 this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Customers
            </CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">2,156</div>
            <p className="text-xs text-green-600">75.7% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              VIP Customers
            </CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">187</div>
            <p className="text-xs text-purple-600">6.6% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Order Value
            </CardTitle>
            <Users className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">$125.86</div>
            <p className="text-xs text-orange-600">+$12.50 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-white shadow-none border-0">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-white shadow-none border-0">
        <CardHeader>
          <CardTitle>
            Customer List ({filteredCustomers.length} customers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Purchases</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {customer.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Joined {customer.joinDate}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="font-medium">
                    {customer.totalPurchases}
                  </TableCell>
                  <TableCell>{customer.orderCount}</TableCell>
                  <TableCell className="text-gray-600">
                    {customer.lastPurchase}
                  </TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                  {customer.avatar}
                                </AvatarFallback>
                              </Avatar>
                              {customer.name}
                            </DialogTitle>
                            <DialogDescription>
                              Customer details and purchase history
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="font-medium">Email:</span>
                              <span className="col-span-3">
                                {customer.email}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="font-medium">Status:</span>
                              <span className="col-span-3">
                                {getStatusBadge(customer.status)}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="font-medium">Total Spent:</span>
                              <span className="col-span-3 font-medium">
                                {customer.totalPurchases}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="font-medium">Orders:</span>
                              <span className="col-span-3">
                                {customer.orderCount} orders
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="font-medium">
                                Last Purchase:
                              </span>
                              <span className="col-span-3">
                                {customer.lastPurchase}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <span className="font-medium">Member Since:</span>
                              <span className="col-span-3">
                                {customer.joinDate}
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
