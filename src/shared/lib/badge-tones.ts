/**
 * Badge colours (PRD v1.32, v1.59). One palette for every badge (BadgeLabel, Badge). Two skins from one source:
 * docs keep the soft tinted boxes; dashboard surfaces (`studio:`) use Supabase's small bordered pills, tinted by
 * meaning only (neutral, info violet, green success, orange warning, red danger, quiet muted).
 */
export const BADGE_TONES = {
  /** Neutral information: a developer role, "Waiting". */
  default: "bg-sky-400/15 text-sky-300 studio:border-border-strong studio:bg-surface-75 studio:text-foreground-light",
  /** Emphasis: owner/admin roles, "This browser", "This environment". */
  strong: "bg-violet-400/15 text-violet-300 studio:border-info/40 studio:bg-info/10 studio:text-info",
  /** Good state: "Access granted", "Delivered". */
  success: "bg-emerald-400/15 text-emerald-300 studio:border-success/40 studio:bg-success/10 studio:text-success",
  /** Needs attention: "Suspended", "Retrying", denied activity. */
  warning: "bg-amber-400/15 text-amber-300 studio:border-warning/40 studio:bg-warning/10 studio:text-warning",
  /** Failed or destructive. */
  danger:
    "bg-destructive/15 text-destructive studio:border-destructive/40 studio:bg-destructive/10 studio:text-destructive",
  /** Quiet: "No access", "Via project access". */
  muted: "bg-white/[0.06] text-subtle studio:border-border studio:bg-transparent studio:text-foreground-lighter",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

/** Shape shared by every badge: docs boxy label; dashboard Supabase pill (uppercase micro text, hairline border). */
export const BADGE_SHAPE =
  "inline-flex h-5 items-center gap-1.5 rounded-md border border-transparent px-1.5 text-xs font-medium whitespace-nowrap studio:h-[18px] studio:gap-1 studio:rounded-full studio:px-[7px] studio:text-[10px] studio:leading-none studio:font-medium studio:uppercase studio:tracking-[0.07em]";

/** Dot colour for badges that carry one. */
export const BADGE_DOTS: Record<BadgeTone, string> = {
  default: "bg-sky-400 studio:bg-foreground-lighter",
  strong: "bg-violet-400 studio:bg-info",
  success: "bg-emerald-400 studio:bg-success",
  warning: "bg-amber-400 studio:bg-warning",
  danger: "bg-destructive",
  muted: "bg-current",
};
