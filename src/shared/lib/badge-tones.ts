/**
 * The design system's badge colours (PRD v1.32): soft tinted boxes. Every badge (BadgeLabel, Badge) uses these,
 * so a new badge is coloured the same way everywhere.
 */
export const BADGE_TONES = {
  /** Neutral information: a developer role, "Waiting". */
  default: "bg-sky-400/15 text-sky-300",
  /** Emphasis: owner/admin roles, "This browser", "This environment". */
  strong: "bg-violet-400/15 text-violet-300",
  /** Good state: "Access granted", "Delivered". */
  success: "bg-emerald-400/15 text-emerald-300",
  /** Needs attention: "Suspended", "Retrying", denied activity. */
  warning: "bg-amber-400/15 text-amber-300",
  /** Failed or destructive. */
  danger: "bg-destructive/15 text-destructive",
  /** Quiet: "No access", "Via project access". */
  muted: "bg-white/[0.06] text-subtle",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

/** Dot colour for badges that carry one. */
export const BADGE_DOTS: Record<BadgeTone, string> = {
  default: "bg-sky-400",
  strong: "bg-violet-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-destructive",
  muted: "bg-current",
};
