"use client";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { NotificationTrigger } from "./NotificationTrigger";
import { SidebarTrigger } from "./ui/sidebar";
import ProfileMenu from "./ProfileMenu";

const ThemeMode = dynamic(() => import("./ThemeMode"), { ssr: false });
export default function Header() {
  return (
    <header className="bg-background px-6 py-4 sticky top-0 z-10 border-b dark:border-0">
      <div className="flex items-center justify-between">
        {/** Sidebar Trigger */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="w-10 h-10 " />
          {/* Logo  */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">
              StockPilot
            </span>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-gray-100 dark:border-accent shadow-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/** Theme mode */}
          <ThemeMode />

          {/** Notification */}
          <NotificationTrigger />

          {/** Profile  */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
