import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlatformCards } from "@/features/docs/components/platform-cards";
import { CONNECTORS } from "@/features/docs/lib/connectors";
import { PLATFORMS } from "@/features/docs/lib/platforms";

// Verified against real providers on 2026-10-07 (PRD v1.48 §17.4): mysql, openai, gemini, groq, firebase, api-key.
const BETA = ["anthropic", "mistral", "custom-ai", "smtp", "google", "github", "oauth", "apns"];

describe("FR-DOC-006 connector catalog", () => {
  it("slugs are unique", () => {
    expect(new Set(CONNECTORS.map((c) => c.slug)).size).toBe(CONNECTORS.length);
  });
  it("Beta set matches the verification table (PRD §17.4)", () => {
    expect(
      CONNECTORS.filter((c) => c.beta)
        .map((c) => c.slug)
        .sort(),
    ).toEqual([...BETA].sort());
  });
});

describe("FR-DOC-009 platform catalog", () => {
  it("tiers follow the evidence: e2e-proven = supported; Python, Bun, Deno, Docker = coming soon", () => {
    const by = (s: string) =>
      PLATFORMS.filter((p) => p.status === s)
        .map((p) => p.slug)
        .sort();
    expect(by("supported")).toEqual(["nestjs", "nextjs", "node-express"]);
    expect(by("coming-soon")).toEqual(["bun", "deno", "docker", "python"]);
    expect(new Set(PLATFORMS.map((p) => p.slug)).size).toBe(PLATFORMS.length);
  });
  it("the matrix shows every platform as one grid of blocks with its badge", () => {
    render(<PlatformCards />);
    expect(screen.getByRole("link", { name: /Python.*Coming soon/ })).toHaveAttribute("href", "/docs/platforms/python");
    expect(screen.getByRole("link", { name: /Next\.js.*Supported/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Vite\s*Beta$/ })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
