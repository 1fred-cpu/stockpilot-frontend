"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp, Users, ShoppingBag, Target } from "lucide-react";

const salesByCategory = [
  { name: "Electronics", value: 45, revenue: 125430, color: "#6122f4" },
  { name: "Accessories", value: 30, revenue: 87200, color: "#10B981" },
  { name: "Cables", value: 15, revenue: 43100, color: "#F59E0B" },
  { name: "Storage", value: 10, revenue: 28900, color: "#EF4444" },
];

const revenueByMonth = [
  { month: "Jul", revenue: 45000, orders: 320 },
  { month: "Aug", revenue: 52000, orders: 410 },
  { month: "Sep", revenue: 48000, orders: 380 },
  { month: "Oct", revenue: 61000, orders: 450 },
  { month: "Nov", revenue: 55000, orders: 420 },
  { month: "Dec", revenue: 67000, orders: 510 },
  { month: "Jan", revenue: 73000, orders: 580 },
];

const conversionFunnel = [
  { stage: "Visitors", count: 10000, percentage: 100 },
  { stage: "Product Views", count: 7500, percentage: 75 },
  { stage: "Add to Cart", count: 3000, percentage: 30 },
  { stage: "Checkout", count: 1200, percentage: 12 },
  { stage: "Purchase", count: 900, percentage: 9 },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Detailed insights into your business performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversion Rate
            </CardTitle>
            <Target className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">9.2%</div>
            <p className="text-xs text-green-600">+1.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Customers
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">2,847</div>
            <p className="text-xs text-blue-600">+245 new this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Repeat Purchase Rate
            </CardTitle>
            <ShoppingBag className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">34.6%</div>
            <p className="text-xs text-purple-600">+2.8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Customer Lifetime Value
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">$287</div>
            <p className="text-xs text-orange-600">+$23 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category Pie Chart */}
        <Card className="bg-white shadow-none border-0">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Sales Share"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {salesByCategory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    ${entry.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Month Bar Chart */}
        <Card className="bg-white shadow-none border-0">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 7 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#6122f4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="bg-white shadow-none border-0">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700">
                  {stage.stage}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-background rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-20">
                      {stage.percentage}%
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-24">
                      {stage.count.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Summary */}
      <Card className="bg-white shadow-none border-0">
        <CardHeader>
          <CardTitle>Monthly Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">$73,000</div>
              <div className="text-sm text-gray-600">This Month's Revenue</div>
              <div className="text-xs text-green-600 mt-1">
                +12.5% vs last month
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">580</div>
              <div className="text-sm text-gray-600">Total Orders</div>
              <div className="text-xs text-blue-600 mt-1">
                +8.9% vs last month
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">$125.86</div>
              <div className="text-sm text-gray-600">Average Order Value</div>
              <div className="text-xs text-purple-600 mt-1">
                +3.2% vs last month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
