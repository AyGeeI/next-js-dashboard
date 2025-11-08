import { CardMetric } from "@/components/widgets/card-metric";
import { ChartMini } from "@/components/widgets/chart-mini";
import { mockDashboardMetrics, mockChartData } from "@/lib/mocks";
import { Target, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";

const icons = [Target, TrendingUp, Calendar, CheckCircle2];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 motion-safe:animate-in motion-safe:fade-in-50">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Übersicht</h2>
        <p className="max-w-2xl text-muted-foreground">
          Ihr persönliches Cockpit mit den wichtigsten Kennzahlen und schnellen Aktionen.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockDashboardMetrics.map((metric, index) => (
          <CardMetric key={metric.title} title={metric.title} value={metric.value} icon={icons[index]} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartMini title="Aktivität der letzten 6 Monate" data={mockChartData} />
        <ChartMini
          title="Monatliche Entwicklung"
          data={mockChartData.map((d) => ({ ...d, value: Math.round(d.value * 0.8) }))}
        />
      </section>

      <section className="rounded-2xl border bg-card/95 p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Schnellzugriff</h3>
        <p className="text-sm text-muted-foreground">Öffne häufig genutzte Bereiche ohne Umwege.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Wetter-Widget",
              description: "Aktuelle Vorhersagen für deinen Standort",
            },
            {
              title: "Finanz-Übersicht",
              description: "Einnahmen, Ausgaben und Sparziele auf einen Blick",
            },
            {
              title: "Kalender",
              description: "Bevorstehende Termine und Events im Überblick",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent motion-reduce:transition-none"
            >
              <h4 className="font-medium">{item.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">
                Öffnen
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
