import ProductsPage from "@/components/ProductsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | StockPilot Dashboard",
  description:
    "Explore and manage your product inventory efficiently with StockPilot. View detailed product information, track stock levels, and optimize your business operations using our comprehensive dashboard tools.",
  keywords: [
    "StockPilot",
    "products",
    "inventory management",
    "dashboard",
    "business operations",
    "stock tracking",
    "product details",
  ],
  openGraph: {
    title: "Products | StockPilot Dashboard",
    description:
      "Effortlessly manage your products and inventory with StockPilot's advanced dashboard. Access detailed insights and streamline your business workflow.",
    url: "https://yourdomain.com/dashboard/products",
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
export default function Products() {
  return <ProductsPage />;
}
