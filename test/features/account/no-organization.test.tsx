import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NoOrganization } from "@/features/account";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

const ok = (data: unknown): [number, unknown] => [200, { success: true, data, meta: { correlationId: "c1" } }];
let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/auth/me").reply(...ok({ user: { id: "u1", name: "Asha", email: "asha@cp-test.dev" }, memberships: [] }));
});
afterEach(() => mock.restore());

describe("FR-ACC-002/004 signed in without an organization", () => {
  it("explains how to join and offers Sign out and Delete account", async () => {
    render(
      <QueryClientProvider client={makeQueryClient()}>
        <NoOrganization />
      </QueryClientProvider>,
    );
    expect(screen.getByText("You're not in an organization")).toBeInTheDocument();
    expect(await screen.findByText("asha@cp-test.dev")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete account" })).toBeInTheDocument();
  });
});
