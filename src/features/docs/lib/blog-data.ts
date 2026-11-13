/**
 * FR-DOC-010: real data behind the blog charts. Nothing here is estimated.
 * - ENV_COMPOSITION: the 49 variable names in cb's own real-provider test app (`real-keys-app`), sorted by kind.
 *   Counted from names only; no value was read.
 * - LEAK_SCANS: the leak scans logged in PRD §17.4 / §20 (v1.33, v1.42, v1.48, v1.49).
 */
export type BarDatum = { label: string; value: number; secret?: boolean; note?: string };

export const ENV_COMPOSITION: BarDatum[] = [
  { label: "Settings and URLs", value: 11, note: "regions, sender names, base URLs" },
  { label: "API secret keys", value: 10, secret: true, note: "Stripe, OpenAI, Gemini, Clerk…" },
  { label: "Connection strings", value: 9, secret: true, note: "Postgres, MySQL, MongoDB, Redis, SMTP" },
  { label: "Public keys and IDs", value: 8, note: "publishable keys, client IDs" },
  { label: "Cloud access keys", value: 4, secret: true, note: "two AWS key pairs" },
  { label: "Webhook signing secrets", value: 3, secret: true, note: "Stripe snapshot + thin, Razorpay" },
  { label: "Sign-in client secrets", value: 2, secret: true, note: "Google, GitHub" },
  { label: "Key files and certificates", value: 2, secret: true, note: "a service-account JSON, a CA file" },
];

export type LeakScan = { run: string; date: string; secrets: number; files: number; leaks: number };

export const LEAK_SCANS: LeakScan[] = [
  { run: "First real-provider scan", date: "2026-10-06", secrets: 25, files: 92, leaks: 0 },
  { run: "After AWS S3 and SES", date: "2026-10-06", secrets: 20, files: 1474, leaks: 0 },
  { run: "Security suite", date: "2026-10-07", secrets: 31, files: 6131, leaks: 0 },
  { run: "Full security guide", date: "2026-10-07", secrets: 31, files: 12077, leaks: 0 },
];
