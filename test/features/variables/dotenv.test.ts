import { describe, expect, it } from "vitest";
import { guessType, parseDotenv } from "@/features/variables/lib/dotenv";

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
