import { describe, expect, it } from "vitest";
import { guessType, IMPORTABLE, parseDotenv } from "@/features/variables/lib/dotenv";

describe("OQ10 pasting a .env file", () => {
  it("parses KEY=VALUE lines: export, quotes, comments, blanks, = inside values, and reports bad lines", () => {
    const parsed = parseDotenv(
      [
        "# comment",
        "",
        "export PORT=3000",
        'DATABASE_URL="postgres://u:p@db:5432/app?sslmode=require"',
        "STRIPE_SECRET_KEY='sk_test_abc'",
        "JWT_SECRET=abc=def # trailing comment",
        "not a line",
        "lower_case=1",
      ].join("\n"),
    );
    expect(parsed.entries).toEqual([
      { key: "PORT", value: "3000" },
      { key: "DATABASE_URL", value: "postgres://u:p@db:5432/app?sslmode=require" },
      { key: "STRIPE_SECRET_KEY", value: "sk_test_abc" },
      { key: "JWT_SECRET", value: "abc=def" },
      { key: "LOWER_CASE", value: "1" },
    ]);
    expect(parsed.skipped).toEqual([{ line: 7, text: "not a line" }]);
  });

  it("guesses the type from the value's shape and the key name (the admin can change each)", () => {
    expect(guessType("MONGODB_URI", "mongodb+srv://u:p@c.example.net/x")).toEqual({ type: "mongodb" });
    expect(guessType("DATABASE_URL", "postgresql://u:p@h/db")).toEqual({ type: "postgres" });
    expect(guessType("MYSQL_URL", "mysql://u:p@h/db")).toEqual({ type: "mysql" });
    expect(guessType("REDIS_URL", "rediss://:p@h:6380")).toEqual({ type: "redis" });
    expect(guessType("STRIPE_SECRET_KEY", "sk_test_123")).toEqual({ type: "stripe" });
    expect(guessType("ANTHROPIC_API_KEY", "sk-ant-api03-x")).toEqual({ type: "ai", provider: "anthropic" });
    expect(guessType("OPENAI_API_KEY", "sk-proj-x")).toEqual({ type: "ai", provider: "openai" });
    expect(guessType("GROQ_API_KEY", "gsk_x")).toEqual({ type: "ai", provider: "groq" });
    expect(guessType("GEMINI_API_KEY", "AIzaSyX")).toEqual({ type: "ai", provider: "gemini" });
    expect(guessType("AUTH_SECRET", "anything")).toEqual({ type: "gen" });
    expect(guessType("PORT", "3000")).toEqual({ type: "plain" });
    expect(guessType("NEXT_PUBLIC_STRIPE_KEY", "pk_test_1")).toEqual({ type: "plain" });
  });
});

describe("Import .env never defaults a secret to Plain (security run 2026-10-07)", () => {
  it("a random-looking value with no known shape gets no default: the admin must choose", () => {
    expect(guessType("CB_TOKEN", "CANARY_8b584afc52a0cfdb33633e4d64901bef")).toEqual({ type: "unsure" });
    expect(guessType("RESEND_API_KEY", "re_AbCdEf123456789xyz")).toEqual({ type: "unsure" });
    expect(guessType("CLERK_SECRET_KEY", "sk_test_aGVsbG8gd29ybGQ")).toMatchObject({ type: "stripe" }); // Stripe-shaped: still a guess
  });

  it("key names that say secret / token / password / private / key are never guessed Plain", () => {
    for (const k of ["MY_SECRET", "GITHUB_TOKEN", "DB_PASSWORD", "PRIVATE_KEY", "SENDGRID_API_KEY"])
      expect(guessType(k, "short")).toEqual({ type: "unsure" });
  });

  it("ordinary public values stay Plain", () => {
    expect(guessType("PORT", "3000")).toEqual({ type: "plain" });
    expect(guessType("NEXT_PUBLIC_SITE_URL", "https://example.com")).toEqual({ type: "plain" });
    expect(guessType("APP_NAME", "storefront")).toEqual({ type: "plain" });
    expect(guessType("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_123")).toEqual({ type: "plain" }); // public prefix: browser anyway
  });

  it("a browser prefix never makes a real secret Plain (NEXT_PUBLIC_/VITE_/PUBLIC_/EXPO_PUBLIC_)", () => {
    expect(guessType("NEXT_PUBLIC_STRIPE_SECRET_KEY", "sk_live_aGVsbG8gd29ybGQ1234")).toEqual({ type: "unsure" });
    expect(guessType("VITE_SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZSJ9.x1")).toEqual({
      type: "unsure",
    });
    expect(guessType("PUBLIC_OPENAI_KEY", "sk-proj-abc")).toEqual({ type: "unsure" });
    expect(guessType("EXPO_PUBLIC_API_TOKEN", "short")).toEqual({ type: "unsure" });
    expect(guessType("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_live_51AbCdEf0123456789xyz")).toEqual({ type: "plain" });
    expect(guessType("NEXT_PUBLIC_API_URL", "https://api.example.com/v1")).toEqual({ type: "plain" });
  });

  it("password, auth, signing, salt, HMAC, DSN and webhook names are never guessed Plain", () => {
    for (const k of ["SMTP_PASS", "DB_PWD", "SENTRY_AUTH", "WEBHOOK_SIGNING", "COOKIE_SALT", "HMAC_KEY", "SENTRY_DSN"])
      expect(guessType(k, "hunter2hunter"), k).toEqual({ type: "unsure" });
    expect(guessType("NEXTAUTH_URL", "http://localhost:3000")).toEqual({ type: "plain" });
  });

  it("URLs with a password or a long token in them are never guessed Plain", () => {
    expect(guessType("SLACK_HOOK", "https://hooks.slack.com/services/T0001/B0001/XXXXXXXXXXXXXXXXXXXX1234")).toEqual({
      type: "unsure",
    });
    expect(guessType("UPSTREAM", "https://admin:hunter2@api.example.com")).toEqual({ type: "unsure" });
    expect(guessType("SITE_URL", "https://example.com/blog/hello-world")).toEqual({ type: "plain" });
  });

  it("'Secret shown as-is' can be chosen when importing", () => {
    expect(IMPORTABLE.some((o) => o.type === "visible")).toBe(true);
  });
});
