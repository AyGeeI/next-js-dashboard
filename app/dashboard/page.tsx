import Link from "next/link";
import { CardMetric } from "@/components/widgets/card-metric";
import { ChartMini } from "@/components/widgets/chart-mini";
import { mockDashboardMetrics, mockChartData } from "@/lib/mocks";
import { Target, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

const icons = [Target, TrendingUp, Calendar, CheckCircle2];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in-50">
        <h1 className="text-2xl font-semibold">Dashboard Übersicht</h1>
        <p className="text-sm text-muted-foreground">
          Ihr persönliches Cockpit mit den wichtigsten Kennzahlen und schnellen Aktionen.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockDashboardMetrics.map((metric, index) => (
          <CardMetric
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={icons[index]}
            delta={{
              value: "+12.5%",
              trend: "up",
              label: "vs. letzter Monat"
            }}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ChartMini title="Aktivität der letzten 6 Monate" data={mockChartData} />
        <ChartMini
          title="Monatliche Entwicklung"
          data={mockChartData.map((d) => ({ ...d, value: Math.round(d.value * 0.8) }))}
        />
      </section>

      <section className="rounded-md border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Schnellzugriff</h3>
        <p className="text-xs text-muted-foreground">Öffne häufig genutzte Bereiche ohne Umwege.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Wetter-Widget",
              description: "Aktuelle Vorhersagen für deinen Standort",
              href: "/dashboard/wetter",
            },
            {
              title: "Finanz-Übersicht",
              description: "Einnahmen, Ausgaben und Sparziele auf einen Blick",
              href: "/dashboard/finanzen",
            },
            {
              title: "Kalender",
              description: "Bevorstehende Termine und Events im Überblick",
              href: "/dashboard/kalender",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-md border p-4 transition-all duration-200 hover:border-primary/40 hover:bg-accent motion-reduce:transition-none"
            >
              <h4 className="text-sm font-medium">{item.title}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">
                Öffnen →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
