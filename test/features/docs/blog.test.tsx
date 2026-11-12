import path from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CoverageChart } from "@/features/docs/components/blog/coverage-chart";
import { LeakMapDiagram } from "@/features/docs/components/blog/leak-map-diagram";
import { SecurePassageDiagram } from "@/features/docs/components/blog/secure-passage-diagram";
import { StandInDiagram } from "@/features/docs/components/blog/stand-in-diagram";
import { ValueTypesMatrix } from "@/features/docs/components/blog/value-types-matrix";
import { formatPostDate, readingMinutes, sortPosts } from "@/features/docs/lib/blog";
import { CONNECTORS } from "@/features/docs/lib/connectors";
import { COVERAGE, coverageTotals } from "@/features/docs/lib/coverage";
import { getMDXComponents } from "@/features/docs/mdx-components";
import { brokenLinks, forbidden, imageProblems, listPages } from "../../../scripts/docs-check.mjs";

const blogRoot = path.resolve(import.meta.dirname, "../../../content/blog");
const docsRoot = path.resolve(import.meta.dirname, "../../../content/docs");
const pub = path.resolve(import.meta.dirname, "../../../public");
const posts = listPages(blogRoot);

describe("FR-DOC-010 blog content", () => {
  it("has at least three posts, each with title, description, ISO date and author", () => {
    expect(posts.length).toBeGreaterThanOrEqual(3);
    const bad = posts.filter(
      (p) =>
        !p.frontmatter.title ||
        !p.frontmatter.description ||
        !/^\d{4}-\d{2}-\d{2}$/.test(p.frontmatter.date ?? "") ||
        !p.frontmatter.author,
    );
    expect(bad.map((p) => p.rel)).toEqual([]);
  });

  it("has no secrets, identity or attribution", () => expect(forbidden(posts)).toEqual([]));

  it("links only to docs pages that exist, and its images exist", () => {
    const docs = listPages(docsRoot);
    const linkProblems = brokenLinks([...docs, ...posts]).filter((l) => !docs.some((d) => l.startsWith(`${d.rel} `)));
    expect(linkProblems).toEqual([]);
    expect(imageProblems([...docs, ...posts], pub)).toEqual([]);
  });
});

describe("FR-DOC-010 blog helpers", () => {
  it("sorts posts newest first, then by title", () => {
    const sorted = sortPosts([
      { title: "B", date: "2026-11-10" },
      { title: "A", date: "2026-11-13" },
      { title: "C", date: "2026-11-10" },
    ]);
    expect(sorted.map((p) => p.title)).toEqual(["A", "B", "C"]);
  });

  it("estimates reading time at 220 words a minute, at least one minute", () => {
    expect(readingMinutes("word ".repeat(10))).toBe(1);
    expect(readingMinutes("word ".repeat(1100))).toBe(5);
  });

  it("formats dates in UTC without shifting the day", () => {
    expect(formatPostDate("2026-11-13")).toBe("13 November 2026");
  });
});

describe("FR-DOC-010 coverage data", () => {
  it("counts every connector the docs mark Beta as Beta", () => {
    const betaNames = COVERAGE.flatMap((g) => g.beta);
    for (const c of CONNECTORS.filter((c) => c.beta)) {
      expect(betaNames.join(" ")).toContain(c.name.replace(/ \(.*\)$/, ""));
    }
  });

  it("totals verified and beta providers", () => {
    const t = coverageTotals();
    expect(t.verified).toBe(COVERAGE.reduce((n, g) => n + g.verified.length, 0));
    expect(t.beta).toBe(COVERAGE.reduce((n, g) => n + g.beta.length, 0));
  });
});

describe("FR-DOC-010 blog diagrams", () => {
  it("secure passage: the real key appears only on the gateway → service hop", () => {
    render(<SecurePassageDiagram />);
    const fig = screen.getByRole("img", { name: /stand-in.*real key/i });
    expect(within(fig).getAllByText(/real key/i)).toHaveLength(1);
    expect(within(fig).getByText(/your laptop/i)).toBeInTheDocument();
    expect(within(fig).getByText(/cb server/i)).toBeInTheDocument();
  });

  it("stand-in: two devices get different stand-ins and a copied one is refused", () => {
    render(<StandInDiagram />);
    const fig = screen.getByRole("img", { name: /device/i });
    const ins = within(fig).getAllByText(/^sk_test_cb_/);
    expect(new Set(ins.map((e) => e.textContent)).size).toBe(2);
    expect(within(fig).getByText(/refused/i)).toBeInTheDocument();
  });

  it("leak map: shows six places a .env value leaks to", () => {
    render(<LeakMapDiagram />);
    expect(screen.getByRole("img", { name: /\.env/ })).toBeInTheDocument();
    expect(screen.getAllByTestId("leak-destination")).toHaveLength(6);
  });

  it("value types: one row per type with what the laptop holds", () => {
    render(<ValueTypesMatrix />);
    const table = screen.getByRole("table", { name: /env value types/i });
    for (const t of ["Plain", "Random secret", "Shown as-is", "Protected"]) {
      expect(within(table).getByRole("rowheader", { name: t })).toBeInTheDocument();
    }
  });

  it("coverage chart: a bar per group, a legend and a table view with the totals", () => {
    render(<CoverageChart />);
    expect(screen.getAllByTestId("coverage-bar")).toHaveLength(COVERAGE.length);
    expect(screen.getByText("Verified with a real account")).toBeInTheDocument();
    const table = screen.getByRole("table", { name: /coverage/i });
    const t = coverageTotals();
    const total = within(table).getByRole("row", { name: /total/i });
    expect(within(total).getByText(String(t.verified))).toBeInTheDocument();
    expect(within(total).getByText(String(t.beta))).toBeInTheDocument();
  });

  it("every blog diagram is available to MDX", () => {
    const c = getMDXComponents();
    for (const k of ["CoverageChart", "LeakMapDiagram", "SecurePassageDiagram", "StandInDiagram", "ValueTypesMatrix"]) {
      expect(c[k]).toBeDefined();
    }
  });
});
