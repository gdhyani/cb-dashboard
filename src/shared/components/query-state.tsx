import type { ReactNode } from "react";
import type { ApiError } from "@/shared/api/api-error";
import { Skeleton } from "@/shared/ui/skeleton";

/** Loading and error rendering shared by every data view. Errors show code + correlation id. */
export function QueryState({
  isPending,
  error,
  rows = 3,
  skeleton,
  children,
}: {
  isPending: boolean;
  error: ApiError | null;
  rows?: number;
  /** Content-shaped placeholder (SkeletonRows, SkeletonCards…); defaults to plain bars. */
  skeleton?: ReactNode;
  children: ReactNode;
}) {
  if (isPending && skeleton) return <>{skeleton}</>;
  if (isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {Array.from({ length: rows }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="flex flex-col gap-1 rounded-lg border border-destructive/40 p-4 text-sm">
        <p className="font-medium text-destructive">{error.message}</p>
        <p className="font-mono text-xs text-subtle">
          {error.code} · correlation id {error.correlationId}
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
