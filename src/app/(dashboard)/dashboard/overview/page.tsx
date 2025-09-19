import DashboardOverview from "@/components/DashboardOverview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "StockPilot Dashboard Overview | Real-Time Store and Inventory Management Insights & Analytics",
  description:
    "Unlock powerful analytics and real-time insights for your store and inventory management with StockPilot. Track performance, manage assets, and make smarter decisions from your personalized dashboard.",
  keywords: [
    "StockPilot",
    "dashboard",
    "inventory management",
    "store analytics",
    "real-time insights",
    "asset tracking",
    "performance monitoring",
    "business intelligence",
    "store management",
    "analytics",
  ],
  openGraph: {
    title:
      "StockPilot Dashboard Overview | Real-Time Store and Inventory Management Insights & Analytics",
    description:
      "Unlock powerful analytics and real-time insights for your store and inventory management with StockPilot. Track performance, manage assets, and make smarter decisions from your personalized dashboard.",
    url: "https://stockpilot.com/dashboard/overview",
    type: "website",
    images: [
      {
        url: "https://stockpilot.com/og-dashboard-overview.png",
        width: 1200,
        height: 630,
        alt: "StockPilot Dashboard Overview",
      },
    ],
  },
};

export default async function Overview() {
  return <DashboardOverview />;
}
