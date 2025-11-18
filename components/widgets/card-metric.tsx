import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardMetricProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  valueClassName?: string;
  delta?: {
    value: string;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
}

export function CardMetric({ title, value, icon: Icon, description, valueClassName, delta }: CardMetricProps) {
  return (
    <Card className="group overflow-hidden rounded-md border bg-card p-0 shadow-sm transition-all duration-200 hover:border-primary/40 motion-reduce:transition-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        {Icon && (
          <div className="rounded-md bg-primary/10 p-2 text-primary transition group-hover:bg-primary/15">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-semibold", valueClassName)}>{value}</div>
        {(description || delta) && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {delta && (
              <>
                {delta.trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
                {delta.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                <span className={cn(
                  "font-medium",
                  delta.trend === "up" && "text-emerald-600",
                  delta.trend === "down" && "text-red-600"
                )}>
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
