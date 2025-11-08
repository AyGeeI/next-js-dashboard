import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CardMetricProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
}

export function CardMetric({ title, value, icon: Icon, description }: CardMetricProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
}
