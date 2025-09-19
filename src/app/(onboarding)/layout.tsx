import React, { ReactNode } from "react";
import "@/app/globals.css";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Register Your Business on StockPilot | Onboarding",
  description:
    "Easily register your business on StockPilot to start managing inventory, sales, and store operations. Quick setup, powerful insights.",
  keywords: [
    "StockPilot business registration",
    "register store StockPilot",
    "onboarding inventory system",
    "create business account",
    "POS business setup",
  ],
  openGraph: {
    title: "Register Your Business on StockPilot | Onboarding",
    description:
      "Set up your business on StockPilot in minutes. Create stores, add products, and start tracking sales seamlessly.",
    url: "https://www.stockpilot.com/business/register",
    siteName: "StockPilot",
    images: [
      {
        url: "https://www.stockpilot.com/og-business-register.png", // replace with your banner
        width: 1200,
        height: 630,
        alt: "StockPilot Business Registration",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Register Your Business on StockPilot",
    description:
      "Quickly register your business, create stores, and start selling with StockPilot.",
    images: ["https://www.stockpilot.com/twitter-business-register.png"],
  },
  alternates: {
    canonical: "https://www.stockpilot.com/business/register",
  },
};

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html>
      <body className={montserrat.className}>
        {" "}
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
