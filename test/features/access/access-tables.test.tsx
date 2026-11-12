import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EnvironmentAccess, ProjectAccess } from "@/features/access";
import type { AccessMatrix } from "@/features/access/types";

const access = vi.hoisted(() => ({
  getAccess: vi.fn(),
  grantAccess: vi.fn(),
  revokeGrant: vi.fn(),
  updateGrant: vi.fn(),
  setProjectAccess: vi.fn(),
  removeProjectAccess: vi.fn(),
  getMemberAccess: vi.fn(),
}));
vi.mock("@/features/access/api/access.api", () => access);
vi.mock("@/features/variables", () => ({ AccessPreviewSheet: () => null }));

const member = (userId: string, name: string, role: "owner" | "admin" | "developer" = "developer") => ({
  userId,
  name,
  email: `${userId}@example.com`,
  role,
  joinedAt: "",
});
const grant = (o: Partial<AccessMatrix["grants"][number]>) => ({
  id: "g",
  scope: "environment" as const,
  projectId: "p1",
  environmentId: "e1",
  userId: "u",
  expiresAt: null,
  resourceProfiles: [],
  createdAt: "",
  createdBy: "owner",
  ...o,
});
const MATRIX: AccessMatrix = {
  members: [member("asha", "Asha", "owner"), member("ravi", "Ravi Kumar"), member("lena", "Lena Ortiz")],
  environments: [{ id: "e1", name: "development", killed: false }],
  grants: [
    grant({ id: "g1", userId: "ravi" }),
    grant({ id: "g2", userId: "lena", scope: "project", environmentId: null }),
  ],
};

function wrap(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

beforeEach(() => {
  vi.clearAllMocks();
  access.getAccess.mockResolvedValue(MATRIX);
});

describe("J4 environment access: Studio table with a person search", () => {
  it("lists people with avatar, name, email and where the access comes from", async () => {
    wrap(<EnvironmentAccess projectId="p1" projectName="Shop" envId="e1" envName="development" />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("Ravi Kumar")).toBeInTheDocument();
    expect(within(table).getByText("ravi@example.com")).toBeInTheDocument();
    expect(within(table).getByText("This environment")).toBeInTheDocument();
    expect(within(table).getByText("Via project access")).toBeInTheDocument();
    expect(screen.getByText("2 developers")).toBeInTheDocument();
  });

  it("search by person filters by name or email", async () => {
    wrap(<EnvironmentAccess projectId="p1" projectName="Shop" envId="e1" envName="development" />);
    const search = await screen.findByRole("searchbox", { name: "Search people" });
    fireEvent.change(search, { target: { value: "lena@" } });
    const table = screen.getByRole("table");
    expect(within(table).getByText("Lena Ortiz")).toBeInTheDocument();
    expect(within(table).queryByText("Ravi Kumar")).toBeNull();
    expect(screen.getByText("1 of 2 developers")).toBeInTheDocument();
    fireEvent.change(search, { target: { value: "zed" } });
    expect(screen.getByText("No people match your search")).toBeInTheDocument();
  });
});

describe("J7 project access: Studio table with a person search", () => {
  it("lists developers with scope and expiry; owners and admins sit in the collapsed line", async () => {
    wrap(<ProjectAccess projectId="p1" projectName="Shop" />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("All environments")).toBeInTheDocument();
    expect(within(table).getByText("development")).toBeInTheDocument();
    expect(within(table).getAllByText("No expiry")).toHaveLength(2);
    expect(within(table).queryByText("Asha")).toBeNull();
    expect(screen.getByRole("button", { name: /Owners and admins \(1\)/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("search narrows the people and keeps the Add people action", async () => {
    wrap(<ProjectAccess projectId="p1" projectName="Shop" />);
    fireEvent.change(await screen.findByRole("searchbox", { name: "Search people" }), { target: { value: "ravi" } });
    const table = screen.getByRole("table");
    expect(within(table).getByText("Ravi Kumar")).toBeInTheDocument();
    expect(within(table).queryByText("Lena Ortiz")).toBeNull();
    expect(screen.getByRole("button", { name: "Add people" })).toBeEnabled();
  });
});
