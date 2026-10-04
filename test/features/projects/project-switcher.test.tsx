import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectSwitcher } from "@/features/projects";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

const push = vi.fn();
let pathname = "/orgs/o1";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

beforeAll(() => {
  // jsdom lacks these; cmdk and the media-query hook need them. matches=false → the phone panel.
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Element.prototype.scrollIntoView = vi.fn();
});

const project = (id: string, name: string) => ({
  id,
  orgId: "o1",
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  description: "",
  environments: [],
  createdAt: "2026-10-04T00:00:00.000Z",
});

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/orgs/o1/projects").reply(200, {
    success: true,
    data: [project("p1", "Shop API"), project("p2", "Billing")],
    meta: { correlationId: "c1" },
  });
  push.mockReset();
  pathname = "/orgs/o1";
});
afterEach(() => mock.restore());

const renderSwitcher = (canCreate = true) =>
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <ProjectSwitcher orgId="o1" canCreate={canCreate} />
    </QueryClientProvider>,
  );

describe("ProjectSwitcher (navbar)", () => {
  it("labels the trigger with the current project, or All projects outside one", async () => {
    pathname = "/orgs/o1/projects/p2/environments/e1";
    renderSwitcher();
    expect(await screen.findByText("Billing")).toBeInTheDocument();
  });

  it("shows All projects when no project is open", () => {
    renderSwitcher();
    expect(screen.getByText("All projects")).toBeInTheDocument();
  });

  it("searches projects and navigates to the one picked", async () => {
    renderSwitcher();
    fireEvent.click(screen.getByRole("button", { name: "Switch project" }));
    const input = await screen.findByPlaceholderText("Find project…");
    expect(await screen.findByText("Shop API")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "zzz" } });
    expect(await screen.findByText("No projects match.")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "shop" } });
    fireEvent.click(await screen.findByText("Shop API"));
    expect(push).toHaveBeenCalledWith("/orgs/o1/projects/p1");
  });

  it("offers Create project only to admins (FR-UI-004)", async () => {
    renderSwitcher(false);
    fireEvent.click(screen.getByRole("button", { name: "Switch project" }));
    expect(await screen.findByText("Shop API")).toBeInTheDocument();
    expect(screen.queryByText("Create project")).not.toBeInTheDocument();
  });
});
