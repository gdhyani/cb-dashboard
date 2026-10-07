import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusDot } from "@/shared/components/status-dot";

const dot = (tone: "ok" | "rejected" | "unknown") => {
  render(<StatusDot tone={tone} label={tone} />);
  return screen.getByRole("img", { name: tone });
};

describe("StatusDot", () => {
  it("M10 the 'Not checked yet' dot follows the text colour (visible on light and dark themes), not a translucent white", () => {
    const el = dot("unknown");
    // A fixed white/alpha fill disappears on a light background; currentColor always contrasts like the key name beside it.
    expect(el.className).not.toMatch(/white/);
    expect(el.className).toMatch(/\bborder-current\b/);
    expect(el.className).not.toMatch(/\bbg-(?!transparent)/);
  });

  it("M10 checked dots stay filled so 'not checked' is told apart by shape as well as colour", () => {
    expect(dot("ok").className).toMatch(/\bbg-emerald-400\b/);
    expect(dot("rejected").className).toMatch(/\bbg-destructive\b/);
  });
});
