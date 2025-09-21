import { Plus } from "lucide-react";
import PageHeader from "./PageHeader";
import SaleKPI from "./SaleKPI";
import TrendingSales from "./TrendingSales";
import { Button } from "./ui/button";
import SaleTable from "./SaleTable";
import Link from "next/link";

export default function SalesPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}

      <div className="flex md:justify-between md:items-center flex-col md:flex-row gap-6 md:gap-0">
        <PageHeader
          title="Sales Overview"
          subtitle="Track sales performance and manage transactions"
        />
        <div className="w-full md:w-fit">
          <Link href="/dashboard/sales/create">
            <Button className="w-full">
              <Plus />
              Create Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Sales KPIs */}
      <SaleKPI />

      {/* Sales Chart */}
      <TrendingSales />

      {/* Transactions Table */}
      <SaleTable />
    </div>
  );
}
