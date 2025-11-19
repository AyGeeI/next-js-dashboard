/**
 * ChartLine Component
 *
 * Wiederverwendbare Line-Chart-Komponente mit Recharts
 *
 * Features:
 * - Konsistente Farben (aus Theme)
 * - Interaktive Tooltips
 * - Responsive
 * - Loading-State
 * - Empty-State
 * - Export-Funktion (als PNG/CSV) - optional
 * - Grid-Lines
 * - Gradient-Fill - optional
 *
 * @example
 * ```tsx
 * <ChartLine
 *   data={chartData}
 *   xKey="date"
 *   yKey="value"
 *   title="Aktivität der letzten 30 Tage"
 *   loading={isLoading}
 *   height={300}
 * />
 * ```
 */

"use client";

import * as React from "react";
import {
  LineChart,
  Line,
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

export interface ChartLineProps<T = any> {
  /**
   * Chart-Daten
   */
  data: T[];

  /**
   * Key für X-Achse
   */
  xKey: string;

  /**
   * Key für Y-Achse
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
   * Farbe der Line (CSS-Klasse oder HEX)
   */
  strokeColor?: string;

  /**
   * Zeige Grid
   */
  showGrid?: boolean;

  /**
   * Zeige Legend
   */
  showLegend?: boolean;

  /**
   * Gradient-Fill
   */
  gradientFill?: boolean;

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

export function ChartLine<T = any>({
  data,
  xKey,
  yKey,
  title,
  description,
  height = 300,
  loading = false,
  strokeColor = "hsl(var(--primary))",
  showGrid = true,
  showLegend = false,
  gradientFill = false,
  className,
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
}: ChartLineProps<T>) {
  // Multi-Line support
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];

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
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            {gradientFill && (
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
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
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={strokeColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                fill={gradientFill ? "url(#colorValue)" : "none"}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
