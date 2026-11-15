import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

describe("FR-LP-004 tooltips need no app-level provider (the landing and sign-in pages load no tooltip code)", () => {
  it("a tooltip renders on its own, without a TooltipProvider above it", () => {
    render(
      <Tooltip open>
        <TooltipTrigger>info</TooltipTrigger>
        <TooltipContent>More detail</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByRole("button", { name: "info" })).toHaveAttribute("data-slot", "tooltip-trigger");
    expect(screen.getAllByText("More detail").length).toBeGreaterThan(0);
  });
});
