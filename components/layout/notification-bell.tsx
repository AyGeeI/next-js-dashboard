/**
 * NotificationBell Component
 *
 * Notification-Bell-Icon mit Badge
 *
 * Features:
 * - Badge mit Unread-Count
 * - Öffnet Notifications-Panel
 * - Responsive
 * - Animiertes Badge
 *
 * @example
 * ```tsx
 * <NotificationBell />
 * ```
 */

"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { cn } from "@/lib/utils";

// ============================================================================
// Component
// ============================================================================

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Benachrichtigungen${unreadCount > 0 ? ` (${unreadCount} ungelesen)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground",
                "animate-in fade-in zoom-in-50 duration-200"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0"
        sideOffset={8}
      >
        <NotificationsPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
