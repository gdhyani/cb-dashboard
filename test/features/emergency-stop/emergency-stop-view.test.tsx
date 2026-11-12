import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { EmergencyStopView } from "@/features/emergency-stop";
import { http } from "@/shared/api/http";
import { makeQueryClient } from "@/shared/api/query-client";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const stop = (id: string, extra: Partial<{ clearedAt: string | null; scope: string; targetLabel: string }> = {}) => ({
  id,
  scope: extra.scope ?? "user",
  targetId: "u1",
  targetLabel: extra.targetLabel ?? "Dana Developer",
  reason: "Laptop reported stolen",
  createdBy: "admin",
  createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
  clearedAt: extra.clearedAt ?? null,
});

let mock: MockAdapter;
const replyStops = (data: unknown[]) =>
  mock.onGet("/orgs/o1/killswitches").reply(200, { success: true, data, meta: { correlationId: "c" } });

beforeEach(() => {
  mock = new MockAdapter(http);
});
afterEach(() => mock.restore());

const renderView = () => {
  // Pickers inside the dialog (projects, members, devices) get empty lists.
  mock.onGet().reply(200, { success: true, data: [], meta: { correlationId: "c" } });
  return render(
    <QueryClientProvider client={makeQueryClient()}>
      <EmergencyStopView orgId="o1" />
    </QueryClientProvider>,
  );
};

describe("EmergencyStopView (J7)", () => {
  it("explains the effect and offers one stop control per scope", async () => {
    replyStops([]);
    renderView();
    expect(screen.getByRole("alert")).toHaveTextContent("A stop takes effect within seconds");
    expect(await screen.findByText("Nothing is stopped")).toBeInTheDocument();
    for (const target of ["a person", "a device", "a service", "an environment", "everyone"]) {
      expect(screen.getByRole("button", { name: `Stop access for ${target}` })).toBeInTheDocument();
    }
  });

  it("lists active stops in a table with a row menu, and restored ones under History", async () => {
    replyStops([stop("k1"), stop("k2", { clearedAt: new Date().toISOString(), targetLabel: "Old laptop" })]);
    renderView();
    const activeRow = (await screen.findByText("Dana Developer")).closest("tr") as HTMLElement;
    expect(within(activeRow).getByText("Person")).toBeInTheDocument();
    expect(within(activeRow).getByText("Laptop reported stolen")).toBeInTheDocument();
    expect(
      within(activeRow).getByRole("button", { name: "Actions for the stop on Dana Developer" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "History" })).toBeInTheDocument();
    const pastRow = screen.getByText("Old laptop").closest("tr") as HTMLElement;
    expect(within(pastRow).queryByRole("button")).not.toBeInTheDocument();
  });

  it("needs a typed reason before stopping access (FR-UI-002)", async () => {
    replyStops([]);
    mock.onPost("/orgs/o1/killswitches").reply(201, {
      success: true,
      data: stop("k9", { scope: "org", targetLabel: "Everyone" }),
      meta: { correlationId: "c" },
    });
    renderView();
    fireEvent.click(await screen.findByRole("button", { name: "Stop access for everyone" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("radio", { name: /Everyone/ })).toBeChecked();
    const confirm = within(dialog).getByRole("button", { name: "Stop access for everyone" });
    expect(confirm).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText("Reason"), { target: { value: "Leaked key" } });
    expect(confirm).toBeEnabled();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    fireEvent.click(confirm);
    await vi.waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({ scope: "org", reason: "Leaked key" });
  });
});
