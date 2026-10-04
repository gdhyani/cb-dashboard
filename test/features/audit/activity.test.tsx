import { render, screen } from "@testing-library/react";
import { expect, it, describe as suite } from "vitest";
import { describe } from "@/features/audit/lib/describe";
import { groupFeed, sessionSummary } from "@/features/audit/lib/group";
import type { AuditEvent } from "@/features/audit/types";

const base = (over: Partial<AuditEvent>): AuditEvent => ({
  id: Math.random().toString(36).slice(2),
  action: "tunnel.opened",
  category: "runtime",
  outcome: "success",
  actor: { id: "u1", name: "Dev Dan", email: "dan@x" },
  target: null,
  targetUser: null,
  project: { id: "p1", name: "Shop" },
  environment: { id: "e1", name: "development" },
  resource: { id: "r1", name: "shop-db", kind: "mongodb" },
  meta: {},
  createdAt: new Date().toISOString(),
  ...over,
});

suite("activity feed", () => {
  it("collapses runtime events of one person in one environment into a session", () => {
    const t = Date.now();
    const events = [
      base({ action: "tunnel.closed", createdAt: new Date(t).toISOString() }),
      base({
        action: "http.request",
        resource: { id: "r2", name: "provider", kind: "http" },
        createdAt: new Date(t - 1000).toISOString(),
      }),
      base({ action: "tunnel.opened", createdAt: new Date(t - 2000).toISOString() }),
      base({
        action: "grant.revoked",
        category: "access",
        actor: { id: "u2", name: "Asha", email: "a@x" },
        target: "dan@x",
        createdAt: new Date(t - 3000).toISOString(),
      }),
      base({
        action: "tunnel.opened",
        actor: { id: "u3", name: "Erin", email: "e@x" },
        createdAt: new Date(t - 4000).toISOString(),
      }),
    ];
    const items = groupFeed(events);
    expect(items.map((i) => i.kind)).toEqual(["session", "event", "event"]);
    const first = items[0];
    if (first?.kind !== "session") throw new Error("expected a session");
    expect(sessionSummary(first.events)).toEqual({
      connections: 1,
      calls: 1,
      starts: 0,
      resources: ["shop-db", "provider"],
    });
  });

  it("writes plain sentences with the entities named", () => {
    render(
      <p>
        {
          describe(
            base({
              action: "grant.revoked",
              category: "access",
              actor: { id: "u2", name: "Asha", email: "a" },
              target: "dan@x",
            }),
          ).text
        }
      </p>,
    );
    expect(screen.getByText("dan@x")).toBeInTheDocument();
    expect(screen.getByText("development")).toBeInTheDocument();
    expect(describe(base({ action: "grant.revoked", category: "access" })).alert).toBe(true);
    render(<p>{describe(base({ action: "tunnel.opened" })).text}</p>);
    expect(screen.getByText("shop-db")).toBeInTheDocument();
  });

  it("says service, and labels every kind (v1.26)", () => {
    const { container } = render(
      <p>
        {
          describe(
            base({
              action: "resource.created",
              category: "config",
              resource: { id: "r3", name: "FIREBASE_SERVICE_ACCOUNT", kind: "google-sa" },
            }),
          ).text
        }
      </p>,
    );
    expect(container.textContent).not.toContain("google-sa");
    render(
      <p>{describe(base({ action: "resource.deleted", category: "config", target: "STRIPE_SECRET_KEY" })).text}</p>,
    );
    expect(screen.getByText(/deleted service/)).toBeInTheDocument();
  });
});
