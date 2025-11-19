/**
 * Breadcrumbs Component
 *
 * Intelligente Breadcrumb-Navigation mit Auto-Generierung aus Route
 *
 * Features:
 * - Auto-generiert aus Pathname
 * - Custom-Labels möglich
 * - Mobile: nur letzte 2-3 Crumbs
 * - Separator konsistent
 * - Letzter Crumb nicht klickbar
 * - Responsive mit Ellipsis auf kleinen Screens
 *
 * @example
 * ```tsx
 * // Auto-generiert aus Route
 * <Breadcrumbs />
 *
 * // Custom Labels
 * <Breadcrumbs
 *   items={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Einstellungen", href: "/dashboard/settings" },
 *     { label: "Wetter", href: "/dashboard/settings?tab=weather" }
 *   ]}
 * />
 *
 * // Mobile: nur letzte 2 Items
 * <Breadcrumbs maxItems={2} />
 * ```
 */

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItemType {
  label: string;
  href: string;
  isEllipsis?: boolean;
}

export interface BreadcrumbsProps {
  /**
   * Custom Breadcrumb-Items (optional)
   * Falls nicht angegeben, wird aus Route generiert
   */
  items?: BreadcrumbItemType[];

  /**
   * Maximale Anzahl von Items (für Mobile)
   * Default: Desktop = alle, Mobile = 2
   */
  maxItems?: number;

  /**
   * Custom Label-Mapping für Auto-Generation
   * @example { "dashboard": "Dashboard", "settings": "Einstellungen" }
   */
  labelMap?: Record<string, string>;

  /**
   * Zeigt Home-Icon statt "Home" Text
   */
  showHomeIcon?: boolean;

  /**
   * Zusätzliche Klassen
   */
  className?: string;
}

// ============================================================================
// Default Label-Mapping
// ============================================================================

const DEFAULT_LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Einstellungen",
  account: "Konto",
  admin: "Administration",
  users: "Benutzer",
  widgets: "Widgets",
  weather: "Wetter",
  news: "Nachrichten",
  finance: "Finanzen",
  time: "Uhrzeit",
  "sign-in": "Anmelden",
  "sign-up": "Registrieren",
  "forgot-password": "Passwort vergessen",
  "reset-password": "Passwort zurücksetzen",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Konvertiert Pfad-Segment zu lesbarem Label
 */
function segmentToLabel(segment: string, labelMap: Record<string, string>): string {
  // Custom Label aus Map
  if (labelMap[segment]) {
    return labelMap[segment];
  }

  // Default Label aus Map
  if (DEFAULT_LABEL_MAP[segment]) {
    return DEFAULT_LABEL_MAP[segment];
  }

  // Fallback: Capitalize first letter
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generiert Breadcrumb-Items aus Pathname
 */
function generateBreadcrumbsFromPath(
  pathname: string,
  labelMap: Record<string, string> = {}
): BreadcrumbItemType[] {
  // Root
  if (pathname === "/") {
    return [{ label: "Home", href: "/" }];
  }

  // Segments extrahieren
  const segments = pathname.split("/").filter(Boolean);

  // Breadcrumbs generieren
  const breadcrumbs: BreadcrumbItemType[] = [
    { label: "Home", href: "/" },
  ];

  let currentPath = "";

  segments.forEach((segment) => {
    // Query-Parameter entfernen
    const cleanSegment = segment.split("?")[0];
    currentPath += `/${cleanSegment}`;

    breadcrumbs.push({
      label: segmentToLabel(cleanSegment, labelMap),
      href: currentPath,
    });
  });

  return breadcrumbs;
}

// ============================================================================
// Component
// ============================================================================

export function Breadcrumbs({
  items,
  maxItems,
  labelMap = {},
  showHomeIcon = false,
  className,
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Items generieren oder verwenden
  const breadcrumbItems = React.useMemo(() => {
    return items || generateBreadcrumbsFromPath(pathname, labelMap);
  }, [items, pathname, labelMap]);

  // Max Items basierend auf Screen-Size
  const effectiveMaxItems = React.useMemo(() => {
    if (maxItems !== undefined) {
      return maxItems;
    }
    return isMobile ? 2 : undefined;
  }, [maxItems, isMobile]);

  // Items mit Ellipsis
  const displayItems = React.useMemo(() => {
    if (!effectiveMaxItems || breadcrumbItems.length <= effectiveMaxItems) {
      return breadcrumbItems;
    }

    // Zeige erste + ... + letzte N-1 Items
    const itemsToShow = effectiveMaxItems - 1;
    return [
      breadcrumbItems[0],
      { label: "...", href: "#", isEllipsis: true } as BreadcrumbItemType,
      ...breadcrumbItems.slice(-itemsToShow),
    ];
  }, [breadcrumbItems, effectiveMaxItems]);

  // Nur ein Item? Nicht anzeigen
  if (displayItems.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;

          return (
            <React.Fragment key={item.href + index}>
              <BreadcrumbItem>
                {item.isEllipsis ? (
                  <BreadcrumbEllipsis />
                ) : isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
