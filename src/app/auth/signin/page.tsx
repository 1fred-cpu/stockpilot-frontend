import SignInForm from "@/components/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to StockPilot | Inventory & Store Management",
  description:
    "Access your StockPilot dashboard. Sign in securely to manage inventory, track sales, monitor stock levels, and streamline your store operations.",
  keywords: [
    "StockPilot sign in",
    "inventory management login",
    "store dashboard",
    "retail POS login",
    "ecommerce stock management",
  ],
  openGraph: {
    title: "Sign In to StockPilot | Inventory & Store Management",
    description:
      "Log in to your StockPilot account to manage inventory, track sales, and simplify store operations.",
    url: "https://www.stockpilot.com/signin",
    siteName: "StockPilot",
    images: [
      {
        url: "https://www.stockpilot.com/og-image.png", // replace with your logo/banner
        width: 1200,
        height: 630,
        alt: "StockPilot Dashboard Login",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In to StockPilot",
    description:
      "Access your StockPilot dashboard and manage your business operations with ease.",
    images: ["https://www.stockpilot.com/twitter-image.png"],
  },
  alternates: {
    canonical: "https://www.stockpilot.com/signin",
  },
};

export default function Signin() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Landscape Illustration */}
      <div className="hidden lg:block bg-cover bg-center bg-[url('/images/medium-shot-women-clothes-shopping.jpg')] flex-1" />

      {/* Right Panel - Sign In Form */}
      <div className="w-full lg:w-xl bg-white flex items-center justify-center p-8 min-h-screen md:min-h-auto">
        <div className="w-full max-w-md">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
