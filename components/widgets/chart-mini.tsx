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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end justify-between gap-2">
          {data.map((point, index) => {
            const heightPercent = (point.value / maxValue) * 100;
            return (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t-sm bg-primary transition-all hover:opacity-80"
                    style={{ height: `${heightPercent}%`, minHeight: "4px" }}
                    title={`${point.label}: ${point.value}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{point.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
