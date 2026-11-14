/**
 * Every visible string on the landing page (`/`), taken from product.md. No real secret appears here or on the page:
 * real keys are only ever masked ("sk_live_••••"), and placeholder keys are shown as cb-marked words so they can't be
 * mistaken for a key (FR-LP-003).
 */
import { BLOG_PATH, DOCS_PATH, GITHUB_URLS, LOGIN_PATH } from "@/constants";

export const SIGNUP_PATH = "/signup";

export const nav = [
  { label: "The problem", href: "#leaks" },
  { label: "AI agents", href: "#ai" },
  { label: "How it works", href: "#how" },
  { label: "Services", href: "#services" },
  { label: "Docs", href: DOCS_PATH },
  { label: "Blog", href: BLOG_PATH },
] as const;

export const auth = {
  signIn: { label: "Sign in", href: LOGIN_PATH },
  start: { label: "Get started", href: SIGNUP_PATH },
};

export const hero = {
  kicker: "Credential broker for development teams",
  title: "Develop with zero secrets.",
  lede: "cb gives every developer’s app placeholder keys instead of real ones. When the app calls Stripe, a database or OpenAI, cb adds the real key on its own server. An npm package, a log line or an AI coding agent can read your .env and find nothing that works.",
  primary: { label: "Get started", href: SIGNUP_PATH },
  secondary: { label: "Read the docs", href: DOCS_PATH },
  install: "npm i -D @cb/env",
};

export type Chapter = {
  id: string;
  node: string;
  /** One technical line under the node in the figure. */
  detail: string;
  where: "machine" | "server";
  title: string;
  text: string;
  code?: string;
};

export const how = {
  title: "How cb works, step by step",
  intro:
    "Developers keep running npm run dev as usual. Follow one Stripe call from a developer machine to Stripe: the real key is only added at the very end, on cb’s server.",
  boundary: "The developer machine ends here",
  chapters: [
    {
      id: "app",
      node: "Your .env",
      detail: "real key",
      where: "machine",
      title: "Today, your .env holds the real key",
      text: "Anything running on the machine can read it. With cb, the real key moves to cb’s server, encrypted, and never comes back. You still type npm run dev; the app now starts with placeholder keys.",
      code: "STRIPE_SECRET_KEY=sk_live_••••••••",
    },
    {
      id: "preload",
      node: "Preload",
      detail: "@cb/env/register",
      where: "machine",
      title: "Your app only sees a placeholder",
      text: "Before your code runs, cb fills process.env with placeholder keys. When an SDK calls its service, like api.stripe.com, the call goes to cb’s local agent instead. Security checks such as TLS verification stay on.",
      code: "tls.connect(api.stripe.com:443) → 127.0.0.1:7403",
    },
    {
      id: "agent",
      node: "Agent",
      detail: "127.0.0.1:7403",
      where: "machine",
      title: "A small local helper forwards the call",
      text: "The cb agent runs in the background and only accepts connections from your own machine. It forwards the call with your identity and holds no keys, so there is nothing in it to steal.",
    },
    {
      id: "tunnel",
      node: "Tunnel",
      detail: "WSS + session token",
      where: "server",
      title: "An encrypted tunnel to cb",
      text: "Every connection gets its own encrypted tunnel. Before anything is sent, cb checks who you are, which device this is, and that you still have access to this service.",
    },
    {
      id: "gateway",
      node: "Gateway",
      detail: "verify, swap, scrub",
      where: "server",
      title: "cb adds the real key",
      text: "cb’s gateway checks that the placeholder belongs to your device, then replaces it with the real key, decrypted only for this request. Replies are cleaned, so the real key never comes back to you, not even in an error.",
    },
    {
      id: "service",
      node: "api.stripe.com",
      detail: "official SDK, unchanged",
      where: "server",
      title: "Stripe gets the real key",
      text: "Stripe receives a normal request with the real key, sent from cb, not from the developer machine. Your code used the official Stripe SDK, unchanged. Postgres, OpenAI and the rest work the same way.",
    },
  ] satisfies Chapter[],
};

