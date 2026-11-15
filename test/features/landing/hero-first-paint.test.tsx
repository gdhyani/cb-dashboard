import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Hero } from "@/features/landing/components/hero";

// The scene is art with its own motion; this test is about the hero copy and buttons.
vi.mock("@/features/landing/components/hero-scene", () => ({ HeroScene: () => null }));

const css = readFileSync(join(process.cwd(), "src/features/landing/landing.css"), "utf8");

describe("FR-LP-005 hero calls to action paint without waiting for JavaScript", () => {
  it("Get started and Read the docs are never inside a JS-revealed block", () => {
    render(<Hero />);
    for (const name of ["Get started", "Read the docs"]) {
      const link = screen.getByRole("link", { name });
      expect(link.closest("[data-reveal]")).toBeNull();
      expect(link.closest("[data-split]")).toBeNull();
    }
    expect(screen.getByText(/npm i/).closest("[data-reveal]")).toBeNull();
  });

  it("blocks hidden for the motion module are shown by CSS alone if it is late or fails", () => {
    expect(css).toMatch(/\.lp-motion:not\(\.lp-motion-ready\)[^{]*\[data-reveal\][^{]*\{[^}]*animation:\s*lp-failsafe/);
    expect(css).toMatch(/@keyframes lp-failsafe\s*\{[^}]*to\s*\{[^}]*visibility:\s*visible/);
  });
});
