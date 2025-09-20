"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import useStore from "../../utils/zustand";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../utils/axiosInstance";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { getCurrencySymbol } from "../../utils/currency";
import ErrorScreen from "./ErrorScreen";

interface Transaction {
  saleId: string;
  product: string;
  amount: string;
  status: string;
}

const recentTransactions = [
  {
    id: "ORD001",
    product: "Wireless Headphones",
    amount: "$129.99",
    status: "Paid",
    date: "Jan 30",
  },
  {
    id: "ORD002",
    product: "Smart Watch",
    amount: "$299.99",
    status: "Pending",
    date: "Jan 30",
  },
  {
    id: "ORD003",
    product: "Laptop Stand",
    amount: "$49.99",
    status: "Paid",
    date: "Jan 29",
  },
  {
    id: "ORD004",
    product: "USB-C Cable",
    amount: "$19.99",
    status: "Refunded",
    date: "Jan 29",
  },
  {
    id: "ORD005",
    product: "Mouse Pad",
    amount: "$15.99",
    status: "Paid",
    date: "Jan 28",
  },
];
export function getStatusColor(status: string) {
  switch (status) {
    case "Paid":
      return "text-green-500";
    case "Pending":
      return "text-yellow-500";
    case "Low Stock":
      return "text-yellow-500";
    case "Refunded":
      return "text-red-500";
    case "Out of Stock":
      return "text-red-500";
    default:
      "";
  }
}

export default function RecentTransactions() {
  const { getActiveStore } = useStore();
  const store = getActiveStore();
  const queryClient = useQueryClient();

  async function fetchRecentTransaction() {
    try {
      const response = await axiosInstance.get(
        `/analytics/sales-latest/${store?.store_id}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  function handleRetry() {
    queryClient.invalidateQueries({
      queryKey: ["sales-latest", store?.store_id],
    });
  }

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["sales-latest", store?.store_id],
    queryFn: fetchRecentTransaction,
    enabled: !!store?.store_id,
  });

  const recentTransactions = data ?? [];

  if (isLoading) {
    return <Skeleton className="h-[380px]" />;
  }

  if (error) {
    return <ErrorScreen handleRetry={refetch} />;
  }
  return (
    <Card className="flex ">
      <CardHeader>
        <CardTitle>Latest Sales Transactions</CardTitle>
        <CardDescription>Recent order activity</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {recentTransactions.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction: Transaction) => (
                <TableRow key={transaction.saleId}>
                  <TableCell className="font-medium">
                    {transaction.saleId}
                  </TableCell>
                  <TableCell>{transaction.product}</TableCell>
                  <TableCell>
                    {getCurrencySymbol(store?.currency as string)}
                    {transaction.amount}
                  </TableCell>
                  <TableCell>
                    {/* <Badge
                        variant={
                          transaction.status === "Paid"
                            ? "default"
                            : transaction.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {transaction.status}
                      </Badge> */}
                    <span
                      className={`${getStatusColor(
                        transaction.status
                      )} font-medium`}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="lg:flex-1 flex items-center justify-center text-muted-foreground h-40 text-sm lg:p-10">
            No recent transactions data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