export const routes = {
  title: "No code changes, however your app connects",
  layer1: {
    label: "Connection strings",
    flow: ["DATABASE_URL", "127.0.0.1:7401", "cb gateway", "Postgres"],
    name: "Databases and service URLs",
    text: "For values that are addresses, like DATABASE_URL, cb points them at a local port on the machine. Your database driver connects as usual, and cb signs in to the real Postgres, MySQL, MongoDB or Redis for you.",
    code: [
      "DATABASE_URL=postgresql://cb-silver-fox@127.0.0.1:7401",
      "REDIS_URL=redis://cb-maple-cloud@127.0.0.1:7402",
      "OPENAI_BASE_URL=http://127.0.0.1:7404/v1",
    ],
  },
  layer2: {
    label: "Built-in addresses",
    flow: ["Stripe SDK", "api.stripe.com", "cb gateway", "Stripe"],
    name: "SDKs that call a fixed address",
    text: "Stripe, Razorpay, Google sign-in, Firebase and Apple Push always call their own servers. cb redirects just those calls, and only inside apps it started. Nothing is installed on your machine and your code stays the same.",
    code: [
      "const stripe = new Stripe(",
      "  process.env.STRIPE_SECRET_KEY);",
      "await stripe.paymentIntents.create({",
      '  amount: 2000, currency: "usd" });',
    ],
  },
};

export const kinds = {
  title: "Choose how each variable is handled",
  rows: [
    {
      name: "Protected",
      sees: "A placeholder bound to their device",
      text: "cb swaps it for the real key when the app calls the service. Copied anywhere else, it does nothing.",
      example: "sk_test_cb_amber-otter-falls",
    },
    {
      name: "Random secret",
      sees: "A value made just for them",
      text: "Session and signing secrets are generated for each developer, so one person’s value is useless to anyone else.",
      example: "cb-tidy-moon-cedar-orbit",
    },
    {
      name: "Plain",
      sees: "The value as typed",
      text: "Ports, public URLs and publishable keys. Nothing secret, so the app gets the value directly.",
      example: "PORT=3000",
    },
    {
      name: "Shown as-is",
      sees: "The real value, with a warning",
      text: "The last resort for a key cb can’t protect yet. It is flagged everywhere it appears.",
      example: "Flagged",
    },
  ],
};

/** `icon`: a ServiceLogo key (brand mark, glyph or "letter:XX"). */
export type Service = { name: string; icon: string; desc: string; note?: string; beta?: boolean; supported?: boolean };
export type ServiceGroup = { name: string; span: "wide" | "narrow"; items: Service[] };

