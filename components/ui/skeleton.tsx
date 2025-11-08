import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/80 shadow-inner shadow-black/5 dark:bg-muted/70",
        className
      )}
      {...props}
    />
  );
}
