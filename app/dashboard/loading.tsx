import { Skeleton } from "@/components/ui/skeleton";

const barHeights = [72, 48, 64, 40, 58, 82, 46, 70, 34, 60, 50, 76];

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`metric-${index}`} className="rounded-md border bg-card/80 p-6 shadow-sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-4 h-9 w-32" />
            <Skeleton className="mt-6 h-3 w-16" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`chart-${index}`} className="rounded-md border bg-card/80 p-6 shadow-sm">
            <Skeleton className="h-5 w-1/2" />
            <div className="mt-6 flex items-end gap-2">
              {barHeights.map((height, barIndex) => (
                <Skeleton
                  key={`bar-${index}-${barIndex}`}
                  className="w-full rounded-full"
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border bg-card/80 p-6 shadow-sm">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`quick-${index}`} className="space-y-3 rounded-md border border-dashed p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
