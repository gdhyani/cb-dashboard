import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EnvironmentSettings } from "@/features/environments";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/orgs/o1/projects/p1/environments/e1/settings",
}));

const ok = (data: unknown): [number, unknown] => [200, { success: true, data, meta: { correlationId: "c1" } }];
const env = {
  id: "e1",
  projectId: "p1",
  orgId: "o1",
  name: "staging",
  killed: false,
  killedReason: null,
  version: 1,
  hasAccess: true,
};

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/orgs/o1").reply(...ok({ id: "o1", name: "Acme", role: "admin", memberCount: 2 }));
  mock.onGet("/environments/e1").reply(...ok(env));
  replace.mockReset();
});
afterEach(() => mock.restore());

function renderSettings() {
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <EnvironmentSettings orgId="o1" projectId="p1" envId="e1" />
    </QueryClientProvider>,
  );
}

describe("FR-UI-004 Environment Settings", () => {
  it("renames the environment with PATCH /environments/:id (lower-cased like the server)", async () => {
    mock.onPatch("/environments/e1").reply((config) => ok({ ...env, ...JSON.parse(config.data) }));
    renderSettings();
    const name = await screen.findByLabelText("Environment name");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.change(name, { target: { value: "Preview" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(mock.history.patch).toHaveLength(1));
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ name: "preview" });
  });

  it("rejects names the backend would refuse", async () => {
    renderSettings();
    fireEvent.change(await screen.findByLabelText("Environment name"), { target: { value: "1 prod" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText(/Use lowercase letters, digits and dashes/)).toBeInTheDocument();
    expect(mock.history.patch).toHaveLength(0);
  });

  it("FR-UI-002 suspends only with a typed reason", async () => {
    mock.onPatch("/environments/e1").reply(...ok({ ...env, killed: true, killedReason: "Leak" }));
    renderSettings();
    fireEvent.click(await screen.findByRole("switch", { name: /Accept connections/ }));
    const confirm = await screen.findByRole("button", { name: "Suspend environment" });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "Suspected leak" } });
    fireEvent.click(confirm);
    await waitFor(() => expect(mock.history.patch).toHaveLength(1));
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ killed: true, reason: "Suspected leak" });
  });

  it("deletes after confirmation and returns to the project overview", async () => {
    mock.onDelete("/environments/e1").reply(...ok({ deleted: true }));
    renderSettings();
    fireEvent.click(await screen.findByRole("button", { name: "Delete environment" }));
    expect(await screen.findByText("Delete staging?")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Delete environment" }).at(-1) as HTMLElement);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/orgs/o1/projects/p1"));
  });
});
