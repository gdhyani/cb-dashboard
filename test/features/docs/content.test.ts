// @vitest-environment node
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CONNECTORS } from "@/features/docs/lib/connectors";
import { PLATFORMS } from "@/features/docs/lib/platforms";
import { betaMismatches, brokenLinks, forbidden, imageProblems, listPages } from "../../../scripts/docs-check.mjs";

const root = path.resolve(import.meta.dirname, "../../../content/docs");
const pub = path.resolve(import.meta.dirname, "../../../public");
const pages = listPages(root);

describe("FR-DOC-007 docs content", () => {
  it("has no broken internal links", () => expect(brokenLinks(pages)).toEqual([]));
  it("every image exists and every image is used", () => expect(imageProblems(pages, pub)).toEqual([]));
  it("has no secrets, identity or attribution, and every page has title + description", () =>
    expect(forbidden(pages)).toEqual([]));
});

describe("FR-DOC-006 connector pages", () => {
  it("every connector has a page", () => {
    const missing = CONNECTORS.filter((c) => !pages.some((p) => p.rel === `connectors/${c.group}/${c.slug}.mdx`));
    expect(missing.map((c) => c.slug)).toEqual([]);
  });
  it("Beta badges match the catalog", () => expect(betaMismatches(pages, CONNECTORS)).toEqual([]));
});

describe("FR-DOC-009 platform pages", () => {
  it("every platform has a page whose status matches the catalog", () => {
    const problems = PLATFORMS.flatMap((pl) => {
      const page = pages.find((p) => p.rel === `platforms/${pl.slug}.mdx`);
      if (!page) return [`missing platforms/${pl.slug}.mdx`];
      const want = pl.status === "supported" ? undefined : pl.status;
      return page.frontmatter.status === want
        ? []
        : [`platforms/${pl.slug}.mdx status ${page.frontmatter.status} ≠ ${want}`];
    });
    expect(problems).toEqual([]);
  });
  it("coming-soon pages give no setup steps", () => {
    const bad = pages.filter((p) => p.frontmatter.status === "coming-soon" && /<Steps>|cb init|cb run/.test(p.body));
    expect(bad.map((p) => p.rel)).toEqual([]);
  });
});
