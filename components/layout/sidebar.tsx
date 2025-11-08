"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Cloud, DollarSign, Calendar, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Übersicht", href: "/dashboard", icon: LayoutDashboard },
  { name: "Wetter", href: "/dashboard/wetter", icon: Cloud },
  { name: "Finanzen", href: "/dashboard/finanzen", icon: DollarSign },
  { name: "Kalender", href: "/dashboard/kalender", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col bg-card px-4 py-4 lg:h-full">
      <div className="flex h-14 items-center justify-between border-b pb-4 lg:border-b-0 lg:pb-0">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
          <Home className="h-5 w-5 text-primary" />
          <span>Dashboard</span>
        </Link>
      </div>
      <nav className="mt-4 grid gap-2 sm:grid-cols-2 lg:mt-6 lg:grid-cols-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
