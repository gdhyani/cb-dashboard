import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MyAccess, OrgOverview } from "@/features/orgs";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/orgs/o1" }));

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const ok = (data: unknown) => [200, { success: true, data, meta: { correlationId: "c" } }] as const;
const env = (id: string, name: string, hasAccess: boolean, killed = false) => ({
  id,
  name,
  killed,
  killedReason: null,
  hasAccess,
});

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/orgs/o1").reply(...ok({ id: "o1", name: "Acme", role: "developer", memberCount: 4 }));
  mock.onGet("/orgs/o1/projects").reply(
    ...ok([
      {
        id: "p1",
        orgId: "o1",
        name: "Shop API",
        slug: "shop-api",
        description: "",
        createdAt: "2026-10-04T00:00:00.000Z",
        environments: [
          env("e1", "development", true),
          env("e2", "staging", false),
          env("e3", "production", true, true),
        ],
      },
    ]),
  );
  mock.onGet("/orgs/o1/stats").reply(
    ...ok({
      scope: "me",
      days: [
        {
          date: "2026-11-12",
          connections: 7,
          denied: 1,
          byCategory: { team: 0, access: 1, config: 0, security: 0, runtime: 7 },
        },
        {
          date: "2026-11-13",
          connections: 5,
          denied: 0,
          byCategory: { team: 0, access: 0, config: 0, security: 0, runtime: 5 },
        },
      ],
      connectionsByProject: [],
      resourcesByKind: [],
      grants: { permanent: 2, temporary: 1 },
    }),
  );
  mock.onGet("/health").reply(...ok({ status: "ok", uptimeSec: 60, version: "1.0.0", checks: {} }));
  mock.onGet().reply(...ok([]));
});
afterEach(() => mock.restore());

const wrap = (ui: React.ReactNode) =>
  render(<QueryClientProvider client={makeQueryClient()}>{ui}</QueryClientProvider>);

describe("OrgOverview (Studio home)", () => {
  it("shows the org name, health line and KPI metric cards", async () => {
    wrap(<OrgOverview orgId="o1" />);
    expect(await screen.findByRole("heading", { level: 1, name: "Acme" })).toBeInTheDocument();
    expect(await screen.findByText("Backend healthy")).toBeInTheDocument();
    const connections = (await screen.findByText("Your connections")).parentElement as HTMLElement;
    expect(within(connections).getByText("12")).toBeInTheDocument();
    const envs = screen.getByText("Environments", { selector: "span" }).parentElement as HTMLElement;
    expect(within(envs).getByText("3")).toBeInTheDocument();
    expect(within(envs).getByText("1 suspended · 1 project")).toBeInTheDocument();
    expect(screen.getByText("3 active grants")).toBeInTheDocument();
  });

  it("lists every environment with its project and status, and hides recent activity from developers (FR-UI-004)", async () => {
    wrap(<OrgOverview orgId="o1" />);
    expect(await screen.findByRole("row", { name: "Open Shop API / staging" })).toHaveTextContent("No access");
    expect(screen.getByRole("row", { name: "Open Shop API / production" })).toHaveTextContent("Suspended");
    expect(screen.queryByRole("heading", { name: "Recent activity" })).not.toBeInTheDocument();
  });
});

describe("MyAccess (/me)", () => {
  it("lists only environments I can use, and a CLI quick start (FR-UI-005)", async () => {
    wrap(<MyAccess orgId="o1" />);
    expect(screen.getByRole("heading", { level: 1, name: "My Access" })).toBeInTheDocument();
    expect(await screen.findByRole("row", { name: "Open Shop API / development" })).toHaveTextContent("Access granted");
    expect(screen.queryByRole("row", { name: "Open Shop API / staging" })).not.toBeInTheDocument();
    const quickStart = screen.getByRole("heading", { name: "CLI" }).closest("[data-slot=card]") as HTMLElement;
    for (const command of ["npm i -D @cb/env", "npx cb login", "npx cb init", "npm run dev"]) {
      expect(within(quickStart).getByRole("button", { name: `Copy ${command}` })).toBeInTheDocument();
    }
  });
});
