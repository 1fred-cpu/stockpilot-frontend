import CreateProductPage from "@/components/CreateProductPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Product | StockPilot Dashboard",
  description:
    "Add new products to your inventory using the StockPilot dashboard. Streamline product management, track stock levels, and optimize your inventory workflow.",
  keywords: [
    "create product",
    "inventory",
    "stockpilot",
    "dashboard",
    "product management",
    "add item",
    "inventory control",
    "stock tracking",
    "warehouse",
    "supply chain",
    "business tools",
    "SKU",
    "product catalog",
  ],
  openGraph: {
    title: "Create Product | StockPilot Dashboard",
    description:
      "Easily add new products to your inventory with StockPilot. Manage your stock efficiently and keep your business organized.",
    type: "website",
  },
  robots: "index, follow",
  authors: [{ name: "StockPilot Team" }],
  category: "Business, Inventory Management",
};
export default function CreateProduct() {
  return <CreateProductPage />;
}