/** Verification status from PRD §17.4: "Beta" = not yet run against a real provider account. */
export const services = {
  title: "Works with the services you already use",
  /** The hub: your app's side (left) and a few services (right), wired through cb. */
  hubLeft: [
    { name: "Next.js", icon: "nextdotjs" },
    { name: "Node.js", icon: "nodedotjs" },
    { name: "Prisma", icon: "prisma" },
    { name: "NestJS", icon: "nestjs" },
    { name: "React", icon: "react" },
  ],
  hubRight: [
    { name: "PostgreSQL", icon: "postgresql" },
    { name: "MongoDB", icon: "mongodb" },
    { name: "Stripe", icon: "stripe" },
    { name: "Gemini", icon: "googlegemini" },
    { name: "Supabase", icon: "supabase" },
    { name: "Firebase", icon: "firebase" },
  ],
  more: "and more.",
  moreText: "Anything else that takes a key in a header, Bearer or Basic: Clerk, Resend, your own internal APIs.",
  legend: { verified: "Run against a real account", beta: "Beta", betaText: "Not yet run against a real account" },
  groups: [
    {
      name: "Databases",
      span: "wide",
      items: [
        {
          name: "PostgreSQL",
          icon: "postgresql",
          desc: "Any host, Neon included. Prisma, pg, Drizzle and Knex.",
          note: "Neon, any host · Amazon RDS in beta",
        },
        {
          name: "MySQL",
          icon: "mysql",
          desc: "TiDB Cloud, Aiven or your own. mysql2 and Prisma.",
          note: "TiDB Cloud, Aiven",
        },
        {
          name: "MongoDB",
          icon: "mongodb",
          desc: "Atlas and mongodb+srv, with the official driver or mongoose.",
          note: "Atlas, mongodb+srv",
        },
        {
          name: "Redis",
          icon: "redis",
          desc: "Redis Cloud and Upstash over TLS. ioredis and node-redis.",
          note: "Redis Cloud, Upstash",
        },
        {
          name: "Supabase",
          icon: "supabase",
          desc: "The secret key stays with cb; the public key works as usual.",
          note: "secret key brokered",
        },
      ],
    },
    {
      name: "AI",
      span: "narrow",
      items: [
        { name: "OpenAI", icon: "letter:AI", desc: "Chat, streaming and models through the official SDK." },
        { name: "Google Gemini", icon: "googlegemini", desc: "@google/genai on its own host, redirected." },
        { name: "Groq", icon: "letter:GQ", desc: "groq-sdk, unchanged." },
        { name: "OpenRouter", icon: "openrouter", desc: "Both its OpenAI and Anthropic style APIs." },
        {
          name: "Anthropic",
          icon: "anthropic",
          desc: "The official SDK. Not yet run against a real account.",
          beta: true,
        },
        {
          name: "Mistral",
          icon: "mistralai",
          desc: "The official SDK. Not yet run against a real account.",
          beta: true,
        },
        {
          name: "Self-hosted",
          icon: "api",
          desc: "Any base URL, your header, your model name.",
          note: "any base URL",
          supported: true,
        },
      ],
    },
    {
      name: "Payments",
      span: "narrow",
      items: [
        {
          name: "Stripe",
          icon: "stripe",
          desc: "Payments, plus webhooks re-signed for each device.",
          note: "API and webhooks",
        },
        {
          name: "Razorpay",
          icon: "razorpay",
          desc: "Orders and payments, plus webhooks per device.",
          note: "API and webhooks",
        },
      ],
    },
    {
      name: "Cloud & email",
      span: "wide",
      items: [
        { name: "Amazon S3", icon: "aws", desc: "Uploads, downloads and presigned URLs, re-signed." },
        { name: "Amazon SES", icon: "aws", desc: "Send email with SESv2 and the real IAM key." },
        { name: "SMTP", icon: "mail", desc: "nodemailer to Resend, SES or any relay.", note: "Resend, SES, any relay" },
        {
          name: "Cloudflare R2",
          icon: "letter:R2",
          desc: "S3-compatible storage. Not yet run on a real account.",
          beta: true,
        },
        {
          name: "Amazon SQS",
          icon: "aws",
          desc: "Queues through the AWS SDK. Not yet run on a real account.",
          beta: true,
        },
      ],
    },
    {
      name: "Sign-in & push",
      span: "wide",
      items: [
        {
          name: "Google sign-in",
          icon: "google",
          desc: "Auth.js and passport. The client secret is added by cb at sign-in.",
        },
        { name: "GitHub sign-in", icon: "github", desc: "Same for GitHub OAuth apps." },
        { name: "Firebase / FCM", icon: "firebase", desc: "firebase-admin with a placeholder key file." },
        {
          name: "Apple Push",
          icon: "apple",
          desc: "APNs tokens re-signed with the real key. Not yet run for real.",
          beta: true,
        },
      ],
    },
    {
      name: "Any other API",
      span: "narrow",
      items: [
        {
          name: "Header, Bearer or Basic",
          icon: "api",
          desc: "Clerk, Resend and any API that takes a key in a header.",
          note: "Clerk, Resend and the rest",
        },
      ],
    },
  ] satisfies ServiceGroup[],
};

