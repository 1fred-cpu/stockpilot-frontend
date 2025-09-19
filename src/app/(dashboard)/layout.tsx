import React, { ReactNode } from "react";
import "@/app/globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

import { Montserrat } from "next/font/google";
import Providers from "@/components/QueryClientProvider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import { ThemeProvider } from "next-themes";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={`${montserrat.className}`}>
        <Providers>
          <ThemeProvider
            attribute={`class`}
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <div className="min-h-screen bg-gray-100 dark:bg-background  flex w-full">
                {/** App sidebar */}
                <div>
                  <AppSidebar />
                </div>
                {/* Main Content */}
                <div className="w-full md:flex-1 md:w-60">
                  {/* Top Navbar */}
                  <Header />

                  {/* Page Content */}
                  <main>{children}</main>
                </div>
              </div>
            </SidebarProvider>
          </ThemeProvider>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
