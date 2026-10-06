import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VariableRow } from "@/features/variables/components/variable-row";
import type { Variable } from "@/features/variables/types";
import { TooltipProvider } from "@/shared/ui/tooltip";

const v: Variable = {
  id: "v1",
  environmentId: "e1",
  key: "STRIPE_SECRET_KEY",
  type: "brokered",
  required: false,
  value: null,
  format: null,
  resourceId: "r1",
  resourceName: "stripe",
  field: "key",
  updatedAt: "",
};
const row = (
  health?: { status: "ok" | "rejected" | "unknown"; reason: string | null; checkedAt: string | null },
  isMain = true,
) =>
  render(
    <TooltipProvider>
      <VariableRow variable={v} index={0} isMain={isMain} chip={{ icon: "stripe", label: "Stripe" }} health={health} />
    </TooltipProvider>,
  );

describe("B11 key status: green dot when working, red Expired badge when the provider refused the key", () => {
  it("ok → a green 'Working' dot, no badge", () => {
    row({ status: "ok", reason: null, checkedAt: "2026-10-07T00:00:00.000Z" });
    expect(screen.getByRole("img", { name: /Working/ })).toBeInTheDocument();
    expect(screen.queryByText("Expired")).not.toBeInTheDocument();
  });

  it("rejected → a red dot and an Expired badge whose label carries cb's reason", () => {
    const reason =
      "The provider answered 401 Unauthorized. The key may have been deleted, rotated or expired at the provider. Replace value to fix it.";
    row({ status: "rejected", reason, checkedAt: "2026-10-07T00:00:00.000Z" });
    expect(screen.getByRole("img", { name: /Expired/ })).toBeInTheDocument();
    expect(screen.getByText("Expired")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Replace value to fix it/).length).toBeGreaterThan(0);
  });

  it("unknown → a grey 'Not checked yet' dot", () => {
    row({ status: "unknown", reason: null, checkedAt: null });
    expect(screen.getByRole("img", { name: /Not checked yet/ })).toBeInTheDocument();
  });

  it("no dot on plain keys or extra keys (only a service's main key has a status)", () => {
    row(undefined);
    expect(screen.queryByRole("img", { name: /Working|Expired|Not checked/ })).not.toBeInTheDocument();
  });

  it("the value stays hidden in every state", () => {
    row({ status: "rejected", reason: "x", checkedAt: null });
    expect(document.body.textContent).toContain("real value hidden");
  });
});
