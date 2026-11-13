const green = (pct: number) => `color-mix(in oklch, var(--color-primary-bright) ${pct}%, transparent)`;

/**
 * Five-step ramp shared by every block chart (0 = empty, 4 = strongest). Charts use the bright accent (cb teal) as
 * the single-series colour; empty cells are the quiet control wash. Theme-aware through the CSS tokens.
 */
export const BLOCK_SHADES = ["var(--color-control)", green(28), green(50), green(75), green(100)] as const;

/** Maps a value to a shade step relative to the series maximum; zero stays empty. */
export function shadeStep(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((value / max) * 4)));
}
