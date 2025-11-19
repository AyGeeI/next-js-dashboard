/**
 * Enhanced Header Client Component
 *
 * Client-side Header mit:
 * - Breadcrumbs
 * - Command Palette Button (Search)
 * - Notifications Bell
 * - Theme Toggle
 * - User Menu
 * - Responsive Design
 */

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { SidebarToggleButton } from "@/components/layout/sidebar-toggle-button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/common/command-palette";

// ============================================================================
// Types
// ============================================================================

interface HeaderClientProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  logoutAction?: (formData: FormData) => Promise<void>;
  showBreadcrumbs?: boolean;
  showWelcome?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function HeaderClient({
  user,
  logoutAction,
  showBreadcrumbs = true,
  showWelcome = false,
}: HeaderClientProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <>
      <header className="relative z-20 flex flex-col gap-4 border-b border-border/70 bg-card/80 px-4 py-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/60 sm:px-8 sm:py-5 md:flex-row md:items-center md:justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <SidebarToggleButton />

          {showBreadcrumbs ? (
            <div className="flex flex-col gap-2">
              <Breadcrumbs />
              {showWelcome && user?.name && (
                <p className="text-sm text-muted-foreground">
                  Willkommen zurück, {user.name}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold">
                Willkommen zurück{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("de-DE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Button - Opens Command Palette */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Suche öffnen (⌘K)"
            className="hidden sm:inline-flex"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications Bell */}
          <NotificationBell />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <UserMenu user={user} logoutAction={logoutAction} />
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette />
    </>
  );
}
