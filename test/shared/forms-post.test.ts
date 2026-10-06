import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** Every <form …> opening tag in src, with the file it is in. */
function forms(): { file: string; tag: string }[] {
  const out: { file: string; tag: string }[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (p.endsWith(".tsx"))
        for (const m of fs.readFileSync(p, "utf8").matchAll(/<form\b[^>]*>/g))
          out.push({ file: path.relative("src", p), tag: m[0] });
    }
  };
  walk("src");
  return out;
}

describe("D5 a form can never put a password or key in the URL", () => {
  it("every form posts: a submit before the page has hydrated sends a body, never a ?password= query", () => {
    const all = forms();
    expect(all.length).toBeGreaterThan(5);
    expect(all.filter((f) => !/method="post"/.test(f.tag)).map((f) => f.file)).toEqual([]);
  });
});
