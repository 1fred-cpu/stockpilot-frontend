import SignUpForm from "@/components/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your StockPilot Account | Free Signup",
  description:
    "Sign up for StockPilot today and start managing your inventory, sales, and business operations with ease. Free account creation in seconds.",
  keywords: [
    "StockPilot signup",
    "create StockPilot account",
    "inventory management free trial",
    "retail POS signup",
    "store dashboard register",
  ],
  openGraph: {
    title: "Create Your StockPilot Account | Free Signup",
    description:
      "Register for StockPilot and take control of your inventory and sales. Start for free today.",
    url: "https://www.stockpilot.com/signup",
    siteName: "StockPilot",
    images: [
      {
        url: "https://www.stockpilot.com/og-image.png", // replace with your signup banner
        width: 1200,
        height: 630,
        alt: "StockPilot Signup Page",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Your StockPilot Account",
    description:
      "Sign up now and streamline your inventory and business operations with StockPilot.",
    images: ["https://www.stockpilot.com/twitter-image.png"],
  },
  alternates: {
    canonical: "https://www.stockpilot.com/signup",
  },
};

export default function Signup() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Landscape Illustration */}

      <div className="hidden lg:block bg-cover bg-center bg-[url('/images/small-business-worker-analyzing-merchandise-logistics.jpg')] flex-1" />

      {/* Right Panel - Sign Up Form */}
      <div className="w-full lg:w-xl bg-white flex items-center justify-center p-8 min-h-screen md:min-h-auto">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