export const admin = {
  title: "Access you can take back in seconds",
  intro:
    "Admins add each key once, then decide who can use it, in which environment and until when. Every call goes through cb, so removing access takes effect right away: open connections close.",
  controls: [
    {
      name: "Access rules",
      text: "Give access per person, environment and service, with an optional end date for interns and contractors.",
    },
    {
      name: "Kill switches",
      text: "Cut off a whole organization, an environment, a service, one person or one device. A reason is required.",
    },
    {
      name: "Audit",
      text: "A record of every connection and request: who made it, from which device, and what happened.",
    },
    {
      name: "Write-only secrets",
      text: "Real keys go in and never come back out. A new key is tested before it replaces the old one.",
    },
  ],
  demo: {
    label: "Live on macbook-maya",
    action: { who: "Admin", what: "Turn off access for macbook-maya", reason: "Reason: offboarding", done: "Done" },
    caption: "What each client sees. In cb, open connections close within 5 seconds of the admin’s click.",
    banner: 'cb: access revoked by admin (reason: "offboarding"). Your app was not given any real credentials.',
    rows: [
      { service: "postgres", detail: "main-db", error: "FATAL  cb: access revoked by admin" },
      { service: "stripe", detail: "api.stripe.com", error: '403  {"error":"cb_access_revoked"}' },
      { service: "openai", detail: "127.0.0.1:7404", error: '403  {"error":"cb_access_revoked"}' },
    ],
  },
};

export const facts = {
  title: "Measured, not promised",
  items: [
    {
      value: "0",
      unit: "leaks",
      text: "25 real secrets, searched in 161 encodings across app memory, the agent, every cb file, CLI output, dashboard responses and logs.",
    },
    {
      value: "5",
      unit: "seconds",
      text: "The longest a revoked tunnel stays open, from the admin’s click to closed connections.",
    },
    {
      value: "0.07",
      unit: "ms",
      text: "Median latency added to a Postgres, Redis or MongoDB query through the tunnel, gateway on localhost (up to 0.11 ms).",
    },
    { value: "8", unit: "ms", text: "The most the preload adds to your app’s start, measured between 6.7 and 8.2 ms." },
  ],
};

export const extras = {
  title: "Also in the box",
  items: [
    {
      name: "Webhooks reach the right device",
      text: "Stripe and Razorpay events go to the device that caused them, signed so that device’s placeholder secret verifies them. Your verify code doesn’t change.",
    },
    {
      name: "Rotation without restarts",
      text: "Rotate a real key in the dashboard and running apps keep working. Variable changes restart the app for you.",
    },
    {
      name: "Typed, server-only API",
      text: 'Optional import { env } from "@cb/env" with generated types. Importing it in browser code fails the build.',
    },
    {
      name: "Errors that say what to do",
      text: "cb doctor checks Node, the agent, ports and stray secrets in your .env files, then tells you the fix.",
    },
  ],
};

export const start = {
  title: "Three minutes from install to npm run dev",
  steps: [
    { cmd: "npm i -D @cb/env", text: "Add the package to the project." },
    { cmd: "npx cb login", text: "Approve the device code in the dashboard." },
    { cmd: "npx cb init", text: "Pick the project. Your scripts get a cb run -- prefix." },
    { cmd: "npm run dev", text: "Same command as yesterday." },
  ],
  platforms: "Node.js 22.14+ and 24 · Next.js 15 and 16 · Express, NestJS · macOS, Linux, Windows",
};

export const footer = {
  title: ["Keep the real keys.", "Ship placeholders."],
  primary: { label: "Get started", href: SIGNUP_PATH },
  secondary: { label: "Sign in", href: LOGIN_PATH },
  oss: "Open source under Apache-2.0",
  links: [
    { label: "Docs", href: DOCS_PATH },
    { label: "Blog", href: BLOG_PATH },
    { label: "cb-env on GitHub", href: GITHUB_URLS.env },
    { label: "cb-backend on GitHub", href: GITHUB_URLS.backend },
    { label: "cb-dashboard on GitHub", href: GITHUB_URLS.dashboard },
  ],
  colophon: "Set in Archivo and Fragment Mono. No real secret was printed on this page.",
};
