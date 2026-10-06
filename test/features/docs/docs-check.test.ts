// @vitest-environment node
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { betaMismatches, brokenLinks, forbidden, imageProblems, listPages } from "../../../scripts/docs-check.mjs";

function fixture(files: Record<string, string>) {
  const root = mkdtempSync(path.join(tmpdir(), "docs-"));
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), body);
  }
  return root;
}
const page = (fm: string, body = "") => `---\n${fm}\n---\n${body}\n`;

describe("FR-DOC-007 docs checker", () => {
  it("finds a link to a page that does not exist", () => {
    const root = fixture({
      "content/docs/a.mdx": page("title: A\ndescription: a", "[x](/docs/missing)"),
      "content/docs/b.mdx": page("title: B\ndescription: b", "[ok](/docs/a)"),
    });
    expect(brokenLinks(listPages(path.join(root, "content/docs")))).toEqual(["a.mdx → /docs/missing"]);
  });

  it("finds missing and unreferenced images", () => {
    const root = fixture({
      "content/docs/a.mdx": page("title: A\ndescription: a", '<Frame src="/docs/images/x.png" alt="x" />'),
      "public/docs/images/y.png": "",
    });
    const pages = listPages(path.join(root, "content/docs"));
    expect(imageProblems(pages, path.join(root, "public")).sort()).toEqual([
      "a.mdx → missing /docs/images/x.png",
      "unreferenced /docs/images/y.png",
    ]);
  });

  it("flags real-looking secrets and attribution but allows cb stand-ins", () => {
    const root = fixture({
      "content/docs/a.mdx": page(
        "title: A\ndescription: a",
        "sk_test_cbAAAAAAAAAAAAAAAAAAAA ok\nsk_live_51Habcdefghijklmnopqrstuv bad\nGenerated with Claude bad\nsk-cb-abc ok",
      ),
    });
    const out = forbidden(listPages(path.join(root, "content/docs")));
    // sk_live_…, "claude", "generated with" → 3; the cb stand-ins pass.
    expect(out).toHaveLength(3);
    expect(out.join("\n")).not.toMatch(/sk_test_cb|sk-cb/);
  });

  it("allows a PEM header in prose but not a pasted key", () => {
    const body = `paste from \`-----BEGIN PRIVATE KEY-----\` to the END line\n-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7\n`;
    const root = fixture({ "content/docs/a.mdx": page("title: A\ndescription: a", body) });
    expect(forbidden(listPages(path.join(root, "content/docs")))).toHaveLength(1);
  });

  it("requires title and description, and matches status: beta to the catalog", () => {
    const root = fixture({
      "content/docs/connectors/databases/postgres.mdx": page("title: PostgreSQL\ndescription: d"),
      "content/docs/connectors/databases/mongodb.mdx": page("title: MongoDB\ndescription: d\nstatus: beta"),
      "content/docs/x.mdx": page("title: X"),
    });
    const pages = listPages(path.join(root, "content/docs"));
    const catalog = [
      { slug: "postgres", group: "databases", beta: true },
      { slug: "mongodb", group: "databases", beta: false },
    ];
    expect(betaMismatches(pages, catalog).sort()).toEqual([
      "connectors/databases/mongodb.mdx has status: beta but the catalog says not beta",
      "connectors/databases/postgres.mdx should have status: beta",
    ]);
    expect(forbidden(pages)).toEqual(["x.mdx needs title and description"]);
  });
});
