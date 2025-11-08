"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartMiniProps {
  title: string;
  data: ChartDataPoint[];
}

export function ChartMini({ title, data }: ChartMiniProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <Card className="rounded-2xl border bg-card/95 shadow-sm motion-safe:animate-in motion-safe:fade-in-50">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end justify-between gap-2" aria-hidden="true">
          {data.map((point, index) => {
            const heightPercent = (point.value / maxValue) * 100;
            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full rounded-full bg-muted/60">
                  <div
                    className="w-full rounded-full bg-primary transition-[height,opacity] duration-500 ease-out hover:opacity-80"
                    style={{ height: `${Math.max(heightPercent, 6)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{point.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
