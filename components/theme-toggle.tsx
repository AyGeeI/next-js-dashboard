"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <div className="flex items-center gap-3 rounded-md border border-border/70 bg-card/80 px-3 py-2 shadow-sm">
      <Sun
        className={cn(
          "h-4 w-4 transition-colors",
          isDark ? "text-muted-foreground" : "text-primary"
        )}
        aria-hidden="true"
      />
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Theme zwischen Hell und Dunkel wechseln"
        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
      />
      <Moon
        className={cn(
          "h-4 w-4 transition-colors",
          isDark ? "text-primary" : "text-muted-foreground"
        )}
        aria-hidden="true"
      />
    </div>
  );
}
