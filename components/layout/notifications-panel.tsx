/**
 * NotificationsPanel Component
 *
 * Panel mit Notifications-Liste
 *
 * Features:
 * - Liste aller Notifications
 * - "Alle als gelesen markieren" Button
 * - Kategorien (System, Updates, etc.)
 * - Empty-State
 * - Loading-State
 * - Click auf Notification markiert als gelesen
 *
 * @example
 * ```tsx
 * <NotificationsPanel onClose={() => setOpen(false)} />
 * ```
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Trash2, Bell, Info, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications, type Notification } from "@/lib/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/common/loading-spinner";

// ============================================================================
// Helper Functions
// ============================================================================

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "system":
      return Bell;
    case "update":
      return Sparkles;
    case "info":
      return Info;
    case "warning":
      return AlertTriangle;
    case "error":
      return AlertCircle;
    default:
      return Bell;
  }
}

function getNotificationIconColor(type: Notification["type"]) {
  switch (type) {
    case "system":
      return "text-primary";
    case "update":
      return "text-blue-500";
    case "info":
      return "text-sky-500";
    case "warning":
      return "text-amber-500";
    case "error":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Gerade eben";
  if (diffMins < 60) return `Vor ${diffMins} Min.`;
  if (diffHours < 24) return `Vor ${diffHours} Std.`;
  if (diffDays === 1) return "Gestern";
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;

  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ============================================================================
// Component
// ============================================================================

interface NotificationsPanelProps {
  onClose?: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    if (notification.link) {
      onClose?.();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold">Benachrichtigungen</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {unreadCount} ungelesen
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="h-8 text-xs"
          >
            <Check className="mr-1 h-3 w-3" />
            Alle gelesen
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-[400px] flex-col items-center justify-center gap-2 px-4 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium">Keine Benachrichtigungen</p>
            <p className="text-xs text-muted-foreground">
              Du bist auf dem neuesten Stand
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationIconColor(notification.type);

              const content = (
                <div
                  className={cn(
                    "group relative flex gap-3 px-4 py-3 transition-colors",
                    notification.read
                      ? "bg-background hover:bg-accent/50"
                      : "bg-accent/30 hover:bg-accent/50",
                    notification.link && "cursor-pointer"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-background",
                      iconColor
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          !notification.read && "font-semibold"
                        )}
                      >
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        aria-label="Benachrichtigung löschen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                </div>
              );

              return notification.link ? (
                <Link href={notification.link} key={notification.id}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={onClose}
            >
              Alle Benachrichtigungen anzeigen
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
