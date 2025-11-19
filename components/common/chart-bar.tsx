/**
 * ChartBar Component
 *
 * Wiederverwendbare Bar-Chart-Komponente mit Recharts
 *
 * Features:
 * - Konsistente Farben (aus Theme)
 * - Interaktive Tooltips
 * - Responsive
 * - Loading-State
 * - Empty-State
 * - Horizontal/Vertical
 * - Stacked Bars - optional
 *
 * @example
 * ```tsx
 * <ChartBar
 *   data={chartData}
 *   xKey="category"
 *   yKey="value"
 *   title="Verkäufe nach Kategorie"
 *   loading={isLoading}
 *   height={300}
 * />
 * ```
 */

"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
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

export interface ChartBarProps<T = any> {
  /**
   * Chart-Daten
   */
  data: T[];

  /**
   * Key für X-Achse
   */
  xKey: string;

  /**
   * Key für Y-Achse (kann Array sein für Stacked Bars)
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
   * Farbe der Bars (CSS-Klasse oder HEX)
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
   * Horizontal Layout
   */
  horizontal?: boolean;

  /**
   * Stacked Bars
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

export function ChartBar<T = any>({
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
  horizontal = false,
  stacked = false,
  className,
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
}: ChartBarProps<T>) {
  // Multi-Bar support
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
          <BarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            )}

            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  tickFormatter={yAxisFormatter}
                />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  tickFormatter={xAxisFormatter}
                />
              </>
            ) : (
              <>
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
              </>
            )}

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
              <Bar
                key={key}
                dataKey={key}
                fill={fillColors[index % fillColors.length]}
                radius={[4, 4, 0, 0]}
                stackId={stacked ? "stack" : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
