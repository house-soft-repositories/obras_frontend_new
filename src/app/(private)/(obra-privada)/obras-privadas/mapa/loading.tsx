import { PageHeaderSkeleton } from "@/app/_components/page-loading-skeleton";
import { Skeleton } from "@/core/ui/atoms/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeaderSkeleton />
      <Skeleton variant="rectangular" height={560} className="rounded-app" />
    </main>
  );
}
