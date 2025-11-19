/**
 * Enhanced Sidebar Component
 *
 * Erweiterte Sidebar mit:
 * - Sections (Gruppen)
 * - Badge-Support für Notifications
 * - Footer mit Version/Links
 * - Mobile: Sheet-Integration (via MobileNav)
 * - Keyboard-Navigation
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Cloud,
  Newspaper,
  TrendingUp,
  Clock,
  Settings,
  User,
  Shield,
  Package,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ============================================================================
// Navigation Items
// ============================================================================

const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: "Hauptmenü",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Widgets",
    items: [
      { name: "Wetter", href: "/dashboard/widgets/weather", icon: Cloud },
      { name: "Nachrichten", href: "/dashboard/widgets/news", icon: Newspaper },
      { name: "Finanzen", href: "/dashboard/widgets/finance", icon: TrendingUp },
      { name: "Uhrzeit", href: "/dashboard/widgets/time", icon: Clock },
    ],
  },
  {
    title: "Einstellungen",
    items: [
      { name: "Einstellungen", href: "/dashboard/settings", icon: Settings },
      { name: "Konto", href: "/dashboard/account", icon: User },
      { name: "Administration", href: "/dashboard/admin", icon: Shield },
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

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
      {/* Header/Logo */}
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

      {/* Navigation */}
      <TooltipProvider delayDuration={150}>
        <div className="mt-4 flex-1 space-y-6 overflow-y-auto lg:mt-8">
          {NAVIGATION_SECTIONS.map((section) => (
            <nav key={section.title} className="space-y-2">
              {/* Section Title */}
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
              )}

              {/* Section Items */}
              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  const linkClasses = cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
                      <span className="flex w-6 justify-center">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className={cn("flex-1 truncate text-sm font-medium", isCollapsed && "lg:hidden")}>
                        {item.name}
                      </span>
                      {item.badge && item.badge > 0 && !isCollapsed && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>{link}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.badge && item.badge > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                                {item.badge > 99 ? "99+" : item.badge}
                              </span>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return link;
                })}
              </div>
            </nav>
          ))}
        </div>
      </TooltipProvider>

      {/* Footer */}
      <div
        className={cn(
          "mt-auto border-t border-border/50 pt-4",
          isCollapsed && "lg:text-center"
        )}
      >
        <div className={cn("px-3 text-xs text-muted-foreground", isCollapsed && "lg:px-1")}>
          {!isCollapsed ? (
            <div className="space-y-1">
              <p className="font-medium">vyrnix.net Dashboard</p>
              <p className="text-[10px]">Version 1.0.0</p>
            </div>
          ) : (
            <p className="font-medium lg:text-[10px]">v1.0</p>
          )}
        </div>
      </div>
    </aside>
  );
}
