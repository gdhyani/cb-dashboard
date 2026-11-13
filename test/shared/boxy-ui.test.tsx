import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuickAdd } from "@/features/variables/components/quick-add";
import { BadgeLabel } from "@/shared/components/badge-label";
import { logoColor } from "@/shared/components/service-logo";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

describe("v1.32 / v1.59 badges and buttons (docs skin + Supabase dashboard skin)", () => {
  it("BadgeLabel is boxy in docs, a Supabase pill on dashboard surfaces, and its states are coloured", () => {
    const { rerender } = render(<BadgeLabel tone="success">Delivered</BadgeLabel>);
    const badge = screen.getByText("Delivered");
    expect(badge.className).toMatch(/\brounded-md\b/);
    expect(badge.className).toMatch(/\bstudio:rounded-full\b/);
    expect(badge.className).toMatch(/\bstudio:uppercase\b/);
    // Success stays green (success token), never the brass accent (v1.61).
    expect(badge.className).toMatch(/\bstudio:text-success\b/);
    expect(badge.className).not.toMatch(/studio:text-primary/);
    expect(badge.className).toMatch(/emerald/);
    rerender(<BadgeLabel tone="warning">Retrying</BadgeLabel>);
    expect(screen.getByText("Retrying").className).toMatch(/amber/);
    rerender(<BadgeLabel tone="strong">admin</BadgeLabel>);
    expect(screen.getByText("admin").className).toMatch(/violet/);
    rerender(<BadgeLabel>developer</BadgeLabel>);
    expect(screen.getByText("developer").className).toMatch(/sky/);
    rerender(<BadgeLabel tone="muted">No access</BadgeLabel>);
    expect(screen.getByText("No access").className).toMatch(/bg-/);
  });

  it("the shared Badge uses the same colour palette (one design system)", () => {
    const { rerender } = render(<Badge>New</Badge>);
    expect(screen.getByText("New").className).toMatch(/sky/);
    rerender(<Badge variant="success">Live</Badge>);
    expect(screen.getByText("Live").className).toMatch(/emerald/);
    rerender(<Badge variant="warning">Paused</Badge>);
    expect(screen.getByText("Paused").className).toMatch(/amber/);
  });

  it("logoColor gives the brand colour used by a mark, none for letter badges", () => {
    expect(logoColor("mongodb")).toBe("#47A248");
    expect(logoColor("secret")).toBe("#FBBF24");
    expect(logoColor("anthropic")).toBeUndefined();
    expect(logoColor("letter:WH")).toBeUndefined();
  });

  it("Quick add chips are boxy and tinted with their brand colour", () => {
    const onPick = vi.fn();
    render(<QuickAdd onPick={onPick} />);
    const mongo = screen.getByRole("button", { name: /MongoDB/ });
    expect(mongo.className).toMatch(/\brounded-md\b/);
    expect(mongo.getAttribute("style")).toMatch(/color-mix/);
    fireEvent.click(mongo);
    expect(onPick).toHaveBeenCalledWith("mongodb", undefined);
  });

  it("buttons follow Studio density and only the primary action is green", () => {
    const { rerender } = render(<Button>Save</Button>);
    const save = screen.getByRole("button", { name: "Save" });
    expect(save.className).toMatch(/h-\[28px\]/);
    expect(save.className).toMatch(/\bbg-primary-solid\b/);
    rerender(<Button variant="secondary">Cancel</Button>);
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel.className).not.toMatch(/primary/);
    rerender(<Button size="lg">Sign in</Button>);
    expect(screen.getByRole("button", { name: "Sign in" }).className).toMatch(/h-\[34px\]/);
  });
});
