import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

const variants = cva(
  "flex w-full gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm transition-colors duration-300 backdrop-blur motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-top-1",
  {
    variants: {
      variant: {
        info: "border-info/40 bg-info/10",
        success: "border-success/40 bg-success/10",
        warning: "border-warning/50 bg-warning/10",
        error: "border-destructive/50 bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

type NotificationVariant = NonNullable<VariantProps<typeof variants>["variant"]>;

const iconMap: Record<NotificationVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: AlertCircle,
};

const accentMap: Record<NotificationVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

interface NotificationBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof variants> {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
}

export function NotificationBanner({
  title,
  description,
  action,
  variant = "info",
  className,
  role,
  children,
  ...props
}: NotificationBannerProps) {
  const resolvedVariant: NotificationVariant = variant ?? "info";
  const Icon = iconMap[resolvedVariant];
  const accent = accentMap[resolvedVariant];
  const resolvedRole = role ?? (resolvedVariant === "error" ? "alert" : "status");

  return (
    <section
      className={cn(variants({ variant: resolvedVariant }), className)}
      role={resolvedRole}
      aria-live={resolvedVariant === "error" ? "assertive" : "polite"}
      {...props}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl border border-current/20 bg-background/80 text-base",
          accent
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex flex-1 flex-col gap-1">
        {title && <p className={cn("text-sm font-semibold leading-tight", accent)}>{title}</p>}
        {description && (
          <p className="text-sm text-foreground/80 dark:text-foreground/80">{description}</p>
        )}
        {children ? (
          <div className="text-xs text-muted-foreground">{children}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}
