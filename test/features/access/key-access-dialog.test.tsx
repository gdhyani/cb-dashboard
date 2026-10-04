import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { KeyAccessDialog } from "@/features/access";
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
const resources = vi.hoisted(() => ({
  listResources: vi.fn(),
  createResource: vi.fn(),
  rotateResource: vi.fn(),
  updateResource: vi.fn(),
  deleteResource: vi.fn(),
  listProfiles: vi.fn(),
  createProfile: vi.fn(),
  rotateProfile: vi.fn(),
  deleteProfile: vi.fn(),
  listPresets: vi.fn(),
  testResource: vi.fn(),
}));
vi.mock("@/features/access/api/access.api", () => access);
vi.mock("@/features/resources/api/resources.api", () => resources);

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
  members: [member("asha", "Asha", "owner"), member("ravi", "Ravi"), member("kim", "Kim")],
  environments: [{ id: "e1", name: "development", killed: false }],
  grants: [
    grant({
      id: "g1",
      userId: "ravi",
      expiresAt: "2030-01-01T00:00:00.000Z",
      resourceProfiles: [{ resourceId: "other", profile: "readonly" }],
    }),
  ],
};

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.scrollIntoView ??= () => {};
});
beforeEach(() => {
  vi.clearAllMocks();
  access.getAccess.mockResolvedValue(MATRIX);
  access.setProjectAccess.mockResolvedValue({});
});

function renderDialog() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <KeyAccessDialog projectId="p1" envId="e1" resourceId="r1" keyName="MONGODB_URI" open onOpenChange={() => {}} />
    </QueryClientProvider>,
  );
}

describe("Who can use it (D10, J4)", () => {
  it("lists only people with this environment; owners and admins are fixed", async () => {
    resources.listProfiles.mockResolvedValue([{ name: "default", rotatedAt: null, isDefault: true }]);
    renderDialog();
    expect(await screen.findByText("Ravi")).toBeInTheDocument();
    expect(screen.getByText("Asha")).toBeInTheDocument();
    expect(screen.getByText(/Always · default login/)).toBeInTheDocument();
    expect(screen.queryByText("Kim")).toBeNull();
    expect(screen.getByText(/Add or remove people on the Access tab/)).toBeInTheDocument();
  });

  it("with only the default login the choice is disabled and explained", async () => {
    resources.listProfiles.mockResolvedValue([{ name: "default", rotatedAt: null, isDefault: true }]);
    renderDialog();
    expect(await screen.findByRole("combobox", { name: "Login for Ravi" })).toBeDisabled();
    expect(screen.getByText(/Add a read-only login in Edit/)).toBeInTheDocument();
  });

  it("changing a login keeps the rest of the person's access", async () => {
    resources.listProfiles.mockResolvedValue([
      { name: "default", rotatedAt: null, isDefault: true },
      { name: "readonly", rotatedAt: null, isDefault: false },
    ]);
    renderDialog();
    const select = await screen.findByRole("combobox", { name: "Login for Ravi" });
    await waitFor(() => expect(select).not.toBeDisabled());
    fireEvent.click(select);
    fireEvent.click(within(await screen.findByRole("listbox")).getByRole("option", { name: "readonly" }));
    await waitFor(() =>
      expect(access.setProjectAccess).toHaveBeenCalledWith("p1", "ravi", {
        scope: "environments",
        environmentIds: ["e1"],
        expiresAt: "2030-01-01T00:00:00.000Z",
        resourceProfiles: [
          { resourceId: "other", profile: "readonly" },
          { resourceId: "r1", profile: "readonly" },
        ],
      }),
    );
  });
});
