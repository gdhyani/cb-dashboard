import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** NFR accessibility (PRD §14, WCAG AA): every text token is readable (≥ 4.5:1) on every surface it sits on. */
const css = fs.readFileSync(path.resolve(__dirname, "../../src/styles/base.css"), "utf8"); // the brand tokens (shared by app.css and globals.css)
// Dark values come first (@theme); the light ones live in the `:root[data-theme="light"]…` block (PRD v1.73).
const lightCss = css.slice(css.indexOf(':root[data-theme="light"]:not(:has([data-studio]))'));
const token = (name: string, from = css) => {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(from);
  if (!m?.[1]) throw new Error(`token --color-${name} not found`);
  return m[1];
};
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
};

describe("NFR-A11Y colour contrast of text tokens", () => {
  const surfaces = ["background", "card", "popover", "muted", "secondary", "accent"];
  for (const [theme, from] of [
    ["dark", css],
    ["light", lightCss],
  ] as const)
    for (const text of ["foreground", "muted-foreground", "subtle", "placeholder", "hot"])
      for (const surface of surfaces)
        it(`NFR-A11Y ${theme}: ${text} on ${surface} is at least 4.5:1`, () => {
          expect(contrast(token(text, from), token(surface, from))).toBeGreaterThanOrEqual(4.5);
        });
});
