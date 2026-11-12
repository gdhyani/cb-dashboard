/**
 * FR-DOC-010: which providers are verified against a real account (PRD §17.4) and which are Beta. One group per
 * connector family; names match the connector catalog so the blog chart and the Beta badges never disagree.
 */
export type CoverageGroup = { group: string; verified: string[]; beta: string[] };

export const COVERAGE: CoverageGroup[] = [
  {
    group: "Databases",
    verified: [
      "MongoDB Atlas",
      "Postgres (Neon)",
      "MySQL (TiDB)",
      "MySQL (Aiven)",
      "Redis Cloud",
      "Upstash Redis",
      "Supabase",
    ],
    beta: ["Amazon RDS Postgres"],
  },
  { group: "Payments and webhooks", verified: ["Stripe", "Razorpay"], beta: [] },
  {
    group: "AI providers",
    verified: ["OpenAI", "Google Gemini", "Groq", "OpenRouter", "Custom / self-hosted AI"],
    beta: ["Anthropic", "Mistral"],
  },
  {
    group: "Cloud and email",
    verified: ["Amazon S3", "Amazon SES", "SMTP (Resend)"],
    beta: ["Cloudflare R2 / S3-compatible", "Amazon SQS"],
  },
  { group: "Other APIs", verified: ["Clerk", "Resend API"], beta: [] },
  {
    group: "Sign-in and push",
    verified: ["Google sign-in", "GitHub sign-in", "Firebase / FCM"],
    beta: ["Other sign-in (OAuth)", "Apple Push"],
  },
];

export function coverageTotals(): { verified: number; beta: number } {
  return COVERAGE.reduce((t, g) => ({ verified: t.verified + g.verified.length, beta: t.beta + g.beta.length }), {
    verified: 0,
    beta: 0,
  });
}
