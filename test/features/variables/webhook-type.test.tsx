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
vi.mock("@/features/resources/api/resources.api", () => resources);

function renderDialog(type: "webhook", onOpenChange: (o: boolean) => void, provider?: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AddVariableDialog envId="e1" open onOpenChange={onOpenChange} initialType={type} initialProvider={provider} />
    </QueryClientProvider>,
  );
}

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

  it("maps to one /services call: provider, the app path and the write-only secret; never a port", () => {
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
        resource: { kind: "webhook", provider: "stripe", path: "/api/webhooks/stripe", signingSecret: "whsec_real" },
      },
    });
  });

  it("Stripe without a secret (Connect after saving) and Razorpay (cb makes it) send no signingSecret", () => {
    for (const provider of ["stripe", "razorpay"]) {
      const req = buildCreateRequest({
        key: "WH",
        type: "webhook",
        provider,
        value: "",
        fields: { path: "/hooks" },
        extras: [],
      });
      expect(req.body.resource).toEqual({ kind: "webhook", provider, path: "/hooks" });
    }
  });

  it("review: a secret typed for Stripe is never sent after switching to Razorpay (cb makes that one)", () => {
    const req = buildCreateRequest({
      key: "WH",
      type: "webhook",
      provider: "razorpay",
      value: "whsec_typed_for_stripe",
      fields: { path: "/hooks" },
      extras: [],
    });
    expect(req.body.resource).toEqual({ kind: "webhook", provider: "razorpay", path: "/hooks" });
  });

  it("Stripe thin events share the variable: their secret and path go in the same call, their own key as an extra", () => {
    const req = buildCreateRequest({
      key: "STRIPE_WEBHOOK_SECRET",
      type: "webhook",
      provider: "stripe",
      value: "",
      fields: { path: "/hooks", thinSigningSecret: "whsec_thin", thinPath: "/hooks/thin" },
      extras: [{ suggestedKey: "STRIPE_THIN_WEBHOOK_SECRET", key: "STRIPE_THIN_WEBHOOK_SECRET", on: true }],
    });
    expect(req.body.resource).toEqual({
      kind: "webhook",
      provider: "stripe",
      path: "/hooks",
      thinSigningSecret: "whsec_thin",
      thinPath: "/hooks/thin",
    });
    expect(req.body.extras).toEqual([{ key: "STRIPE_THIN_WEBHOOK_SECRET", field: "thinSecret" }]);
  });

  it("stored webhook services group under the type with their provider", () => {
    expect(typeOfResource(resource({ provider: "razorpay", path: "/x" }))).toEqual({
      type: "webhook",
      provider: "razorpay",
    });
    expect(chipLabel("webhook", "stripe")).toBe("Webhook · Stripe");
  });

  it("Stripe: saves without a secret, then offers Connect Stripe; the real secret never stays on screen", async () => {
    resources.listResources.mockResolvedValue([
      { ...resource({ provider: "stripe" }), id: "k1", kind: "http", name: "STRIPE_SECRET_KEY", webhookUrl: undefined },
    ]);
    api.createService.mockResolvedValue({
      service: resource({
        provider: "stripe",
        path: "/api/webhooks/stripe",
        secretsSet: { snapshot: false, thin: false },
      }),
      variables: [{ key: "STRIPE_WEBHOOK_SECRET" }],
      test: null,
    });
    const onOpenChange = vi.fn();
    renderDialog("webhook", onOpenChange);
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "STRIPE_WEBHOOK_SECRET" } });
    fireEvent.change(screen.getByLabelText(/Path in your app/), { target: { value: "/api/webhooks/stripe" } });
    const save = screen.getByRole("button", { name: "Save & test" });
    expect(save).toBeEnabled();
    fireEvent.click(save);
    expect(await screen.findByRole("button", { name: "Connect Stripe" })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("Razorpay: asks for no secret, then shows the URL and the secret cb made, once", async () => {
    resources.listResources.mockResolvedValue([]);
    api.createService.mockResolvedValue({
      service: {
        ...resource({ provider: "razorpay", path: "/hooks/rzp", secretsSet: { snapshot: true, thin: false } }),
        generatedSecret: "made_by_cb_abcdefghijklmnopqrstuvwxyz0123",
      },
      variables: [{ key: "RAZORPAY_WEBHOOK_SECRET" }],
      test: null,
    });
    renderDialog("webhook", vi.fn(), "razorpay");
    expect(screen.queryByLabelText(/Signing secret/)).toBeNull();
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "RAZORPAY_WEBHOOK_SECRET" } });
    fireEvent.change(screen.getByLabelText(/Path in your app/), { target: { value: "/hooks/rzp" } });
    fireEvent.click(screen.getByRole("button", { name: "Save & test" }));
    expect(await screen.findByText("made_by_cb_abcdefghijklmnopqrstuvwxyz0123")).toBeInTheDocument();
    expect(screen.getByText("https://cb.example/api/hooks/r1")).toBeInTheDocument();
  });

  it("asks for no app port: cb detects the port the app listens on", () => {
    renderDialog("webhook", vi.fn());
    fireEvent.click(screen.getByRole("button", { name: /Advanced/ }));
    expect(screen.queryByLabelText(/App port/)).toBeNull();
    expect(screen.getByLabelText(/Thin events signing secret/)).toBeInTheDocument();
  });
});
