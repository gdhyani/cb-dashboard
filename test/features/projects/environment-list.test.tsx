import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EnvironmentList } from "@/features/projects";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/orgs/o1/projects/p1" }));

const project = {
  id: "p1",
  orgId: "o1",
  name: "Shop API",
  slug: "shop-api",
  description: "",
  createdAt: "2026-10-04T00:00:00.000Z",
  environments: [
    { id: "e1", name: "development", killed: false, killedReason: null, hasAccess: true },
    { id: "e2", name: "staging", killed: false, killedReason: null, hasAccess: false },
    { id: "e3", name: "production", killed: true, killedReason: "Leaked key", hasAccess: true },
  ],
};

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  push.mockReset();
});
afterEach(() => mock.restore());

const renderList = (isAdmin: boolean) =>
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <EnvironmentList project={project} isAdmin={isAdmin} />
    </QueryClientProvider>,
  );

describe("EnvironmentList (project overview table)", () => {
  it("shows one status per environment: Suspended wins over access", () => {
    renderList(false);
    const row = (name: string) => screen.getByRole("row", { name: `Open ${name}` });
    expect(row("development")).toHaveTextContent("Access granted");
    expect(row("staging")).toHaveTextContent("No access");
    expect(row("production")).toHaveTextContent("Suspended");
    expect(row("production")).toHaveTextContent("Leaked key");
    expect(row("production")).not.toHaveTextContent("Access granted");
  });

  it("opens an environment by click or Enter", () => {
    renderList(false);
    fireEvent.click(screen.getByRole("row", { name: "Open development" }));
    expect(push).toHaveBeenCalledWith("/orgs/o1/projects/p1/environments/e1");
    fireEvent.keyDown(screen.getByRole("row", { name: "Open staging" }), { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/orgs/o1/projects/p1/environments/e2");
  });

  it("lets only admins create an environment (FR-UI-004)", async () => {
    mock.onPost("/projects/p1/environments").reply(201, { success: true, data: {}, meta: { correlationId: "c" } });
    const { unmount } = renderList(false);
    expect(screen.queryByRole("button", { name: "New environment" })).not.toBeInTheDocument();
    unmount();

    renderList(true);
    fireEvent.click(screen.getByRole("button", { name: "New environment" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Preview" } });
    expect(screen.getByLabelText("Name")).toHaveValue("preview");
    fireEvent.click(screen.getByRole("button", { name: "Create environment" }));
    await vi.waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ name: "preview" });
  });
});
