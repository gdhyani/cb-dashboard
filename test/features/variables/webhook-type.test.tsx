import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Resource } from "@/features/resources";
import { AddVariableDialog } from "@/features/variables/components/add-variable-dialog";
import { buildCreateRequest, dialogTitle, TYPE_GROUPS } from "@/features/variables/lib/catalog";
import { chipLabel, typeOfResource } from "@/features/variables/lib/group";

const api = vi.hoisted(() => ({
  createService: vi.fn(),
  createVariable: vi.fn(),
  listVariables: vi.fn(),
  updateVariable: vi.fn(),
  deleteVariable: vi.fn(),
  previewAs: vi.fn(),
}));
vi.mock("@/features/variables/api/variables.api", () => api);

beforeEach(() => vi.clearAllMocks());

const resource = (config: Record<string, unknown>): Resource => ({
  id: "r1",
  environmentId: "e1",
  kind: "webhook",
  name: "STRIPE_WEBHOOK_SECRET",
  config,
  credentialsSet: true,
  rotatedAt: null,
  disabled: false,
  brokeredFields: ["secret"],
  createdAt: "",
  webhookUrl: "https://cb.example/api/hooks/r1",
});

describe("FR-WH-001 webhook signing secret type (D2, D5, §6a)", () => {
  it("is a Payments type titled by type, with Stripe and Razorpay providers", () => {
    expect(TYPE_GROUPS.find((g) => g.group === "Payments")?.ids).toContain("webhook");
    expect(dialogTitle("Add", "webhook")).toBe("Add webhook variable");
  });

  it("maps to one /services call: provider, the app path, an optional port and the write-only secret", () => {
    const req = buildCreateRequest({
      key: "STRIPE_WEBHOOK_SECRET",
      type: "webhook",
      provider: "stripe",
      value: "whsec_real",
      fields: { path: "/api/webhooks/stripe", port: "3060" },
      extras: [],
    });
    expect(req).toEqual({
      endpoint: "services",
      body: {
        key: "STRIPE_WEBHOOK_SECRET",
        test: true,
        extras: [],
        resource: {
          kind: "webhook",
          provider: "stripe",
          path: "/api/webhooks/stripe",
          port: 3060,
          signingSecret: "whsec_real",
        },
      },
    });
    const noPort = buildCreateRequest({
      key: "RZP_WH",
      type: "webhook",
      provider: "razorpay",
      value: "s3cret-abc",
      fields: { path: "/hooks/rzp" },
      extras: [],
    });
    expect((noPort.body.resource as Record<string, unknown>).port).toBeUndefined();
  });

  it("stored webhook services group under the type with their provider", () => {
    expect(typeOfResource(resource({ provider: "razorpay", path: "/x" }))).toEqual({
      type: "webhook",
      provider: "razorpay",
    });
    expect(chipLabel("webhook", "stripe")).toBe("Webhook · Stripe");
  });

  it("after Save & test the dialog shows the URL to paste into the provider, then closes on Done", async () => {
    api.createService.mockResolvedValue({
      service: resource({ provider: "stripe", path: "/api/webhooks/stripe" }),
      variables: [{ key: "STRIPE_WEBHOOK_SECRET" }],
      test: { ok: true, profile: "default", latencyMs: 1, message: "ok" },
    });
    const onOpenChange = vi.fn();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AddVariableDialog envId="e1" open onOpenChange={onOpenChange} initialType="webhook" />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "STRIPE_WEBHOOK_SECRET" } });
    fireEvent.change(screen.getByLabelText(/Signing secret/), { target: { value: "whsec_real" } });
    fireEvent.change(screen.getByLabelText(/Path in your app/), { target: { value: "/api/webhooks/stripe" } });
    fireEvent.click(screen.getByRole("button", { name: "Save & test" }));
    expect(await screen.findByText("https://cb.example/api/hooks/r1")).toBeInTheDocument();
    expect(screen.getByText(/Stripe Dashboard/)).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    // The real secret is gone from the screen once saved.
    expect(screen.queryByDisplayValue("whsec_real")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});

describe("review M6: the app port is checked in the form", () => {
  it("a port that is not 1–65535 shows an error and blocks Save", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AddVariableDialog envId="e1" open onOpenChange={() => {}} initialType="webhook" />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "STRIPE_WEBHOOK_SECRET" } });
    fireEvent.change(screen.getByLabelText(/Signing secret/), { target: { value: "whsec_real" } });
    fireEvent.change(screen.getByLabelText(/Path in your app/), { target: { value: "/hooks" } });
    fireEvent.click(screen.getByRole("button", { name: /Advanced/ }));
    fireEvent.change(screen.getByLabelText(/App port/), { target: { value: "70000" } });
    expect(screen.getByText(/port from 1 to 65535/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save & test" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/App port/), { target: { value: "3060" } });
    expect(screen.getByRole("button", { name: "Save & test" })).toBeEnabled();
  });
});
