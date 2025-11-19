/**
 * CardMetric Component
 *
 * Enhanced Metric Card für Dashboard
 *
 * Features:
 * - Click-Handler für Drill-Down
 * - Loading-State
 * - Empty-State
 * - Tooltip mit mehr Infos
 * - Trend-Chart (Mini-Sparkline) - optional
 * - Delta mit Trend-Indicator
 *
 * @example
 * ```tsx
 * <CardMetric
 *   title="Umsatz"
 *   value="€12,345"
 *   icon={TrendingUp}
 *   description="Letzte 30 Tage"
 *   delta={{ value: "+12%", trend: "up", label: "vs. letzter Monat" }}
 *   loading={false}
 *   onClick={() => router.push("/dashboard/revenue")}
 *   tooltip="Gesamtumsatz der letzten 30 Tage"
 * />
 * ```
 */

import * as React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// Types
// ============================================================================

interface CardMetricProps {
  /**
   * Titel der Metrik
   */
  title: string;

  /**
   * Wert der Metrik
   */
  value: string | number;

  /**
   * Icon (LucideIcon)
   */
  icon?: LucideIcon;

  /**
   * Beschreibung
   */
  description?: string;

  /**
   * Zusätzliche Klassen für Value
   */
  valueClassName?: string;

  /**
   * Delta mit Trend
   */
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
    label?: string;
  };

  /**
   * Click-Handler (macht Card klickbar)
   */
  onClick?: () => void;

  /**
   * Loading-State
   */
  loading?: boolean;

  /**
   * Tooltip-Text
   */
  tooltip?: string;

  /**
   * Trend-Daten für Mini-Chart (Sparkline)
   * Array von Zahlen für die letzten N Tage
   */
  trend?: number[];

  /**
   * Empty-State (wenn kein Wert)
   */
  empty?: boolean;

  /**
   * Empty-State Message
   */
  emptyMessage?: string;
}

// ============================================================================
// Mini Sparkline Component
// ============================================================================

function MiniSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="h-8 w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary/40"
      />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function CardMetric({
  title,
  value,
  icon: Icon,
  description,
  valueClassName,
  delta,
  onClick,
  loading = false,
  tooltip,
  trend,
  empty = false,
  emptyMessage = "Keine Daten verfügbar",
}: CardMetricProps) {
  const isClickable = !!onClick;

  // Loading State
  if (loading) {
    return (
      <Card className="overflow-hidden rounded-md border bg-card p-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-3 w-40" />
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (empty) {
    return (
      <Card className="overflow-hidden rounded-md border border-dashed bg-card p-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          {Icon && (
            <div className="rounded-md bg-muted p-2 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-md border bg-card p-0 shadow-sm transition-all duration-200 motion-reduce:transition-none",
        isClickable && "cursor-pointer hover:border-primary/40 hover:shadow-md",
        !isClickable && "hover:border-primary/40"
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground transition hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Mehr Informationen"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {Icon && (
          <div className="rounded-md bg-primary/10 p-2 text-primary transition group-hover:bg-primary/15">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-semibold", valueClassName)}>
          {value}
        </div>

        {/* Trend Sparkline */}
        {trend && trend.length > 0 && (
          <div className="mt-2">
            <MiniSparkline data={trend} />
          </div>
        )}

        {/* Delta & Description */}
        {(description || delta) && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {delta && (
              <>
                {delta.trend === "up" && (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                )}
                {delta.trend === "down" && (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    delta.trend === "up" && "text-emerald-600 dark:text-emerald-400",
                    delta.trend === "down" && "text-red-600 dark:text-red-400"
                  )}
                >
                  {delta.value}
                </span>
                {delta.label && <span>{delta.label}</span>}
              </>
            )}
            {description && !delta && <span>{description}</span>}
            {description && delta && <span className="ml-1">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
