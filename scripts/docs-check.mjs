// Checks for the documentation content (FR-DOC-006, FR-DOC-007, FR-DOC-009), run by test/features/docs/*.test.ts.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

function parseFrontmatter(src) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  if (!m) return { fm: {}, body: src };
  const fm = Object.fromEntries(
    m[1]
      .split("\n")
      .filter((l) => l.includes(":"))
      .map((l) => [l.slice(0, l.indexOf(":")).trim(), l.slice(l.indexOf(":") + 1).trim()]),
  );
  return { fm, body: src.slice(m[0].length) };
}

/** Every .mdx page under `root` with its path relative to `root`, frontmatter and body. */
export function listPages(root) {
  return walk(root)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const { fm, body } = parseFrontmatter(readFileSync(file, "utf8"));
      return { file, rel: path.relative(root, file).split(path.sep).join("/"), frontmatter: fm, body };
    });
}

const routeOf = (rel) => `/docs/${rel.replace(/\.mdx$/, "").replace(/(^|\/)index$/, "")}`.replace(/\/$/, "");

/** Links to /docs/... that do not match a page. */
export function brokenLinks(pages) {
  const routes = new Set(pages.map((p) => routeOf(p.rel)));
  const out = [];
  for (const p of pages) {
    for (const [, href] of p.body.matchAll(/(?:\]\(|href=["'])(\/docs[^)#"'\s]*)/g)) {
      if (href.startsWith("/docs/images/")) continue;
      if (!routes.has(href.replace(/\/$/, ""))) out.push(`${p.rel} → ${href}`);
    }
  }
  return out;
}

/** Images referenced but missing, and images in public/docs/images that no page uses. */
export function imageProblems(pages, publicDir) {
  const out = [];
  const used = new Set();
  for (const p of pages) {
    for (const [, src] of p.body.matchAll(/src="(\/docs\/images\/[^"]+)"/g)) {
      used.add(src);
      if (!existsSync(path.join(publicDir, src))) out.push(`${p.rel} → missing ${src}`);
    }
  }
  const imgRoot = path.join(publicDir, "docs/images");
  if (existsSync(imgRoot)) {
    for (const f of walk(imgRoot).filter((f) => f.endsWith(".png"))) {
      const rel = `/${path.relative(publicDir, f).split(path.sep).join("/")}`;
      if (!used.has(rel)) out.push(`unreferenced ${rel}`);
    }
  }
  return out;
}

// Real-looking credentials (cb stand-ins carry a "cb" marker, PRD §12.5) and identity/attribution strings.
const FORBIDDEN = [
  /sk_(live|test)_(?!cb)[A-Za-z0-9]{16,}/,
  /\bsk-(?!cb-|ant-cb-)[A-Za-z0-9_-]{20,}/,
  /\bAKIA(?!CB)[0-9A-Z]{16}\b/,
  /whsec_(?!cb)[A-Za-z0-9]{20,}/,
  /rzp_(live|test)_(?!cb)[A-Za-z0-9]{10,}/,
  /\bghp_[A-Za-z0-9]{30,}/,
  /\bAIza[0-9A-Za-z_-]{35}\b/,
  // A PEM header is fine as text; a header followed by key material is not.
  /-----BEGIN [A-Z ]*PRIVATE KEY-----\s*(?:\\n)?[A-Za-z0-9+/]{40,}/,
  /\bclaude\b/i,
  /generated with/i,
  /co-authored-by/i,
  // Personal mail domains (written so this file never contains the literal it bans).
  new RegExp(["g", "mail\\.com"].join(""), "i"),
  /github\.com-personal/i,
  /Gaurav/i,
];

/** Secrets, identity or attribution in a page, and pages without title + description. */
export function forbidden(pages) {
  const out = [];
  for (const p of pages) {
    const text = `${JSON.stringify(p.frontmatter)}\n${p.body}`;
    for (const re of FORBIDDEN) if (re.test(text)) out.push(`${p.rel} matches ${re}`);
    if (!p.frontmatter.title || !p.frontmatter.description) out.push(`${p.rel} needs title and description`);
  }
  return out;
}

/** Connector pages whose `status: beta` disagrees with the catalog. */
export function betaMismatches(pages, catalog) {
  const out = [];
  for (const c of catalog) {
    const rel = `connectors/${c.group}/${c.slug}.mdx`;
    const p = pages.find((x) => x.rel === rel);
    if (!p) continue;
    const isBeta = p.frontmatter.status === "beta";
    if (c.beta && !isBeta) out.push(`${rel} should have status: beta`);
    if (!c.beta && isBeta) out.push(`${rel} has status: beta but the catalog says not beta`);
  }
  return out;
}
