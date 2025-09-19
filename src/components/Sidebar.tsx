"use client";
import React, { ComponentProps, ReactNode, use } from "react";
import type { LinkProps } from "next/link";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

type NavLinkProps = {
  href: string;
  className?: string;
  name: string;
  icon?: ReactNode;
} & ComponentProps<"a"> &
  LinkProps;

const menuItems = [
  {
    id: "dashboard",
    href: "/dashboard/overview",
    title: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "products",
    href: "/dashboard/products",
    title: "Products",
    icon: Package,
  },
  {
    id: "inventory",
    href: "/dashboard/inventory",
    title: "Inventory",
    icon: Warehouse,
  },
  {
    id: "sales",
    href: "/dashboard/sales",
    title: "Sales",
    icon: TrendingUp,
  },
  {
    id: "analytics",
    href: "/dashboard/analytics",
    title: "Analytics",
    icon: BarChart3,
  },
  {
    id: "customers",
    href: "/dashboard/customers",
    title: "Customers",
    icon: Users,
  },
  {
    id: "settings",
    href: "/dashboard/settings",
    title: "Settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-60 flex-0.5 bg-white lg:flex flex-col border-b-2 border-gray-200 hidden">
      {/** Sidebar Header */}
      {/* <div className=" p-6">Header</div> */}

      {/** Sidebar Content */}
      <div className="grow p-5">
        <ul className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                href={item.href}
                name={item.title}
                icon={<item.icon className="w-4 h-4" />}
              />
            </li>
          ))}
        </ul>
      </div>

      {/** Sidebar Footer */}
      <div className="grow p-5 flex flex-col justify-end">
        <div>
          <Button
            className="flex items-center gap-2 text-gray-600 w-full justify-start"
            variant="ghost"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function NavLink({
  href,
  className,
  name,
  icon,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      {...props}
      className={`${className} text-sm ${
        pathname.includes(href)
          ? "bg-[linear-gradient(135deg,#a57eff,#510cf3)] text-white"
          : ""
      } transition-colors hover:bg-accent rounded-md flex items-center gap-4 py-2 px-4`}
    >
      {icon}

      {name}
    </Link>
  );
}
