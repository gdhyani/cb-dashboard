export type ConnectorGroup = "basic" | "databases" | "payments" | "ai" | "cloud" | "sign-in" | "push" | "other";
export type Connector = { slug: string; name: string; group: ConnectorGroup; beta: boolean; logo: string };

/**
 * One list for the connector cards and the content test (FR-DOC-006). Page = /docs/connectors/<group>/<slug>.
 * `beta` follows PRD §17.4: not yet verified against the real provider. `logo` is a ServiceLogo icon id.
 */
export const CONNECTORS: Connector[] = [
  { slug: "plain", name: "Plain value", group: "basic", beta: false, logo: "letter:Aa" },
  { slug: "random-secret", name: "Random secret", group: "basic", beta: false, logo: "secret" },
  { slug: "shown-as-is", name: "Secret shown as-is", group: "basic", beta: false, logo: "letter:!" },
  { slug: "mongodb", name: "MongoDB", group: "databases", beta: false, logo: "mongodb" },
  { slug: "postgres", name: "PostgreSQL", group: "databases", beta: true, logo: "postgresql" },
  { slug: "mysql", name: "MySQL", group: "databases", beta: true, logo: "mysql" },
  { slug: "redis", name: "Redis", group: "databases", beta: true, logo: "redis" },
  { slug: "stripe", name: "Stripe", group: "payments", beta: false, logo: "stripe" },
  { slug: "razorpay", name: "Razorpay", group: "payments", beta: false, logo: "razorpay" },
  { slug: "openai", name: "OpenAI", group: "ai", beta: true, logo: "letter:AI" },
  { slug: "anthropic", name: "Anthropic", group: "ai", beta: true, logo: "anthropic" },
  { slug: "gemini", name: "Google Gemini", group: "ai", beta: true, logo: "googlegemini" },
  { slug: "groq", name: "Groq", group: "ai", beta: true, logo: "letter:Gq" },
  { slug: "mistral", name: "Mistral", group: "ai", beta: true, logo: "mistralai" },
  { slug: "openrouter", name: "OpenRouter", group: "ai", beta: true, logo: "openrouter" },
  { slug: "custom-ai", name: "Custom AI (self-hosted)", group: "ai", beta: true, logo: "letter:⌂" },
  { slug: "aws", name: "AWS (S3, R2, SES, SQS)", group: "cloud", beta: true, logo: "aws" },
  { slug: "smtp", name: "SMTP email", group: "cloud", beta: true, logo: "mail" },
  { slug: "google", name: "Google sign-in", group: "sign-in", beta: true, logo: "google" },
  { slug: "github", name: "GitHub sign-in", group: "sign-in", beta: true, logo: "github" },
  { slug: "oauth", name: "Other sign-in (OAuth)", group: "sign-in", beta: true, logo: "letter:ID" },
  { slug: "firebase", name: "Firebase / FCM", group: "push", beta: true, logo: "firebase" },
  { slug: "apns", name: "Apple Push (APNs)", group: "push", beta: true, logo: "apple" },
  { slug: "api-key", name: "Other API key", group: "other", beta: true, logo: "api" },
];

export const connectorHref = (c: Connector) => `/docs/connectors/${c.group}/${c.slug}`;
