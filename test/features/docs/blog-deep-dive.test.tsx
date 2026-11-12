import { existsSync } from "node:fs";
import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlogBento } from "@/features/docs/components/blog/blog-bento";
import { EnvCompositionChart } from "@/features/docs/components/blog/env-composition-chart";
import { EnvPrecedenceDiagram } from "@/features/docs/components/blog/env-precedence-diagram";
import { EnvVisibilityDiagram } from "@/features/docs/components/blog/env-visibility-diagram";
import { HttpsPathSequence, PostgresLoginSequence } from "@/features/docs/components/blog/gateway-sequences";
import { LeakScanChart } from "@/features/docs/components/blog/leak-scan-chart";
import { ENV_COMPOSITION, LEAK_SCANS } from "@/features/docs/lib/blog-data";
import type { BlogPostSummary } from "@/features/docs/lib/blog-source";
import { getMDXComponents } from "@/features/docs/mdx-components";
import { listPages } from "../../../scripts/docs-check.mjs";

vi.mock("next/image", () => ({
  // biome-ignore lint/performance/noImgElement: test double for next/image
  default: ({ alt, ...props }: { src: string; alt: string }) => <img alt={alt} {...props} />,
}));

const posts = listPages(path.resolve(import.meta.dirname, "../../../content/blog"));
const pub = path.resolve(import.meta.dirname, "../../../public");

const post = (n: number): BlogPostSummary => ({
  slug: `post-${n}`,
  url: `/blog/post-${n}`,
  title: `Post ${n}`,
  description: `About ${n}`,
  date: `2026-11-${String(10 + n).padStart(2, "0")}`,
  author: "The cb team",
  minutes: n,
  image: `/blog/covers/post-${n}.svg`,
  imageAlt: `Cover ${n}`,
});

describe("FR-DOC-010 blog covers", () => {
  it("every post names a cover image that exists, with alt text", () => {
    const bad = posts.filter(
      (p) => !p.frontmatter.image || !p.frontmatter.imageAlt || !existsSync(path.join(pub, p.frontmatter.image)),
    );
    expect(bad.map((p) => p.rel)).toEqual([]);
  });

  it("has the two deep-dive posts", () => {
    const names = posts.map((p) => p.rel);
    expect(names).toContain("how-environment-variables-work.mdx");
    expect(names).toContain("inside-cb.mdx");
  });
});

describe("FR-DOC-010 blog index", () => {
  it("shows the latest four in the bento grid with images, the rest in a list below", () => {
    render(<BlogBento posts={[1, 2, 3, 4, 5, 6].map(post)} />);
    const grid = screen.getByRole("list", { name: "Latest posts" });
    expect(within(grid).getAllByRole("listitem")).toHaveLength(4);
    expect(within(grid).getAllByRole("img")).toHaveLength(4);
    expect(within(grid).getByAltText("Cover 1")).toBeInTheDocument();
    const rest = screen.getByRole("list", { name: "More posts" });
    expect(
      within(rest)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual([expect.stringContaining("Post 5"), expect.stringContaining("Post 6")]);
  });

  it("leaves out the list when there are four posts or fewer", () => {
    render(<BlogBento posts={[1, 2, 3].map(post)} />);
    expect(screen.queryByRole("list", { name: "More posts" })).toBeNull();
  });
});

describe("FR-DOC-010 deep-dive charts use real data and keep a table view", () => {
  it("env composition: a bar per kind; the counts add up to the total", () => {
    render(<EnvCompositionChart />);
    expect(screen.getAllByTestId("hbar")).toHaveLength(ENV_COMPOSITION.length);
    const table = screen.getByRole("table", { name: /env values by kind/i });
    const total = ENV_COMPOSITION.reduce((n, r) => n + r.value, 0);
    expect(within(within(table).getByRole("row", { name: /total/i })).getByText(String(total))).toBeInTheDocument();
  });

  it("leak scans: every run found zero real secrets", () => {
    render(<LeakScanChart />);
    expect(screen.getAllByTestId("hbar")).toHaveLength(LEAK_SCANS.length);
    expect(LEAK_SCANS.every((s) => s.leaks === 0)).toBe(true);
    expect(screen.getByRole("table", { name: /leak scans/i })).toBeInTheDocument();
  });
});

describe("FR-DOC-010 deep-dive diagrams", () => {
  it("precedence: Next.js load order, process environment first, .env last", () => {
    render(<EnvPrecedenceDiagram />);
    const fig = screen.getByRole("img", { name: /order/i });
    const steps = within(fig)
      .getAllByTestId("precedence-step")
      .map((s) => s.textContent);
    expect(steps[0]).toMatch(/process environment/i);
    expect(steps.at(-1)).toMatch(/^\.env[^.]/);
  });

  it("visibility: names who can read a running process's environment", () => {
    render(<EnvVisibilityDiagram />);
    expect(screen.getAllByTestId("env-reader").length).toBeGreaterThanOrEqual(5);
  });

  it("HTTPS sequence: the real key appears only after the gateway", () => {
    render(<HttpsPathSequence />);
    const steps = screen.getAllByTestId("sequence-step").map((s) => s.textContent ?? "");
    const firstReal = steps.findIndex((t) => /real key/i.test(t));
    expect(firstReal).toBeGreaterThan(0);
    expect(steps.slice(0, firstReal).some((t) => /stand-in/i.test(t))).toBe(true);
  });

  it("Postgres sequence: the client sends the stand-in, upstream login uses SCRAM", () => {
    render(<PostgresLoginSequence />);
    const text = screen
      .getAllByTestId("sequence-step")
      .map((s) => s.textContent ?? "")
      .join(" | ");
    expect(text).toMatch(/stand-in/i);
    expect(text).toMatch(/SCRAM-SHA-256/);
  });

  it("all new diagrams are available to MDX", () => {
    const c = getMDXComponents();
    for (const k of [
      "EnvCompositionChart",
      "EnvPrecedenceDiagram",
      "EnvVisibilityDiagram",
      "HttpsPathSequence",
      "LeakScanChart",
      "PostgresLoginSequence",
    ]) {
      expect(c[k]).toBeDefined();
    }
  });
});
