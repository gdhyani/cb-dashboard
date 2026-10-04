import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Resource } from "@/features/resources";
import { VariablesPanel } from "@/features/variables/components/variables-panel";
import type { Variable } from "@/features/variables/types";

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
  v({ key: "STRIPE_SECRET_KEY", type: "brokered", resourceId: "s", field: "key" }),
  v({ key: "NEXT_PUBLIC_PK", resourceId: "s", value: "pk_live_1" }),
];
const RESOURCES = [
  res({
    id: "s",
    kind: "http",
    name: "STRIPE_SECRET_KEY",
    config: { upstreamUrl: "https://api.stripe.com", provider: "stripe" },
  }),
  res({ id: "o", kind: "redis", name: "cache" }),
];

const m = vi.hoisted(() => ({
  removeVariable: vi.fn(),
  removeService: vi.fn(),
  test: vi.fn(),
}));
const mutation = (fn: ReturnType<typeof vi.fn>) => ({ mutate: fn, mutateAsync: fn, isPending: false });

vi.mock("@/features/variables/hooks/use-variables", () => ({
  useVariables: () => ({ data: VARIABLES, isPending: false, error: null }),
  useVariableMutations: () => ({
    create: mutation(vi.fn()),
    createService: mutation(vi.fn()),
    update: mutation(vi.fn()),
    remove: mutation(m.removeVariable),
  }),
}));
vi.mock("@/features/resources", () => ({
  useProfiles: () => ({ data: [], isPending: false, error: null }),
  useProfileMutations: () => ({ create: mutation(vi.fn()), rotate: mutation(vi.fn()), remove: mutation(vi.fn()) }),
  useResources: () => ({ data: RESOURCES, isPending: false, error: null }),
  useServiceMutations: () => ({ update: mutation(vi.fn()), remove: mutation(m.removeService) }),
  useTestResource: () => mutation(m.test),
}));

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
beforeEach(() => {
  vi.clearAllMocks();
  m.removeVariable.mockResolvedValue(undefined);
  m.removeService.mockResolvedValue(undefined);
});

function renderPanel(isAdmin = true) {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <VariablesPanel envId="e1" isAdmin={isAdmin} />
    </QueryClientProvider>,
  );
}

async function openMenu(label: string) {
  const trigger = screen.getByRole("button", { name: label });
  fireEvent.keyDown(trigger, { key: "Enter" });
  return screen.findByRole("menu");
}

describe("Variables tab (D1, D4)", () => {
  it("D4 quick add sits above the table, once, and opens the dialog with the type set", async () => {
    renderPanel();
    expect(screen.getAllByText("Quick add")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Stripe" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Add Stripe variable" })).toBeInTheDocument();
    expect(within(dialog).queryByText("Quick add")).toBeNull();
  });

  it("groups an extra key under its main key and shows the service chip", () => {
    renderPanel();
    expect(screen.getAllByText("STRIPE_SECRET_KEY").length).toBeGreaterThan(0);
    expect(screen.getByText("with STRIPE_SECRET_KEY")).toBeInTheDocument();
    expect(screen.getAllByText("Stripe").length).toBeGreaterThan(0);
    expect(screen.queryByText("pk_live_1")).toBeInTheDocument();
  });

  it("removing a service's main key removes the whole service, naming every key", async () => {
    renderPanel();
    const menu = await openMenu("Actions for STRIPE_SECRET_KEY");
    fireEvent.click(within(menu).getByRole("menuitem", { name: /Remove/ }));
    const confirm = await screen.findByRole("dialog");
    expect(confirm).toHaveTextContent("STRIPE_SECRET_KEY");
    expect(confirm).toHaveTextContent("NEXT_PUBLIC_PK");
    fireEvent.click(within(confirm).getByRole("button", { name: "Remove service" }));
    await waitFor(() => expect(m.removeService).toHaveBeenCalledWith("s"));
    expect(m.removeVariable).not.toHaveBeenCalled();
  });

  it("removing an extra key removes only that variable", async () => {
    renderPanel();
    const menu = await openMenu("Actions for NEXT_PUBLIC_PK");
    fireEvent.click(within(menu).getByRole("menuitem", { name: /Remove/ }));
    const confirm = await screen.findByRole("dialog");
    fireEvent.click(within(confirm).getByRole("button", { name: "Remove variable" }));
    await waitFor(() => expect(m.removeVariable).toHaveBeenCalledWith("id-NEXT_PUBLIC_PK"));
    expect(m.removeService).not.toHaveBeenCalled();
  });

  it("orphan services stay removable", async () => {
    renderPanel();
    expect(screen.getByText("No variable uses this service")).toBeInTheDocument();
    const menu = await openMenu("Actions for cache");
    fireEvent.click(within(menu).getByRole("menuitem", { name: /Remove/ }));
    const confirm = await screen.findByRole("dialog");
    fireEvent.click(within(confirm).getByRole("button", { name: "Remove service" }));
    await waitFor(() => expect(m.removeService).toHaveBeenCalledWith("o"));
  });

  it("D9 Edit (menu) and a click on the key open the edit dialog for that key", async () => {
    renderPanel();
    const menu = await openMenu("Actions for STRIPE_SECRET_KEY");
    fireEvent.click(within(menu).getByRole("menuitem", { name: /Replace value/ }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Edit Stripe variable · STRIPE_SECRET_KEY" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Secret key \(new value\)/)).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "Edit PORT" }));
    expect(await screen.findByRole("heading", { name: "Edit variable · PORT" })).toBeInTheDocument();
  });

  it("FR-UI-004 developers see a read-only table", () => {
    renderPanel(false);
    expect(screen.queryByText("Quick add")).toBeNull();
    expect(screen.queryByRole("button", { name: "Add variable" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Actions for/ })).toBeNull();
    expect(screen.getByText("PORT")).toBeInTheDocument();
  });
});
