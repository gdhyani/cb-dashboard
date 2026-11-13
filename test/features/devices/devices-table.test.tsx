import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DevicesTable } from "@/features/devices/components/devices-table";
import { SessionsList } from "@/features/devices/components/sessions-list";
import {
  browserName,
  describeBrowser,
  deviceFilters,
  deviceSorters,
  sessionFilters,
  sessionSearchFields,
  sessionSorters,
} from "@/features/devices/lib/device-query";
import type { Device, WebSession } from "@/features/devices/types";

const CHROME_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const FIREFOX_WIN = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0";

const device = (o: Partial<Device> & { id: string; name: string }): Device => ({
  os: "macOS",
  user: { id: "u1", name: "Dev Dan", email: "dan@acme.dev" },
  lastSeenAt: "2026-11-01T00:00:00.000Z",
  createdAt: "2026-10-01T00:00:00.000Z",
  revoked: false,
  agent: { online: false, version: null, activeTunnels: 0, seenAt: null },
  ...o,
});

const DEVICES: Device[] = [
  device({
    id: "d1",
    name: "dan-mbp",
    agent: { online: true, version: "1.2.0", activeTunnels: 2, seenAt: "2026-11-13T00:00:00.000Z" },
  }),
  device({
    id: "d2",
    name: "asha-linux",
    os: "Linux",
    user: { id: "u2", name: "Asha", email: "asha@acme.dev" },
    lastSeenAt: "2026-11-10T00:00:00.000Z",
  }),
  device({ id: "d3", name: "old-laptop", revoked: true, lastSeenAt: null }),
];

const session = (o: Partial<WebSession> & { id: string }): WebSession => ({
  user: { id: "u1", name: "Dev Dan", email: "dan@acme.dev" },
  userAgent: CHROME_MAC,
  createdAt: "2026-11-01T00:00:00.000Z",
  lastSeenAt: "2026-11-12T00:00:00.000Z",
  expiresAt: "2099-01-01T00:00:00.000Z",
  current: false,
  ...o,
});

const SESSIONS: WebSession[] = [
  session({ id: "s1", current: true }),
  session({
    id: "s2",
    userAgent: FIREFOX_WIN,
    user: { id: "u2", name: "Asha", email: "asha@acme.dev" },
    lastSeenAt: "2026-11-13T00:00:00.000Z",
  }),
];

const mutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };
vi.mock("@/features/devices/hooks/use-devices", () => ({
  useMyDevices: () => ({ data: DEVICES, isPending: false, error: null }),
  useOrgDevices: () => ({ data: DEVICES, isPending: false, error: null }),
  useOrgSessions: () => ({ data: SESSIONS, isPending: false, error: null }),
  useRevokeDevice: () => mutation,
  useRevokeSession: () => mutation,
}));

describe("devices query logic", () => {
  it("filters devices by agent and revoked status", () => {
    expect(DEVICES.filter((d) => deviceFilters.agent(d, "running")).map((d) => d.id)).toEqual(["d1"]);
    expect(DEVICES.filter((d) => deviceFilters.agent(d, "stopped")).map((d) => d.id)).toEqual(["d2", "d3"]);
    expect(DEVICES.filter((d) => deviceFilters.status(d, "revoked")).map((d) => d.id)).toEqual(["d3"]);
    expect(DEVICES.filter((d) => deviceFilters.status(d, "active")).map((d) => d.id)).toEqual(["d1", "d2"]);
  });

  it("sorts devices by name, user and last seen (never seen first)", () => {
    expect([...DEVICES].sort(deviceSorters.name).map((d) => d.id)).toEqual(["d2", "d1", "d3"]);
    expect([...DEVICES].sort(deviceSorters.user).map((d) => d.user.name)).toEqual(["Asha", "Dev Dan", "Dev Dan"]);
    expect([...DEVICES].sort(deviceSorters.seen).map((d) => d.id)).toEqual(["d3", "d1", "d2"]);
  });

  it("describes browsers and filters sessions by browser", () => {
    expect(describeBrowser(CHROME_MAC)).toBe("Chrome on macOS");
    expect(browserName(FIREFOX_WIN)).toBe("Firefox");
    expect(sessionSearchFields(SESSIONS[1] as WebSession)).toContain("Firefox on Windows");
    expect(SESSIONS.filter((s) => sessionFilters.browser(s, "Chrome")).map((s) => s.id)).toEqual(["s1"]);
    expect([...SESSIONS].sort(sessionSorters.active).map((s) => s.id)).toEqual(["s1", "s2"]);
  });
});

describe("DevicesTable", () => {
  it("shows agent status, hides revoke on revoked devices and filters by search", () => {
    render(<DevicesTable scope="org" orgId="o1" />);
    expect(screen.getByText("3 devices")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("2 open")).toBeInTheDocument();
    expect(screen.getByText("Revoked")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions for dan-mbp" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Actions for old-laptop" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search devices or people"), { target: { value: "asha" } });
    expect(screen.getByText("1 of 3 devices")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search devices or people"), { target: { value: "zzz" } });
    expect(screen.getByText("No devices match your filters")).toBeInTheDocument();
  });

  it("has no toolbar for the user's own devices", () => {
    render(<DevicesTable scope="mine" />);
    expect(screen.queryByLabelText("Search devices or people")).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /User/ })).not.toBeInTheDocument();
  });
});

describe("SessionsList", () => {
  it("lists sessions newest first, marks this browser and offers sign-out only for others", () => {
    render(<SessionsList orgId="o1" />);
    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Firefox on Windows");
    expect(rows[1]).toHaveTextContent("This browser");
    expect(screen.getByRole("button", { name: "Actions for asha@acme.dev's session" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Actions for dan@acme.dev's session" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search browsers or people"), { target: { value: "chrome" } });
    expect(screen.getByText("1 of 2 sessions")).toBeInTheDocument();
  });
});
