import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectSettings } from "@/features/projects";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/orgs/o1/projects/p1/settings",
}));

const ok = (data: unknown): [number, unknown] => [200, { success: true, data, meta: { correlationId: "c1" } }];
const project = {
  id: "p1",
  orgId: "o1",
  name: "Shop API",
  slug: "shop-api",
  description: "Checkout service",
  environments: [],
  createdAt: "2026-10-04T00:00:00.000Z",
};

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/projects/p1").reply(...ok(project));
  replace.mockReset();
});
afterEach(() => mock.restore());

function renderSettings(role: "owner" | "developer" = "owner") {
  mock.onGet("/orgs/o1").reply(...ok({ id: "o1", name: "Acme", role, memberCount: 2 }));
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <ProjectSettings orgId="o1" projectId="p1" />
    </QueryClientProvider>,
  );
}

describe("FR-UI-004 Project Settings › General", () => {
  it("keeps Cancel and Save disabled until a field changes, and Cancel restores the saved values", async () => {
    renderSettings();
    const name = await screen.findByLabelText("Project name");
    expect(name).toHaveValue("Shop API");
    expect(screen.getByLabelText("Project slug")).toHaveValue("shop-api");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    fireEvent.change(name, { target: { value: "Shop" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Save" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.getByLabelText("Project name")).toHaveValue("Shop API"));
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("saves name and description with PATCH /projects/:id", async () => {
    mock.onPatch("/projects/p1").reply((config) => {
      const body = JSON.parse(config.data);
      return ok({ ...project, ...body });
    });
    renderSettings();
    fireEvent.change(await screen.findByLabelText("Project name"), { target: { value: "Shop Web" } });
    fireEvent.change(screen.getByLabelText(/Description/), { target: { value: "Storefront" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(mock.history.patch).toHaveLength(1));
    expect(JSON.parse(mock.history.patch[0].data)).toEqual({ name: "Shop Web", description: "Storefront" });
    await waitFor(() => expect(screen.getByRole("button", { name: "Save" })).toBeDisabled());
    expect(screen.getByLabelText("Project name")).toHaveValue("Shop Web");
  });

  it("does not send an empty name", async () => {
    renderSettings();
    fireEvent.change(await screen.findByLabelText("Project name"), { target: { value: "  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Enter a project name")).toBeInTheDocument();
    expect(mock.history.patch).toHaveLength(0);
  });

  it("FR-UI-002 deletes the project only after a typed reason, then goes to the projects list", async () => {
    mock.onDelete("/projects/p1").reply(...ok({ deleted: true }));
    renderSettings();
    fireEvent.click(await screen.findByRole("button", { name: "Delete project" }));
    expect(await screen.findByText("Delete Shop API?")).toBeInTheDocument();
    const confirm = screen.getAllByRole("button", { name: "Delete project" }).at(-1) as HTMLElement;
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "Retired service" } });
    fireEvent.click(confirm);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/orgs/o1/projects"));
    expect(mock.history.delete).toHaveLength(1);
  });

  it("shows developers a notice instead of the form", async () => {
    renderSettings("developer");
    expect(await screen.findByText("Only owners and admins can change project settings")).toBeInTheDocument();
    expect(screen.queryByLabelText("Project name")).not.toBeInTheDocument();
  });
});
