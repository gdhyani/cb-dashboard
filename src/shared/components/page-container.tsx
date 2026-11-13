import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const SIZES = {
  /** Settings and forms: a readable column. */
  small: "max-w-3xl",
  /** Lists, tables and detail pages use the width they get. */
  default: "max-w-none",
  large: "max-w-none",
  full: "max-w-none",
} as const;

/**
 * Page column with Studio gutters, aligned to the left edge of the content area (next to the rail or the project
 * menu) rather than floating in the middle of wide screens. Enters with the shared slide-up.
 */
export function PageContainer({
  size = "default",
  className,
  children,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("cb-enter flex w-full min-w-0 flex-col px-4 pb-16 sm:px-6 xl:px-10", SIZES[size], className)}>
      {children}
    </div>
  );
}
