import { BADGE_DOTS, BADGE_SHAPE, BADGE_TONES, type BadgeTone } from "@/shared/lib/badge-tones";
import { cn } from "@/shared/lib/utils";

/** Label for roles, types and states, coloured by the design system's badge tones. Sentence case in source. */
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
    <span className={cn(BADGE_SHAPE, BADGE_TONES[tone])}>
      {dot && <span className={cn("size-1.5 rounded-full", BADGE_DOTS[tone])} aria-hidden="true" />}
      {children}
    </span>
  );
}
