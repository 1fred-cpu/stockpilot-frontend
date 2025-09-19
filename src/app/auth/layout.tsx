import React, { ReactNode } from "react";
import "@/app/globals.css";
import { Montserrat } from "next/font/google";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className={montserrat.className}>
        {children} <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
