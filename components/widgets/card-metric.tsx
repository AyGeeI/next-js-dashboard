import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardMetricProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  valueClassName?: string;
}

export function CardMetric({ title, value, icon: Icon, description, valueClassName }: CardMetricProps) {
  return (
    <Card className="group overflow-hidden rounded-2xl border bg-card/95 p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-semibold tracking-tight", valueClassName ?? "text-primary")}>{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <div className="rounded-xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary/15">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
}
