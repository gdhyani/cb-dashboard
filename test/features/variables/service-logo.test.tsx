import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceLogo } from "@/features/variables/components/service-logo";

describe("ServiceLogo", () => {
  it("renders the brand path for known icons and a letter fallback otherwise", () => {
    const { container, rerender } = render(<ServiceLogo icon="mongodb" />);
    expect(container.querySelector("svg path")).not.toBeNull();
    rerender(<ServiceLogo icon="letter:{}" />);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.textContent).toBe("{}");
    rerender(<ServiceLogo icon="no-such-brand" />);
    expect(container.textContent).toBe("NO");
  });
});

describe("ServiceLogo brand colours (owner trial, v1.32)", () => {
  it("has no border and draws known marks in their brand colour", () => {
    const { container } = render(<ServiceLogo icon="mongodb" />);
    expect(container.firstElementChild?.className).not.toMatch(/\bborder\b/);
    expect(container.querySelector("svg")?.getAttribute("style")).toMatch(/rgb\(71, 162, 72\)/);
  });

  it("brand colours too dark for the black background fall back to the text colour", () => {
    const { container, rerender } = render(<ServiceLogo icon="anthropic" />);
    expect(container.querySelector("svg")?.getAttribute("style") ?? "").not.toMatch(/rgb\(25, 25, 25\)/);
    rerender(<ServiceLogo icon="razorpay" />);
    expect(container.querySelector("svg")?.getAttribute("style") ?? "").not.toMatch(/rgb\(12, 36, 81\)/);
  });
});

describe("ServiceLogo coloured glyphs for types without a brand mark", () => {
  it.each([
    ["aws", "rgb(255, 153, 0)"],
    ["secret", "rgb(251, 191, 36)"],
    ["mail", "rgb(56, 189, 248)"],
    ["api", "rgb(244, 114, 182)"],
  ])("%s is a coloured icon, not a letter badge", (icon, color) => {
    const { container } = render(<ServiceLogo icon={icon} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("style")).toContain(color);
    expect(container.textContent).toBe("");
  });

  it("AWS S3, SMTP, Random secret and Other API use them in Quick add", async () => {
    const { QUICK_ADD } = await import("@/features/variables/lib/catalog");
    const icon = (id: string) => QUICK_ADD.find((q) => q.id === id)?.icon;
    expect([icon("aws"), icon("smtp"), icon("gen"), icon("http")]).toEqual(["aws", "mail", "secret", "api"]);
  });
});
