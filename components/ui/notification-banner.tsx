import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

const variants = cva(
  "flex w-full flex-col gap-4 rounded-md border px-4 py-3 text-sm shadow-sm transition-colors duration-300 backdrop-blur motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-top-1 sm:flex-row sm:items-start",
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
      <div className="flex w-full items-start gap-3 sm:flex-1 sm:items-center">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md border border-current/20 bg-background/80 text-base",
            accent
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
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
      </div>
      {action ? (
        <div className="flex w-full items-center justify-start sm:w-auto sm:justify-end">{action}</div>
      ) : null}
    </section>
  );
}
