/** Five-step grey ramp shared by every block chart (0 = empty, 4 = brightest). */
export const BLOCK_SHADES = ["#141414", "#2c2c2c", "#545454", "#8c8c8c", "#e8e8e8"] as const;

/** Maps a value to a shade step relative to the series maximum; zero stays empty. */
export function shadeStep(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((value / max) * 4)));
}
