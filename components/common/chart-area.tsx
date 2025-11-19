/**
 * ChartArea Component
 *
 * Wiederverwendbare Area-Chart-Komponente mit Recharts
 *
 * Features:
 * - Konsistente Farben (aus Theme)
 * - Interaktive Tooltips
 * - Responsive
 * - Loading-State
 * - Empty-State
 * - Gradient-Fill
 * - Stacked Areas - optional
 *
 * @example
 * ```tsx
 * <ChartArea
 *   data={chartData}
 *   xKey="date"
 *   yKey="value"
 *   title="Trend über Zeit"
 *   loading={isLoading}
 *   height={300}
 *   gradientFill
 * />
 * ```
 */

"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface ChartAreaProps<T = any> {
  /**
   * Chart-Daten
   */
  data: T[];

  /**
   * Key für X-Achse
   */
  xKey: string;

  /**
   * Key für Y-Achse (kann Array sein für Stacked Areas)
   */
  yKey: string | string[];

  /**
   * Titel
   */
  title?: string;

  /**
   * Beschreibung
   */
  description?: string;

  /**
   * Höhe in px
   */
  height?: number;

  /**
   * Loading-State
   */
  loading?: boolean;

  /**
   * Farbe (CSS-Klasse oder HEX)
   */
  fillColor?: string | string[];

  /**
   * Zeige Grid
   */
  showGrid?: boolean;

  /**
   * Zeige Legend
   */
  showLegend?: boolean;

  /**
   * Gradient-Fill (empfohlen)
   */
  gradientFill?: boolean;

  /**
   * Stacked Areas
   */
  stacked?: boolean;

  /**
   * Zusätzliche Klassen
   */
  className?: string;

  /**
   * Custom Tooltip Formatter
   */
  tooltipFormatter?: (value: any) => string;

  /**
   * Custom X-Axis Formatter
   */
  xAxisFormatter?: (value: any) => string;

  /**
   * Custom Y-Axis Formatter
   */
  yAxisFormatter?: (value: any) => string;
}

// ============================================================================
// Component
// ============================================================================

export function ChartArea<T = any>({
  data,
  xKey,
  yKey,
  title,
  description,
  height = 300,
  loading = false,
  fillColor = "hsl(var(--primary))",
  showGrid = true,
  showLegend = false,
  gradientFill = true,
  stacked = false,
  className,
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
}: ChartAreaProps<T>) {
  // Multi-Area support
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];
  const fillColors = Array.isArray(fillColor) ? fillColor : [fillColor];

  // Loading State
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ height: `${height}px` }}
          >
            Keine Daten verfügbar
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            {gradientFill && (
              <defs>
                {yKeys.map((key, index) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={fillColors[index % fillColors.length]}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={fillColors[index % fillColors.length]}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
            )}

            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}

            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
              tickFormatter={xAxisFormatter}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
              tickFormatter={yAxisFormatter}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={tooltipFormatter}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />

            {showLegend && <Legend />}

            {yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={fillColors[index % fillColors.length]}
                strokeWidth={2}
                fill={
                  gradientFill
                    ? `url(#gradient-${key})`
                    : fillColors[index % fillColors.length]
                }
                stackId={stacked ? "stack" : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
