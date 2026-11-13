import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Hint } from "@/shared/components/hint";
import { TooltipProvider } from "@/shared/ui/tooltip";

function setHoverDevice(canHover: boolean) {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: canHover, addEventListener: vi.fn(), removeEventListener: vi.fn() });
}

function renderHint() {
  render(
    <TooltipProvider>
      <Hint label="Docs">
        <button type="button">icon</button>
      </Hint>
    </TooltipProvider>,
  );
  return screen.getByRole("button", { name: "icon" });
}

describe("Hover hints on icon-only controls", () => {
  afterEach(() => vi.restoreAllMocks());

  it("phones and tablets (no real hover) get no tooltip at all", () => {
    setHoverDevice(false);
    expect(renderHint()).not.toHaveAttribute("data-slot", "tooltip-trigger");
  });

  it("mouse devices get the tooltip trigger", () => {
    setHoverDevice(true);
    expect(renderHint()).toHaveAttribute("data-slot", "tooltip-trigger");
  });
});
