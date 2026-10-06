import { BADGE_DOTS, BADGE_TONES, type BadgeTone } from "@/shared/lib/badge-tones";
import { cn } from "@/shared/lib/utils";

/** Soft boxy label for roles, types and states, coloured by the design system's badge tones. Sentence case. */
export function BadgeLabel({
  children,
  tone = "default",
  dot = false,
}: {
  children: string;
  tone?: BadgeTone;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium whitespace-nowrap",
        BADGE_TONES[tone],
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", BADGE_DOTS[tone])} aria-hidden="true" />}
      {children}
    </span>
  );
}
