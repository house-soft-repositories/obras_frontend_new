import { Skeleton } from "@/core/ui/atoms/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-[calc(100dvh-5rem)] items-center justify-center px-5 py-10">
      <section className="w-full max-w-lg rounded-app border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="space-y-3">
          <Skeleton variant="text" width={128} height={16} />
          <Skeleton variant="text" width="78%" height={32} />
          <Skeleton variant="text" width="92%" height={16} />
        </div>
        <div className="mt-8 space-y-3">
          <Skeleton variant="rectangular" height={48} />
          <Skeleton variant="rectangular" height={48} />
        </div>
      </section>
    </main>
  );
}
