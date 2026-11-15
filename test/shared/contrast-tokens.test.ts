import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** NFR accessibility (PRD §14, WCAG AA): every text token is readable (≥ 4.5:1) on every surface it sits on. */
const css = fs.readFileSync(path.resolve(__dirname, "../../src/styles/globals.css"), "utf8");
const token = (name: string) => {
  const m = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css);
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
  for (const text of ["foreground", "muted-foreground", "subtle"])
    for (const surface of surfaces)
      it(`NFR-A11Y ${text} on ${surface} is at least 4.5:1`, () => {
        expect(contrast(token(text), token(surface))).toBeGreaterThanOrEqual(4.5);
      });
});
