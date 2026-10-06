import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("next=/orgs/o1"),
}));

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
  mock.onGet("/auth/me").reply(401, {
    success: false,
    error: { code: "UNAUTHORIZED", message: "Authentication is required.", statusCode: 401, correlationId: "c0" },
  });
  replace.mockReset();
});
afterEach(() => mock.restore());

function renderLogin() {
  render(
    <QueryClientProvider client={makeQueryClient()}>
      <LoginForm />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "asha@cp-test.dev" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrongpass1" } });
}

describe("FR-UI-006 LoginForm", () => {
  it("shows wrong credentials inline, clears the password and keeps the email", async () => {
    mock.onPost("/auth/login").reply(401, {
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email or password is incorrect.",
        statusCode: 401,
        correlationId: "c1",
      },
    });
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Email or password is incorrect.")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("asha@cp-test.dev");
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows a network failure inline with its code", async () => {
    mock.onPost("/auth/login").networkError();
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText(/Can't reach the server/)).toBeInTheDocument();
    expect(screen.getByText(/NETWORK_ERROR/)).toBeInTheDocument();
  });

  it("clears the error once the user edits the form", async () => {
    mock.onPost("/auth/login").reply(401, {
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email or password is incorrect.",
        statusCode: 401,
        correlationId: "c1",
      },
    });
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    await screen.findByText("Email or password is incorrect.");

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "x" } });
    await waitFor(() => expect(screen.queryByText("Email or password is incorrect.")).not.toBeInTheDocument());
  });

  it("goes to the requested page after a successful login", async () => {
    mock
      .onPost("/auth/login")
      .reply(200, { success: true, data: { user: {}, memberships: [] }, meta: { correlationId: "c2" } });
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/orgs/o1"));
  });

  it("has a show-password toggle", () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });
});

describe("FR-DOC-003 login links to the docs", () => {
  it("has a Read the docs link to /docs", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: "Read the docs" })).toHaveAttribute("href", "/docs");
  });
});
