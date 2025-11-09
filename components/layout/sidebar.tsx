"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Cloud,
  DollarSign,
  Calendar,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Übersicht", href: "/dashboard", icon: LayoutDashboard },
  { name: "Wetter", href: "/dashboard/wetter", icon: Cloud },
  { name: "Finanzen", href: "/dashboard/finanzen", icon: DollarSign },
  { name: "Kalender", href: "/dashboard/kalender", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleLabel = isCollapsed ? "Sidebar ausklappen" : "Sidebar einklappen";

  return (
    <aside
      className={cn(
        "flex w-full flex-col border-b border-border/70 bg-card/90 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70 lg:h-screen lg:flex-shrink-0 lg:border-b-0 lg:border-r lg:px-4 lg:py-6",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}
      data-collapsed={isCollapsed}
    >
      <div className="flex h-14 items-center justify-between gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
          aria-label="vyrnix.net Dashboard"
        >
          <Home className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className={cn("whitespace-nowrap", isCollapsed && "lg:hidden")}>vyrnix.net</span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden rounded-xl border border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted lg:inline-flex"
          aria-label={toggleLabel}
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
      <TooltipProvider delayDuration={200}>
        <nav className="mt-4 grid gap-2 sm:grid-cols-2 lg:mt-8 lg:grid-cols-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            const linkClasses = cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isCollapsed && "lg:justify-center lg:px-2",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
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
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className={cn("truncate", isCollapsed && "lg:hidden")}>{item.name}</span>
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
