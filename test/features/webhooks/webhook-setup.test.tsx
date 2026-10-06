import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Resource } from "@/features/resources";
import { WebhookSetup } from "@/features/webhooks";

const hooks = vi.hoisted(() => ({
  listWebhookEvents: vi.fn(),
  replayWebhookEvent: vi.fn(),
  sendWebhookToMe: vi.fn(),
  connectStripeWebhook: vi.fn(),
  regenerateWebhookSecret: vi.fn(),
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
vi.mock("@/features/webhooks/api/webhooks.api", () => hooks);
vi.mock("@/features/resources/api/resources.api", () => resources);

const URL_ = "https://cb.example/api/hooks/r1";
const webhook = (config: Record<string, unknown>, o: Partial<Resource> = {}): Resource => ({
  id: "r1",
  environmentId: "e1",
  kind: "webhook",
  name: "STRIPE_WEBHOOK_SECRET",
  config: { provider: "stripe", path: "/api/webhooks/stripe", ...config },
  credentialsSet: true,
  rotatedAt: null,
  disabled: false,
  brokeredFields: ["secret", "thinSecret"],
  createdAt: "",
  webhookUrl: URL_,
  ...o,
});
const stripeKey: Resource = {
  ...webhook({}),
  id: "k1",
  kind: "http",
  name: "STRIPE_SECRET_KEY",
  config: { provider: "stripe" },
  webhookUrl: undefined,
};

function renderSetup(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => vi.clearAllMocks());

describe("FR-WH-001 Stripe: Connect instead of copying a URL and a secret", () => {
  it("offers Connect Stripe (and doing it by hand) when there is a Stripe key and no secret yet", async () => {
    resources.listResources.mockResolvedValue([stripeKey]);
    renderSetup(<WebhookSetup envId="e1" resource={webhook({ secretsSet: { snapshot: false, thin: false } })} />);
    expect(await screen.findByRole("button", { name: "Connect Stripe" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Set it up yourself/ })).toBeInTheDocument();
  });

  it("Connect switches the panel to Connected", async () => {
    resources.listResources.mockResolvedValue([stripeKey]);
    hooks.connectStripeWebhook.mockResolvedValue(
      webhook({ stripeEndpointId: "we_1", connectedUrl: URL_, secretsSet: { snapshot: true, thin: false } }),
    );
    renderSetup(<WebhookSetup envId="e1" resource={webhook({ secretsSet: { snapshot: false, thin: false } })} />);
    const connect = await screen.findByRole("button", { name: "Connect Stripe" });
    fireEvent.click(connect);
    await waitFor(() => expect(hooks.connectStripeWebhook).toHaveBeenCalledWith("r1"));
    // The panel follows the answer at once (review: it used to keep offering Connect).
    expect(await screen.findByText(/Connected to Stripe/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect Stripe" })).toBeNull();
  });

  it("without a Stripe key it shows the URL to paste and says how Connect becomes available", async () => {
    resources.listResources.mockResolvedValue([]);
    renderSetup(<WebhookSetup envId="e1" resource={webhook({ secretsSet: { snapshot: false, thin: false } })} />);
    expect(await screen.findByText(URL_)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect Stripe" })).toBeNull();
    expect(await screen.findByText(/Add your Stripe secret key/)).toBeInTheDocument();
  });

  it("shows Connected when Stripe sends to the current address", async () => {
    resources.listResources.mockResolvedValue([stripeKey]);
    renderSetup(
      <WebhookSetup
        envId="e1"
        resource={webhook({
          stripeEndpointId: "we_1",
          connectedUrl: URL_,
          secretsSet: { snapshot: true, thin: false },
        })}
      />,
    );
    expect(await screen.findByText(/Connected to Stripe/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect Stripe" })).toBeNull();
  });

  it("warns and offers Reconnect when the cb address changed since connecting", async () => {
    resources.listResources.mockResolvedValue([stripeKey]);
    hooks.connectStripeWebhook.mockResolvedValue(webhook({ stripeEndpointId: "we_1", connectedUrl: URL_ }));
    renderSetup(
      <WebhookSetup
        envId="e1"
        resource={webhook({
          stripeEndpointId: "we_1",
          connectedUrl: "https://old-tunnel.example/api/hooks/r1",
          secretsSet: { snapshot: true, thin: false },
        })}
      />,
    );
    expect(await screen.findByText(/old address/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reconnect" }));
    await waitFor(() => expect(hooks.connectStripeWebhook).toHaveBeenCalledWith("r1"));
  });

  it("does not offer Connect when Stripe can't reach the cb address", async () => {
    resources.listResources.mockResolvedValue([stripeKey]);
    renderSetup(
      <WebhookSetup
        envId="e1"
        resource={webhook(
          { secretsSet: { snapshot: false, thin: false } },
          { webhookUrl: "http://localhost:4200/api/hooks/r1" },
        )}
      />,
    );
    expect(await screen.findByText(/can't reach this address/)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Connect Stripe" })).toBeDisabled();
  });
});

describe("FR-WH-001 Razorpay: cb makes the secret; URL and secret are pasted once", () => {
  it("shows the generated secret right after saving, with a copy button", async () => {
    resources.listResources.mockResolvedValue([]);
    renderSetup(
      <WebhookSetup
        envId="e1"
        resource={webhook({ provider: "razorpay", secretsSet: { snapshot: true, thin: false } }, { name: "RZP" })}
        generatedSecret="gen_SECRET_abcdefghijklmnopqrstuvwxyz012345"
      />,
    );
    expect(await screen.findByText("gen_SECRET_abcdefghijklmnopqrstuvwxyz012345")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy signing secret" })).toBeInTheDocument();
    expect(screen.getByText(/shown only now/i)).toBeInTheDocument();
  });

  it("later, New secret makes a fresh one and shows it once", async () => {
    resources.listResources.mockResolvedValue([]);
    hooks.regenerateWebhookSecret.mockResolvedValue({
      ...webhook({ provider: "razorpay" }),
      generatedSecret: "fresh_SECRET_abcdefghijklmnopqrstuvwxyz0123",
    });
    renderSetup(
      <WebhookSetup
        envId="e1"
        resource={webhook({ provider: "razorpay", secretsSet: { snapshot: true, thin: false } })}
      />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "New secret" }));
    expect(await screen.findByText("fresh_SECRET_abcdefghijklmnopqrstuvwxyz0123")).toBeInTheDocument();
    expect(hooks.regenerateWebhookSecret).toHaveBeenCalledWith("r1");
  });
});

describe("FR-WH-001 services saved before this change", () => {
  it("a Stripe webhook without secretsSet had a pasted secret: shows its URL, not a missing-secret hint", async () => {
    resources.listResources.mockResolvedValue([]);
    renderSetup(<WebhookSetup envId="e1" resource={webhook({})} />);
    expect(await screen.findByText(URL_)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText(/Add your Stripe secret key/)).toBeNull();
  });
});
