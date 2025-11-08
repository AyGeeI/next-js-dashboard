import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-8 w-1/2 rounded-xl" />
        <Skeleton className="h-4 w-3/4 rounded-xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border bg-card/80 p-6 shadow-sm">
          <Skeleton className="h-6 w-40 rounded-lg" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`profile-field-${index}`} className="space-y-2">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border bg-card/80 p-6 shadow-sm">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="mt-2 h-4 w-2/3 rounded" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`pill-${index}`} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card/80 p-6 shadow-sm">
            <Skeleton className="h-5 w-48 rounded" />
            <div className="mt-4 grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`password-field-${index}`} className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-6 h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
