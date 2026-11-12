import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const SIZES = {
  /** Settings and forms. */
  small: "max-w-[768px]",
  /** Lists and detail pages. */
  default: "max-w-[1200px]",
  large: "max-w-[1600px]",
  full: "max-w-none",
} as const;

/** Supabase PageContainer: centred column with the Studio gutters; enters with the shared slide-up. */
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
    <div
      className={cn(
        "cb-enter mx-auto flex w-full min-w-0 flex-col px-4 pb-16 sm:px-6 xl:px-10",
        SIZES[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
