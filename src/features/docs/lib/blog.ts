/** FR-DOC-010: helpers for the blog index and post pages. */

/** Newest first; posts on the same day sorted by title. */
export function sortPosts<T extends { title: string; date: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

const WORDS_PER_MINUTE = 220;

/** Reading time in whole minutes, at least one. */
export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** "2026-11-13" → "13 November 2026", read as a calendar day (UTC) so no timezone moves it. */
export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
