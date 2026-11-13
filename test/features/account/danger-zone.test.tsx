import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DangerZoneSection } from "@/features/account/components/danger-zone-section";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

const ok = (data: unknown): [number, unknown] => [200, { success: true, data, meta: { correlationId: "c1" } }];
const me = { id: "u1", name: "Asha", email: "asha@cp-test.dev" };
const locationReplace = vi.fn();

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/auth/me").reply(...ok({ user: me, memberships: [{ orgId: "o1", orgName: "Acme", role: "owner" }] }));
  locationReplace.mockReset();
  Object.defineProperty(window, "location", {
    value: { ...window.location, replace: locationReplace },
    writable: true,
  });
});
afterEach(() => mock.restore());

function renderZone(role: "owner" | "developer", soleOwner: boolean) {
  mock.onGet("/orgs/o1").reply(...ok({ id: "o1", name: "Acme", role, memberCount: 3 }));
  mock.onGet("/auth/me/deletion").reply(
    ...ok({
      email: me.email,
      orgsDeleted: soleOwner ? [{ id: "o1", name: "Acme", memberCount: 3 }] : [],
      orgsLeft: soleOwner ? [] : [{ id: "o1", name: "Acme", role }],
    }),
  );
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <DangerZoneSection orgId="o1" />
    </QueryClientProvider>,
  );
}

describe("FR-ACC-001…004 Account › Danger zone", () => {
  it("FR-ACC-004 the only owner can't leave; the reason is shown", async () => {
    renderZone("owner", true);
    expect(await screen.findByText(/You are its only owner/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Leave organization" })).toBeDisabled());
  });

  it("FR-ACC-002 only owners see Delete organization", async () => {
    renderZone("developer", false);
    expect(await screen.findByRole("button", { name: "Delete account" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Leave organization" })).toBeEnabled());
    expect(screen.queryByRole("button", { name: "Delete organization" })).not.toBeInTheDocument();
  });

  it("FR-ACC-001 delete account needs the email typed and the password, warns about sole-owner orgs, then calls DELETE /auth/me", async () => {
    renderZone("owner", true);
    mock.onDelete("/auth/me").reply(...ok({ deleted: true }));
    fireEvent.click(await screen.findByRole("button", { name: "Delete account" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByText(/Acme \(3 members\)/);
    const confirm = within(dialog).getByRole("button", { name: "Delete account" });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText("Your email"), { target: { value: "ASHA@cp-test.dev " } });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText("Your password"), { target: { value: "pw-1" } });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    await waitFor(() => expect(locationReplace).toHaveBeenCalledWith("/login"));
    const call = mock.history.delete.find((r) => r.url === "/auth/me");
    expect(JSON.parse(call?.data as string)).toEqual({ confirm: "ASHA@cp-test.dev", password: "pw-1" });
  });

  it("FR-ACC-002 a wrong password keeps the dialog open with the error and clears the password", async () => {
    renderZone("owner", false);
    mock.onDelete("/orgs/o1").reply(403, {
      success: false,
      error: { code: "WRONG_PASSWORD", message: "Password is incorrect.", statusCode: 403, correlationId: "c2" },
    });
    fireEvent.click(await screen.findByRole("button", { name: "Delete organization" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Organization name"), { target: { value: "Acme" } });
    fireEvent.change(within(dialog).getByLabelText("Your password"), { target: { value: "nope" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete organization" }));
    expect(await within(dialog).findByText("Password is incorrect. (WRONG_PASSWORD)")).toHaveAttribute("role", "alert");
    expect(within(dialog).getByLabelText("Your password")).toHaveValue("");
    expect(locationReplace).not.toHaveBeenCalled();
  });
});
