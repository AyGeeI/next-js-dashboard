/**
 * LoadingSpinner Component
 *
 * Wiederverwendbarer Loading-Spinner
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPINNER_SIZE } from "@/lib/constants/ui";

export interface LoadingSpinnerProps {
  size?: keyof typeof SPINNER_SIZE;
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", SPINNER_SIZE[size], className)}
      aria-hidden="true"
    />
  );
}
