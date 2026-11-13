import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Resource } from "@/features/resources";
import { VariablesPanel } from "@/features/variables/components/variables-panel";
import { groupVariables } from "@/features/variables/lib/group";
import { toUnits, unitFields, unitFilters, visibleRowIds } from "@/features/variables/lib/table";
import type { Variable } from "@/features/variables/types";
import { TooltipProvider } from "@/shared/ui/tooltip";

const v = (o: Partial<Variable> & { key: string }): Variable => ({
  id: `id-${o.key}`,
  environmentId: "e1",
  type: "plain",
  required: false,
  value: null,
  format: null,
  resourceId: null,
  resourceName: null,
  field: null,
  updatedAt: "",
  ...o,
});
const res = (o: Partial<Resource>): Resource => ({
  id: "r",
  environmentId: "e1",
  kind: "http",
  name: "x",
  config: {},
  credentialsSet: true,
  rotatedAt: null,
  disabled: false,
  brokeredFields: [],
  createdAt: "",
  ...o,
});

const VARIABLES = [
  v({ key: "PORT", value: "3000" }),
  v({ key: "SESSION_SECRET", type: "generated", format: "hex:32" }),
  v({ key: "SIGNING_KEY", type: "visible" }),
  v({ key: "STRIPE_SECRET_KEY", type: "brokered", resourceId: "s", field: "key" }),
  v({ key: "NEXT_PUBLIC_PK", resourceId: "s", value: "pk_live_1" }),
  v({ key: "MONGODB_URI", type: "brokered", resourceId: "m", field: "connectionUri" }),
];
const RESOURCES = [
  res({
    id: "s",
    kind: "http",
    name: "STRIPE_SECRET_KEY",
    config: { upstreamUrl: "https://api.stripe.com", provider: "stripe" },
    health: { status: "rejected", reason: "The provider answered 401.", checkedAt: "2026-10-07T00:00:00.000Z" },
  }),
  res({
    id: "m",
    kind: "mongodb",
    name: "MONGODB_URI",
    health: { status: "ok", reason: null, checkedAt: "2026-10-07T00:00:00.000Z" },
  }),
];

const mutation = () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false });
vi.mock("@/features/variables/hooks/use-variables", () => ({
  useVariables: () => ({ data: VARIABLES, isPending: false, error: null }),
  useVariableMutations: () => ({
    create: mutation(),
    createService: mutation(),
    update: mutation(),
    remove: mutation(),
  }),
}));
vi.mock("@/features/access", () => ({ KeyAccessDialog: () => null }));
vi.mock("@/features/resources", () => ({
  useProfiles: () => ({ data: [], isPending: false, error: null }),
  useProfileMutations: () => ({ create: mutation(), rotate: mutation(), remove: mutation() }),
  useResources: () => ({ data: RESOURCES, isPending: false, error: null }),
  useServiceMutations: () => ({ update: mutation(), remove: mutation() }),
  useTestResource: () => mutation(),
}));

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= () => {};
});

function renderPanel(isAdmin = true) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <TooltipProvider>
        <VariablesPanel projectId="p1" envId="e1" isAdmin={isAdmin} />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

const table = () => screen.getByRole("table");
const keysShown = () =>
  within(table())
    .queryAllByRole("row")
    .slice(1)
    .map((r) => r.querySelector("td .font-mono")?.textContent ?? r.textContent ?? "");

async function pick(filter: string, option: string) {
  fireEvent.click(screen.getByRole("combobox", { name: filter }));
  fireEvent.click(await screen.findByRole("option", { name: option }));
}

describe("Variables table toolbar (D1, Studio data table)", () => {
  it("shows the Studio column heads and the count of every key", () => {
    renderPanel();
    const heads = within(table())
      .getAllByRole("columnheader")
      .map((h) => h.textContent);
    expect(heads.slice(0, 4)).toEqual(["Key", "Value", "Type", "Status"]);
    expect(screen.getByText("6 variables")).toBeInTheDocument();
  });

  it("search by key narrows the table; an extra key keeps its main key as the parent", () => {
    renderPanel();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search by key" }), { target: { value: "next_public" } });
    expect(keysShown()).toEqual(["STRIPE_SECRET_KEY", "NEXT_PUBLIC_PK"]);
    expect(screen.getByText("2 of 6 variables")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search by key" }), { target: { value: "port" } });
    expect(keysShown()).toEqual(["PORT"]);
  });

  it("zero matches show one quiet row, and Clear filters brings everything back", () => {
    renderPanel();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search by key" }), {
      target: { value: "nothing-like-it" },
    });
    expect(screen.getByText("No variables match your search")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("6 variables")).toBeInTheDocument();
  });

  it("filter by type keeps only that type", async () => {
    renderPanel();
    await pick("Filter by type", "Random secret");
    expect(keysShown()).toEqual(["SESSION_SECRET"]);
    await pick("Filter by type", "Stripe");
    expect(keysShown()).toEqual(["STRIPE_SECRET_KEY", "NEXT_PUBLIC_PK"]);
  });

  it("B11 filter by status: Working / Expired / Not checked", async () => {
    renderPanel();
    await pick("Filter by status", "Expired");
    expect(keysShown()).toEqual(["STRIPE_SECRET_KEY", "NEXT_PUBLIC_PK"]);
    await pick("Filter by status", "Working");
    expect(keysShown()).toEqual(["MONGODB_URI"]);
    await pick("Filter by status", "Not checked");
    expect(screen.getByText("No variables match your search")).toBeInTheDocument();
  });

  it("Import .env is secondary and Add variable is the one green button", () => {
    renderPanel();
    expect(screen.getByRole("button", { name: "Import .env" })).toHaveAttribute("data-variant", "secondary");
    expect(screen.getByRole("button", { name: "Add variable" })).toHaveAttribute("data-variant", "default");
    expect(document.querySelectorAll('[data-slot="button"][data-variant="default"]')).toHaveLength(1);
  });

  it("FR-UI-003 a value shown as-is carries a warning badge in the table", () => {
    renderPanel();
    const row = screen.getByText("SIGNING_KEY").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText("Shown as-is").className).toMatch(/warning/);
  });

  it("FR-UI-004 developers can search but get no add buttons or row menus", () => {
    renderPanel(false);
    expect(screen.getByRole("searchbox", { name: "Search by key" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Import .env" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Actions for/ })).toBeNull();
  });
});

describe("Variables table units (lib/table)", () => {
  const units = toUnits(groupVariables(VARIABLES, RESOURCES));

  it("one unit per standalone key or service, typed for the filter", () => {
    expect(units.map((u) => u.typeKey).sort()).toEqual(["gen", "mongodb", "plain", "stripe", "visible"]);
    expect(units.find((u) => u.typeKey === "stripe")?.status).toBe("rejected");
  });

  it("a service matches a search on any of its keys; only matching extras stay visible", () => {
    const stripe = units.find((u) => u.typeKey === "stripe");
    if (!stripe) throw new Error("no stripe unit");
    expect(unitFields(stripe)).toEqual(["STRIPE_SECRET_KEY", "NEXT_PUBLIC_PK"]);
    expect(unitFilters.status(stripe, "rejected")).toBe(true);
    expect([...visibleRowIds([stripe], "stripe_secret")]).toEqual(["id-STRIPE_SECRET_KEY"]);
  });
});
