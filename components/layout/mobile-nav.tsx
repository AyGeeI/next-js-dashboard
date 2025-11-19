/**
 * Mobile Navigation Component
 *
 * Mobile Navigation mit Sheet/Drawer
 *
 * Features:
 * - Sheet/Drawer von links
 * - Backdrop-Blur
 * - Auto-Close nach Navigation
 * - Hamburger-Button mit Animation
 * - Responsive (nur auf Mobile)
 *
 * @example
 * ```tsx
 * // In Header
 * <MobileNav />
 * ```
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  User,
  Cloud,
  Newspaper,
  TrendingUp,
  Clock,
  Shield,
  Menu,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

// ============================================================================
// Navigation Items
// ============================================================================

const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Wetter",
    href: "/dashboard/widgets/weather",
    icon: Cloud,
  },
  {
    label: "Nachrichten",
    href: "/dashboard/widgets/news",
    icon: Newspaper,
  },
  {
    label: "Finanzen",
    href: "/dashboard/widgets/finance",
    icon: TrendingUp,
  },
  {
    label: "Uhrzeit",
    href: "/dashboard/widgets/time",
    icon: Clock,
  },
];

const SETTINGS_ITEMS: NavItem[] = [
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
  {
    label: "Administration",
    href: "/dashboard/admin",
    icon: Shield,
  },
];

// ============================================================================
// Component
// ============================================================================

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Auto-Close bei Navigation
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Menü öffnen"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>

        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
          <div className="flex flex-col space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hauptmenü
              </h4>
              <nav className="space-y-1">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </div>

            {/* Settings Navigation */}
            <div className="space-y-1">
              <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Einstellungen
              </h4>
              <nav className="space-y-1">
                {SETTINGS_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
