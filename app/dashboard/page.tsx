/**
 * Dashboard Overview Page
 *
 * Main dashboard with:
 * - Enhanced CardMetrics with click-to-drill-down
 * - Enhanced Charts with loading/empty states
 * - Time range filter
 * - Quick access section
 * - Loading states (Skeletons)
 * - Empty states
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CardMetric } from "@/components/widgets/card-metric";
import { ChartLine } from "@/components/common/chart-line";
import { ChartBar } from "@/components/common/chart-bar";
import { mockDashboardMetrics, mockChartData } from "@/lib/mocks";
import { Target, TrendingUp, Calendar, CheckCircle2, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// Data
// ============================================================================

const icons = [Target, TrendingUp, Calendar, CheckCircle2];

// Mock trend data for sparklines
const mockTrendData = [100, 120, 115, 140, 135, 150, 145, 160];

// ============================================================================
// Component
// ============================================================================

export default function DashboardPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(false);

  // Simulate loading state
  const handleTimeRangeChange = (value: string) => {
    setLoading(true);
    setTimeRange(value);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Click handlers for metrics
  const handleMetricClick = (metric: string) => {
    router.push(`/dashboard/analytics?metric=${metric}`);
  };

  return (
    <div className="space-y-10">
      {/* Page Header with Time Range Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between motion-safe:animate-in motion-safe:fade-in-50">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Dashboard Übersicht</h1>
          <p className="text-sm text-muted-foreground">
            Ihr persönliches Cockpit mit den wichtigsten Kennzahlen und schnellen Aktionen.
          </p>
        </div>

        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Zeitraum wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Letzte 7 Tage</SelectItem>
            <SelectItem value="30d">Letzte 30 Tage</SelectItem>
            <SelectItem value="90d">Letzte 90 Tage</SelectItem>
            <SelectItem value="12m">Letzte 12 Monate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Metrics Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockDashboardMetrics.map((metric, index) => (
          <CardMetric
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={icons[index]}
            description={`Zeitraum: ${timeRange === "7d" ? "7 Tage" : timeRange === "30d" ? "30 Tage" : timeRange === "90d" ? "90 Tage" : "12 Monate"}`}
            delta={{
              value: "+12.5%",
              trend: "up",
              label: "vs. vorher",
            }}
            loading={loading}
            trend={mockTrendData}
            onClick={() => handleMetricClick(metric.title.toLowerCase())}
            tooltip={`Klicken für Details zu ${metric.title}`}
          />
        ))}
      </section>

      {/* Charts Grid */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartLine
          data={mockChartData}
          xKey="month"
          yKey="value"
          title="Aktivität der letzten 6 Monate"
          description="Monatliche Aktivitätsentwicklung im Verlauf"
          loading={loading}
          showGrid
          gradientFill
          height={300}
          strokeColor="hsl(var(--primary))"
        />

        <ChartBar
          data={mockChartData}
          xKey="month"
          yKey="value"
          title="Monatliche Entwicklung"
          description="Vergleich der monatlichen Entwicklung"
          loading={loading}
          showGrid
          height={300}
          fillColor="hsl(var(--primary))"
        />
      </section>

      {/* Quick Access Section */}
      <section className="rounded-md border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Schnellzugriff</h3>
            <p className="text-xs text-muted-foreground">
              Öffne häufig genutzte Bereiche ohne Umwege.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Anpassen
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Wetter-Widget",
              description: "Aktuelle Vorhersagen für deinen Standort",
              href: "/dashboard/widgets/weather",
            },
            {
              title: "Finanz-Übersicht",
              description: "Einnahmen, Ausgaben und Sparziele auf einen Blick",
              href: "/dashboard/widgets/finance",
            },
            {
              title: "Nachrichten",
              description: "Aktuelle News und Updates",
              href: "/dashboard/widgets/news",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-md border p-4 transition-all duration-200 hover:border-primary/40 hover:bg-accent motion-reduce:transition-none"
            >
              <h4 className="text-sm font-medium group-hover:text-primary">
                {item.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.description}
              </p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">
                Öffnen →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Empty State Example (commented out for now) */}
      {/* {mockDashboardMetrics.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-card p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">Noch keine Daten</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Verbinde deine Services, um Daten zu erfassen.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/settings")}>
            Services konfigurieren
          </Button>
        </div>
      )} */}
    </div>
  );
}
