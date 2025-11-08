import { CardMetric } from "@/components/widgets/card-metric";
import { ChartMini } from "@/components/widgets/chart-mini";
import { mockDashboardMetrics, mockChartData } from "@/lib/mocks";
import { Target, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

const icons = [Target, TrendingUp, Calendar, CheckCircle2];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Übersicht</h2>
        <p className="max-w-2xl text-muted-foreground">
          Ihr persönliches Cockpit mit den wichtigsten Kennzahlen und schnellen Aktionen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockDashboardMetrics.map((metric, index) => (
          <CardMetric
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={icons[index]}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartMini title="Aktivität der letzten 6 Monate" data={mockChartData} />
        <ChartMini
          title="Monatliche Entwicklung"
          data={mockChartData.map((d) => ({ ...d, value: Math.round(d.value * 0.8) }))}
        />
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">Schnellzugriff</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4 transition-colors hover:bg-accent">
            <h4 className="font-medium">Wetter-Widget</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Aktuelle Vorhersagen für Ihren Standort
            </p>
          </div>
          <div className="rounded-lg border p-4 transition-colors hover:bg-accent">
            <h4 className="font-medium">Finanz-Übersicht</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Einnahmen, Ausgaben und Sparziele auf einen Blick
            </p>
          </div>
          <div className="rounded-lg border p-4 transition-colors hover:bg-accent">
            <h4 className="font-medium">Kalender</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Bevorstehende Termine und Events im Überblick
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
