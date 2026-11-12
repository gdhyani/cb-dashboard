import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionsSection } from "@/features/account/components/sessions-section";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

const ok = (data: unknown): [number, unknown] => [200, { success: true, data, meta: { correlationId: "c1" } }];
const me = { id: "u1", name: "Asha", email: "asha@cp-test.dev" };
const session = (id: string, user: typeof me, ua: string, current = false) => ({
  id,
  user,
  userAgent: ua,
  createdAt: "2026-11-01T00:00:00.000Z",
  lastSeenAt: "2026-11-13T00:00:00.000Z",
  expiresAt: "2026-12-01T00:00:00.000Z",
  current,
});
const CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36";
const FIREFOX = "Mozilla/5.0 (Windows NT 10.0; rv:131.0) Gecko/20100101 Firefox/131.0";

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/auth/me").reply(...ok({ user: me, memberships: [{ orgId: "o1", orgName: "Acme", role: "admin" }] }));
  mock.onGet("/me/devices").reply(...ok([]));
  replace.mockReset();
});
afterEach(() => mock.restore());

function renderSessions(role: "admin" | "developer" = "admin") {
  mock.onGet("/orgs/o1").reply(...ok({ id: "o1", name: "Acme", role, memberCount: 2 }));
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <SessionsSection orgId="o1" />
    </QueryClientProvider>,
  );
}

describe("FR-UI-002 Account › Sessions", () => {
  it("lists only my sessions and offers revoke on every session except the current one", async () => {
    mock
      .onGet("/orgs/o1/sessions")
      .reply(
        ...ok([
          session("s1", me, CHROME, true),
          session("s2", me, FIREFOX),
          session("s3", { id: "u2", name: "Ravi", email: "ravi@cp-test.dev" }, CHROME),
        ]),
      );
    mock.onDelete("/sessions/s2").reply(...ok({ revoked: true }));
    renderSessions();

    expect(await screen.findByText("Firefox on Windows")).toBeInTheDocument();
    expect(screen.getByText("Chrome on macOS")).toBeInTheDocument();
    expect(screen.getByText("This browser")).toBeInTheDocument();
    // Ravi's Chrome session is not mine, so only one Chrome row; one Revoke button (Firefox), none on this browser.
    expect(screen.getAllByText("Chrome on macOS")).toHaveLength(1);
    const revokes = screen.getAllByRole("button", { name: "Revoke" });
    expect(revokes).toHaveLength(1);

    fireEvent.click(revokes[0]);
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Revoke session" }));
    await waitFor(() => expect(mock.history.delete.map((r) => r.url)).toEqual(["/sessions/s2"]));
  });

  it("does not ask developers' browsers for org sessions (admins only)", async () => {
    renderSessions("developer");
    expect(await screen.findByText(/Only owners and admins can list dashboard sessions/)).toBeInTheDocument();
    expect(mock.history.get.some((r) => r.url === "/orgs/o1/sessions")).toBe(false);
  });

  it("Sign out ends this session and goes to the sign-in page", async () => {
    mock.onGet("/orgs/o1/sessions").reply(...ok([]));
    mock.onPost("/auth/logout").reply(...ok({ loggedOut: true }));
    renderSessions();
    fireEvent.click(await screen.findByRole("button", { name: "Sign out" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });
});
