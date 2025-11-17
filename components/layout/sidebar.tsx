"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Cloud, DollarSign, Home, LayoutDashboard, Music } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const navigation = [
  { name: "Übersicht", href: "/dashboard", icon: LayoutDashboard },
  { name: "Wetter", href: "/dashboard/wetter", icon: Cloud },
  { name: "Finanzen", href: "/dashboard/finanzen", icon: DollarSign },
  { name: "Kalender", href: "/dashboard/kalender", icon: Calendar },
  { name: "Musik", href: "/dashboard/musik", icon: Music },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "flex w-full flex-col border-b border-border/70 bg-card/90 px-3 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70 lg:h-screen lg:flex-shrink-0 lg:border-b-0 lg:border-r lg:px-3 lg:py-6",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}
      data-collapsed={isCollapsed}
    >
      <div className="flex h-14 items-center px-1">
        <Link
          href="/dashboard"
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-semibold tracking-tight text-foreground transition",
            isCollapsed && "lg:justify-center lg:px-2"
          )}
          aria-label="vyrnix.net Dashboard"
        >
          <span className="flex w-6 justify-center text-primary">
            <Home className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className={cn("truncate", isCollapsed && "lg:hidden")}>vyrnix.net</span>
        </Link>
      </div>
      <TooltipProvider delayDuration={150}>
        <nav className="mt-4 grid gap-2 sm:grid-cols-2 lg:mt-8 lg:grid-cols-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            const linkClasses = cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isCollapsed && "lg:justify-center lg:px-2",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm border-l-2 border-l-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            );

            const link = (
              <Link
                key={item.name}
                href={item.href}
                className={linkClasses}
                aria-current={isActive ? "page" : undefined}
                aria-label={isCollapsed ? item.name : undefined}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="flex w-6 justify-center">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className={cn("truncate text-sm font-medium", isCollapsed && "lg:hidden")}>
                  {item.name}
                </span>
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
