"use client";

import { cn } from "@/core/ui/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
  ...props
}: SkeletonProps) {
  const baseStyles = cn(
    "bg-surface-subtle animate-skeleton",
    variant === "circular" && "rounded-full",
    variant === "rectangular" && "rounded-md",
    variant === "text" && "h-4 w-full",
    variant === "circular" && "aspect-square",
    animation === "pulse" && "animate-pulse",
    animation === "wave" && "animate-skeleton-wave",
    className,
  );

  const style = {
    width:
      width !== undefined
        ? typeof width === "number"
          ? `${width}px`
          : width
        : undefined,
    height:
      height !== undefined
        ? typeof height === "number"
          ? `${height}px`
          : height
        : undefined,
  } as React.CSSProperties;

  return (
    <div data-slot="skeleton" className={baseStyles} style={style} {...props} />
  );
}

export function SkeletonText({
  lines = 3,
  className,
  ...props
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={["100%", "80%", "60%"][i] ?? "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-app border border-border bg-surface p-5 space-y-4",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <SkeletonText lines={2} />
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={28} />
        <Skeleton variant="rectangular" width={80} height={28} />
      </div>
    </div>
  );
}

export function SkeletonTableRow({
  columns = 5,
  className,
  ...props
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <tr className={cn("h-14 border-t border-border", className)} {...props}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3 align-middle">
          <Skeleton variant="text" width="60%" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
  ...props
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-app border border-border bg-surface shadow-card",
        className,
      )}
      {...props}
    >
      <div className="border-b border-border px-5 py-4">
        <SkeletonText lines={2} />
      </div>
      <table>
        <thead className="bg-surface-subtle">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th
                key={i}
                className="h-12 px-4 py-3 text-left text-xs leading-4 font-semibold text-muted"
              >
                <Skeleton variant="rectangular" height={12} width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
