import {
  Skeleton,
  SkeletonTable,
  SkeletonText,
} from "@/core/ui/atoms/skeleton";

export function PageHeaderSkeleton() {
  return (
    <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton variant="text" width={128} height={16} />
        <Skeleton variant="text" width="min(22rem, 75%)" height={40} />
        <SkeletonText lines={2} className="max-w-2xl" />
      </div>
      <Skeleton variant="rectangular" width={144} height={44} />
    </section>
  );
}

export function CollectionLoadingSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeaderSkeleton />
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <Skeleton variant="rectangular" width={240} height={44} />
        <Skeleton variant="rectangular" width={144} height={44} />
        <Skeleton variant="rectangular" width={112} height={44} />
      </div>
      <SkeletonTable rows={7} columns={4} />
    </main>
  );
}

export function DetailLoadingSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeaderSkeleton />
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-app border border-border bg-surface p-5 shadow-card">
          <Skeleton variant="text" width={180} height={24} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton variant="text" width={96} height={12} />
                <Skeleton variant="rectangular" height={40} />
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-app border border-border bg-surface p-5 shadow-card">
          <Skeleton variant="text" width={160} height={24} />
          <SkeletonText lines={6} className="mt-5" />
        </section>
      </div>
    </main>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeaderSkeleton />
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <Skeleton variant="rectangular" width={256} height={44} />
        <Skeleton variant="rectangular" width={96} height={44} />
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-app border border-border bg-surface p-5 shadow-card"
          >
            <Skeleton variant="text" width={120} height={14} />
            <Skeleton variant="text" width={72} height={40} className="mt-3" />
            <Skeleton variant="text" width={144} height={14} className="mt-2" />
          </div>
        ))}
      </section>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Skeleton variant="rectangular" height={320} />
        <Skeleton variant="rectangular" height={320} />
      </div>
    </main>
  );
}
