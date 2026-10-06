import type { TypeId } from "./catalog";

export interface DotenvEntry {
  key: string;
  value: string;
}

/** OQ10: KEY=VALUE lines from a pasted .env (export prefix, quotes, comments); keys normalised like the Key field. */
export function parseDotenv(raw: string): { entries: DotenvEntry[]; skipped: { line: number; text: string }[] } {
  const entries: DotenvEntry[] = [];
  const skipped: { line: number; text: string }[] = [];
  raw.split(/\r?\n/).forEach((original, i) => {
    const line = original.trim();
    if (!line || line.startsWith("#")) return;
    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*(.*)$/.exec(line);
    if (!m?.[1]) {
      skipped.push({ line: i + 1, text: line.slice(0, 80) });
      return;
    }
    let value = m[2] ?? "";
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.lastIndexOf(quote) > 0)
      value = value.slice(1, value.lastIndexOf(quote));
    else value = value.replace(/\s+#.*$/, "").trim();
    entries.push({ key: m[1].toUpperCase().replace(/[^A-Z0-9_]/g, "_"), value });
  });
  return { entries, skipped };
}

/** Names of secrets an app invents for itself: each developer can get their own (Random secret, D3). */
const INVENTED = /^(AUTH|NEXTAUTH|SESSION|JWT|COOKIE|APP|ENCRYPTION|CSRF)_SECRET$|^SECRET_KEY_BASE$/;

/** Key names that announce a secret, and values that look like one (long, random, no spaces, not a URL). */
const SECRET_NAME = /(SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|CREDENTIAL|API_?KEY|_KEY$)/;
const looksRandom = (v: string) =>
  v.length >= 16 && !/\s/.test(v) && !/^https?:\/\//.test(v) && /[A-Za-z]/.test(v) && /\d/.test(v);

/**
 * A first guess at "What is this?" for one pasted line; the admin confirms or changes it. Something that looks secret
 * but has no known shape gets no guess ("unsure"): Plain would hand the real value to every developer.
 */
export function guessType(key: string, value: string): { type: TypeId | "unsure"; provider?: string } {
  if (/^mongodb(\+srv)?:\/\//.test(value)) return { type: "mongodb" };
  if (/^postgres(ql)?:\/\//.test(value)) return { type: "postgres" };
  if (/^mysql:\/\//.test(value)) return { type: "mysql" };
  if (/^rediss?:\/\//.test(value)) return { type: "redis" };
  if (/^(NEXT_PUBLIC_|PUBLIC_|VITE_|EXPO_PUBLIC_)/.test(key)) return { type: "plain" };
  if (/^(sk|rk)_(test|live)_/.test(value)) return { type: "stripe" };
  if (value.startsWith("sk-ant-")) return { type: "ai", provider: "anthropic" };
  if (value.startsWith("sk-")) return { type: "ai", provider: "openai" };
  if (value.startsWith("gsk_")) return { type: "ai", provider: "groq" };
  if (value.startsWith("AIza")) return { type: "ai", provider: "gemini" };
  if (INVENTED.test(key)) return { type: "gen" };
  if (SECRET_NAME.test(key) || looksRandom(value)) return { type: "unsure" };
  return { type: "plain" };
}

/** Types a pasted value is enough for (no extra fields to ask). */
export const IMPORTABLE: { type: TypeId; provider?: string; label: string }[] = [
  { type: "plain", label: "Plain value" },
  { type: "gen", label: "Random secret (each developer)" },
  { type: "visible", label: "Secret shown as-is (developers see it)" },
  { type: "mongodb", label: "MongoDB" },
  { type: "postgres", label: "Postgres" },
  { type: "mysql", label: "MySQL" },
  { type: "redis", label: "Redis" },
  { type: "stripe", label: "Stripe" },
  { type: "ai", provider: "openai", label: "AI · OpenAI" },
  { type: "ai", provider: "anthropic", label: "AI · Anthropic" },
  { type: "ai", provider: "gemini", label: "AI · Gemini" },
  { type: "ai", provider: "groq", label: "AI · Groq" },
];
