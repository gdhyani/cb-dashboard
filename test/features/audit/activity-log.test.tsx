import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActivityLog } from "@/features/audit/components/activity-log";
import { auditFilters, auditSearchFields } from "@/features/audit/lib/audit-query";
import type { AuditEvent } from "@/features/audit/types";

const t = Date.parse("2026-11-13T10:00:00.000Z");
const event = (o: Partial<AuditEvent> & { id: string }): AuditEvent => ({
  action: "grant.created",
  category: "access",
  outcome: "success",
  actor: { id: "u2", name: "Asha", email: "asha@acme.dev" },
  target: "dan@acme.dev",
  targetUser: null,
  project: { id: "p1", name: "Shop" },
  environment: { id: "e1", name: "development" },
  resource: null,
  meta: {},
  createdAt: new Date(t).toISOString(),
  ...o,
});

const EVENTS: AuditEvent[] = [
  event({ id: "a1" }),
  event({
    id: "a2",
    action: "agent.bootstrap",
    category: "runtime",
    outcome: "denied",
    actor: { id: "u3", name: "Erin", email: "erin@acme.dev" },
    target: null,
    meta: { reason: "NO_GRANT" },
    createdAt: new Date(t - 60_000).toISOString(),
  }),
  event({
    id: "a3",
    action: "tunnel.opened",
    category: "runtime",
    actor: { id: "u1", name: "Dev Dan", email: "dan@acme.dev" },
    target: null,
    resource: { id: "r1", name: "shop-db", kind: "mongodb" },
    createdAt: new Date(t - 120_000).toISOString(),
  }),
  event({
    id: "a4",
    action: "tunnel.closed",
    category: "runtime",
    actor: { id: "u1", name: "Dev Dan", email: "dan@acme.dev" },
    target: null,
    resource: { id: "r1", name: "shop-db", kind: "mongodb" },
    createdAt: new Date(t - 180_000).toISOString(),
  }),
];

const useAudit = vi.fn();
vi.mock("@/features/audit/hooks/use-audit", () => ({ useAudit: (...args: unknown[]) => useAudit(...args) }));

const pagination = { page: 1, pageSize: 50, total: 4, totalPages: 1, hasNext: false, hasPrev: false };

describe("activity log query logic", () => {
  it("searches actor, action, target and place", () => {
    const fields = auditSearchFields(EVENTS[0] as AuditEvent);
    expect(fields).toEqual(
      expect.arrayContaining(["Asha", "asha@acme.dev", "grant.created", "grant created", "dan@acme.dev", "Shop"]),
    );
  });

  it("filters by outcome", () => {
    expect(EVENTS.filter((e) => auditFilters.outcome(e, "denied")).map((e) => e.id)).toEqual(["a2"]);
  });
});

describe("ActivityLog (J8)", () => {
  it("renders a dense table with sessions collapsed, outcome badges and search", () => {
    useAudit.mockReturnValue({ data: { items: EVENTS, pagination }, isPending: false, error: null });
    render(<ActivityLog orgId="o1" />);
    expect(screen.getByText("4 events")).toBeInTheDocument();
    // a1, a2, and one session row for Dan's two runtime events.
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getByText("Denied")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /2 events/ });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("row")).toHaveLength(6);

    fireEvent.change(screen.getByLabelText("Search actor, action or target"), { target: { value: "erin" } });
    expect(screen.getByText("1 of 4 events")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search actor, action or target"), { target: { value: "nothing" } });
    expect(screen.getByText("No events match your filters")).toBeInTheDocument();
  });

  it("asks the API for the page and category (server-side filters)", () => {
    useAudit.mockReturnValue({ data: { items: EVENTS, pagination }, isPending: false, error: null });
    render(<ActivityLog orgId="o1" pageSize={25} />);
    expect(useAudit).toHaveBeenLastCalledWith("o1", 1, 25, undefined);
  });

  it("shows an empty state when there is no activity at all", () => {
    useAudit.mockReturnValue({
      data: { items: [], pagination: { ...pagination, total: 0, totalPages: 0 } },
      isPending: false,
      error: null,
    });
    render(<ActivityLog orgId="o1" />);
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
  });
});
