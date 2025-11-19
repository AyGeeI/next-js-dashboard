/**
 * Bottom Navigation Component
 *
 * Mobile Bottom Navigation
 *
 * Features:
 * - Nur auf Mobile anzeigen (lg:hidden)
 * - 4-5 wichtigste Items
 * - Active-State
 * - Badge-Support
 * - Fixed am unteren Rand
 *
 * @example
 * ```tsx
 * <BottomNav />
 * ```
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Cloud, Newspaper, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// ============================================================================
// Navigation Items
// ============================================================================

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Wetter",
    href: "/dashboard/widgets/weather",
    icon: Cloud,
  },
  {
    label: "News",
    href: "/dashboard/widgets/news",
    icon: Newspaper,
  },
  {
    label: "Einstellungen",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    label: "Konto",
    href: "/dashboard/account",
    icon: User,
  },
];

// ============================================================================
// Component
// ============================================================================

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
