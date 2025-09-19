"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "./ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    id: "stores",
    href: "/dashboard/stores",
    title: "Stores",
    icon: Store,
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

export default function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar className="border-r-2 border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-4 pt-6 px-2 ">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-4 py-2.5 px-4 ${
                      pathname.includes(item.href)
                        ? "bg-[linear-gradient(135deg,#a57eff,#510cf3)] dark:bg-[linear-gradient(135deg,#3700b3,#5b0eff)] text-white "
                        : ""
                    } transition-colors hover:bg-accent rounded-md`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-pointer">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
