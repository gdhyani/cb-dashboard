import type { ReactNode } from "react";
import type { ApiError } from "@/shared/api/api-error";
import { Skeleton } from "@/shared/ui/skeleton";
import { Admonition } from "./admonition";

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
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <Admonition type="destructive" title={error.message}>
        <span className="font-mono text-xs">
          {error.code} · correlation id {error.correlationId}
        </span>
      </Admonition>
    );
  }
  return <>{children}</>;
}
