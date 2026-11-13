import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectList } from "@/features/projects";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/orgs/o1/projects" }));

const env = (id: string, name: string, extra: { killed?: boolean; hasAccess?: boolean } = {}) => ({
  id,
  name,
  killed: extra.killed ?? false,
  killedReason: null,
  hasAccess: extra.hasAccess ?? false,
});

const project = (id: string, name: string, environments: ReturnType<typeof env>[] = []) => ({
  id,
  orgId: "o1",
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  description: "",
  environments,
  createdAt: "2026-10-04T00:00:00.000Z",
});

let mock: MockAdapter;
const replyProjects = (data: unknown[]) =>
  mock.onGet("/orgs/o1/projects").reply(200, { success: true, data, meta: { correlationId: "c1" } });

beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/orgs/o1/stats").reply(200, {
    success: true,
    data: {
      scope: "org",
      days: [],
      connectionsByProject: [{ projectId: "p1", name: "Shop API", connections: 12, daily: [] }],
      resourcesByKind: [],
      grants: { permanent: 0, temporary: 0 },
    },
    meta: { correlationId: "c2" },
  });
});
afterEach(() => mock.restore());

const renderList = (isAdmin: boolean) =>
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <ProjectList orgId="o1" isAdmin={isAdmin} />
    </QueryClientProvider>,
  );

describe("ProjectList (Studio project grid)", () => {
  it("shows one card per project with slug, environment chips and a meta footer", async () => {
    replyProjects([
      project("p1", "Shop API", [
        env("e1", "development", { hasAccess: true }),
        env("e2", "staging", { killed: true }),
      ]),
      project("p2", "Billing"),
    ]);
    renderList(true);
    const card = (await screen.findByText("Shop API")).closest("a") as HTMLElement;
    expect(card).toHaveAttribute("href", "/orgs/o1/projects/p1");
    expect(within(card).getByText("shop-api")).toBeInTheDocument();
    expect(within(card).getByText("development")).toBeInTheDocument();
    expect(within(card).getByText("staging · suspended")).toBeInTheDocument();
    expect(within(card).getByText("2 environments")).toBeInTheDocument();
    expect(await within(card).findByText("12 connections in 14 days")).toBeInTheDocument();
  });

  it("filters projects by search and says when nothing matches", async () => {
    replyProjects([project("p1", "Shop API"), project("p2", "Billing")]);
    renderList(true);
    await screen.findByText("Shop API");
    const search = screen.getByRole("searchbox", { name: "Search for a project" });

    fireEvent.change(search, { target: { value: "bill" } });
    expect(screen.queryByText("Shop API")).not.toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.getByText("1 of 2 projects")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "zzz" } });
    expect(screen.getByText("No projects match your search")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Shop API")).toBeInTheDocument();
  });

  it("offers New project only to admins (FR-UI-004)", async () => {
    replyProjects([project("p1", "Shop API")]);
    const { unmount } = renderList(true);
    expect(await screen.findByRole("button", { name: "New project" })).toBeInTheDocument();
    unmount();

    renderList(false);
    await screen.findByText("Shop API");
    expect(screen.queryByRole("button", { name: "New project" })).not.toBeInTheDocument();
  });

  it("shows an empty state with copyable CLI commands (FR-UI-005)", async () => {
    replyProjects([]);
    renderList(true);
    expect(await screen.findByText("No projects yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy npx cb login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy npx cb init" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New project" })).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("creates a project from the dialog with Cancel and Create project actions", async () => {
    replyProjects([project("p1", "Shop API")]);
    mock.onPost("/orgs/o1/projects").reply(201, {
      success: true,
      data: project("p3", "Ledger"),
      meta: { correlationId: "c3" },
    });
    renderList(true);
    fireEvent.click(await screen.findByRole("button", { name: "New project" }));
    expect(screen.getByRole("heading", { name: "Create project" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: "Create project" });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ledger" } });
    fireEvent.click(submit);
    await vi.waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ name: "Ledger" });
  });
});
