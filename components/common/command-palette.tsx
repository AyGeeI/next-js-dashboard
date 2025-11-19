/**
 * Command Palette Component
 *
 * Globale Kommandopalette mit ⌘K / Ctrl+K Shortcut
 *
 * Features:
 * - ⌘K / Ctrl+K zum Öffnen
 * - Fuzzy-Search
 * - Kategorien (Navigation, Actions, Settings)
 * - Recent-Items
 * - Keyboard-Navigation
 * - Theme-Toggle
 * - Logout-Action
 *
 * @example
 * ```tsx
 * // In Root-Layout
 * <CommandPalette />
 *
 * // User drückt ⌘K → Dialog öffnet sich
 * // Suchen nach: "Wetter", "Settings", "Logout", etc.
 * ```
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Search,
  Cloud,
  Newspaper,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useTheme } from "next-themes";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface CommandItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  keywords?: string[];
}

interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

// ============================================================================
// Component
// ============================================================================

export function CommandPalette() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [recentItems, setRecentItems] = React.useState<string[]>([]);

  // Keyboard-Shortcut registrieren
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Recent Items aus localStorage laden
  React.useEffect(() => {
    const stored = localStorage.getItem("command-palette-recent");
    if (stored) {
      try {
        setRecentItems(JSON.parse(stored));
      } catch {
        // Ignore
      }
    }
  }, []);

  // Item ausführen und zu Recent hinzufügen
  const handleSelect = React.useCallback(
    (itemId: string, action: () => void) => {
      action();
      setOpen(false);

      // Zu Recent hinzufügen
      setRecentItems((prev) => {
        const updated = [itemId, ...prev.filter((id) => id !== itemId)].slice(0, 5);
        localStorage.setItem("command-palette-recent", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // Navigation-Items
  const navigationItems: CommandItem[] = React.useMemo(
    () => [
      {
        id: "nav-dashboard",
        label: "Dashboard",
        icon: Home,
        keywords: ["home", "start", "hauptseite"],
        onSelect: () => router.push("/dashboard"),
      },
      {
        id: "nav-weather",
        label: "Wetter",
        icon: Cloud,
        keywords: ["weather", "forecast", "temperatur"],
        onSelect: () => router.push("/dashboard/widgets/weather"),
      },
      {
        id: "nav-news",
        label: "Nachrichten",
        icon: Newspaper,
        keywords: ["news", "artikel"],
        onSelect: () => router.push("/dashboard/widgets/news"),
      },
      {
        id: "nav-finance",
        label: "Finanzen",
        icon: TrendingUp,
        keywords: ["finance", "stocks", "aktien"],
        onSelect: () => router.push("/dashboard/widgets/finance"),
      },
      {
        id: "nav-time",
        label: "Uhrzeit",
        icon: Clock,
        keywords: ["time", "clock", "zeit"],
        onSelect: () => router.push("/dashboard/widgets/time"),
      },
      {
        id: "nav-settings",
        label: "Einstellungen",
        icon: Settings,
        keywords: ["settings", "preferences", "config", "konfiguration"],
        onSelect: () => router.push("/dashboard/settings"),
      },
      {
        id: "nav-account",
        label: "Konto",
        icon: User,
        keywords: ["account", "profile", "profil"],
        onSelect: () => router.push("/dashboard/account"),
      },
      {
        id: "nav-admin",
        label: "Administration",
        icon: Shield,
        keywords: ["admin", "administration", "verwaltung"],
        onSelect: () => router.push("/dashboard/admin"),
      },
    ],
    [router]
  );

  // Action-Items
  const actionItems: CommandItem[] = React.useMemo(
    () => [
      {
        id: "action-theme-light",
        label: "Theme: Hell",
        icon: Sun,
        keywords: ["theme", "light", "hell"],
        onSelect: () => {
          setTheme("light");
          toast.success("Theme zu Hell gewechselt");
        },
      },
      {
        id: "action-theme-dark",
        label: "Theme: Dunkel",
        icon: Moon,
        keywords: ["theme", "dark", "dunkel"],
        onSelect: () => {
          setTheme("dark");
          toast.success("Theme zu Dunkel gewechselt");
        },
      },
      {
        id: "action-logout",
        label: "Abmelden",
        icon: LogOut,
        keywords: ["logout", "sign out", "abmelden"],
        onSelect: () => {
          signOut({ callbackUrl: "/sign-in" });
          toast.success("Erfolgreich abgemeldet");
        },
      },
    ],
    [setTheme]
  );

  // Alle Groups
  const groups: CommandGroup[] = React.useMemo(
    () => [
      {
        heading: "Navigation",
        items: navigationItems,
      },
      {
        heading: "Aktionen",
        items: actionItems,
      },
    ],
    [navigationItems, actionItems]
  );

  // Recent Items filtern
  const recentCommands = React.useMemo(() => {
    const allItems = [...navigationItems, ...actionItems];
    return recentItems
      .map((id) => allItems.find((item) => item.id === id))
      .filter(Boolean) as CommandItem[];
  }, [recentItems, navigationItems, actionItems]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Suche nach Befehlen..." />
      <CommandList>
        <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>

        {/* Recent Items */}
        {recentCommands.length > 0 && (
          <>
            <CommandGroup heading="Zuletzt verwendet">
              {recentCommands.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    keywords={item.keywords}
                    onSelect={() => handleSelect(item.id, item.onSelect)}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* All Groups */}
        {groups.map((group) => (
          <React.Fragment key={group.heading}>
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    keywords={item.keywords}
                    onSelect={() => handleSelect(item.id, item.onSelect)}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
