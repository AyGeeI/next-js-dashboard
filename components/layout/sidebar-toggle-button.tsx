"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "./sidebar-context";

export function SidebarToggleButton() {
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const label = isCollapsed ? "Sidebar ausklappen" : "Sidebar einklappen";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleCollapsed}
      aria-label={label}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-muted/70 text-foreground shadow-sm transition hover:border-primary hover:bg-primary/15 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isCollapsed ? (
        <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
      ) : (
        <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
