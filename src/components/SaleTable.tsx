"use client";
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import ErrorScreen from "./ErrorScreen";
import { getCurrencySymbol } from "../../utils/currency";

export default function SaleTable() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const { getActiveStore } = useStore();
  const store = getActiveStore();

  async function fetchSalesByDate() {
    try {
      const response = await axiosInstance.get(
        `/sales/stores/${store?.storeId}?date=${selectedDate?.toISOString()}`
      );
      return await response.data;
    } catch (error) {
      throw error;
    }
  }
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["sales-by-date", store?.storeId],
    queryFn: fetchSalesByDate,
    enabled: !!store?.storeId,
    refetchOnWindowFocus: false,
  });

  const transactions = data?.saleItems || [];

  // Filter transactions by  search, and date
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction: any) => {
      const matchesStatus = statusFilter === "all";
      // transaction.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesSearch = transaction?.productVariant?.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesDate = selectedDate
        ? format(new Date(transaction.createdAt), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd")
        : true;

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [statusFilter, searchTerm, selectedDate, data]);

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum: number, transaction: any) => {
      const num = transaction?.totalPrice;
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [filteredTransactions]);

  if (isLoading) {
    return <Skeleton className="h-[380px] p-5" />;
  }
  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <CardTitle className="w-full md:w-fit mb-4">
            Recent Transactions
          </CardTitle>

          <div className="flex justify-between md:justify-start items-center gap-3  w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 flex-1 md:flex-0 md:w-[100px] lg:w-[200px]"
              />
            </div>

            {/* Status Filter */}
            {/* <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            </Select> */}

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 w-fit md:w-[150px]  justify-start"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "MMM dd, yyyy")
                  ) : (
                    <span>Select date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Total Revenue */}
        <div className="mb-4 text-sm text-muted-foreground">
          Total Revenue:{" "}
          <span className="font-semibold text-foreground">
            {getCurrencySymbol(store?.currency)}
            {totalRevenue.toFixed(2)}
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Date</TableHead>
              {/* <TableHead>Status</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction: any) => (
              <TableRow
                key={transaction?.saleId + transaction?.productVariant?.id}
              >
                <TableCell className="font-mono text-sm">
                  {transaction?.reference || transaction?.sale_id}
                </TableCell>

                <TableCell className="font-medium">
                  {transaction?.productVariant?.productName}
                </TableCell>

                <TableCell className="font-medium">
                  {transaction?.productVariant?.name}
                </TableCell>

                <TableCell>{transaction?.customer}</TableCell>

                <TableCell>{transaction?.quantity}</TableCell>
                <TableCell className="font-medium">
                  {transaction?.unitPrice?.toFixed(2)}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction?.totalPrice?.toFixed(2)}
                </TableCell>
                <TableCell className="font-medium">
                  {transaction?.paymentMethod}
                </TableCell>
                <TableCell className="text-foreground">
                  {transaction?.createdAt
                    ? format(new Date(transaction.createdAt), "MMM dd, yyyy")
                    : null}
                </TableCell>
                {/* <TableCell>{getStatusBadge(transaction.status)}</TableCell> */}
              </TableRow>
            ))}

            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-10 "
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
