import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Resource } from "@/features/resources";
import { WebhookSetup } from "@/features/webhooks";
import { RAZORPAY_WEBHOOKS_LINK, stripeDashboardLink } from "@/features/webhooks/components/webhook-setup";

const hooks = vi.hoisted(() => ({
  listWebhookEvents: vi.fn(),
  replayWebhookEvent: vi.fn(),
  sendWebhookToMe: vi.fn(),
  connectWebhook: vi.fn(),
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
const THIN = Array.from({ length: 12 }, (_, i) => `v1.event_${i}`);
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
const key = (provider: string): Resource => ({
  ...webhook({}),
  id: `k-${provider}`,
  kind: "http",
  name: `${provider.toUpperCase()}_KEY`,
  config: { provider },
  webhookUrl: undefined,
});
const fresh = { secretsSet: { snapshot: false, thin: false } };
const connectedBoth = {
  stripeEndpointId: "we_1",
  stripeThinDestinationId: "ed_test_1",
  connectedPayloads: ["full", "thin"],
  thinEvents: THIN,
  connectedUrl: URL_,
  livemode: false,
  secretsSet: { snapshot: true, thin: true },
};

function renderSetup(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => vi.clearAllMocks());

describe("FR-WH-001 Stripe: one question (full, thin or both), then Connect", () => {
  it("defaults to full events (every event) and connects with that", async () => {
    resources.listResources.mockResolvedValue([key("stripe")]);
    hooks.connectWebhook.mockResolvedValue(
      webhook({ ...connectedBoth, stripeThinDestinationId: undefined, connectedPayloads: ["full"] }),
    );
    renderSetup(<WebhookSetup envId="e1" resource={webhook(fresh)} />);
    const connect = await screen.findByRole("button", { name: "Connect Stripe" });
    expect(screen.getByRole("radio", { name: /Full events/ })).toBeChecked();
    expect(screen.getByText(/every Stripe event/)).toBeInTheDocument();
    fireEvent.click(connect);
    await waitFor(() => expect(hooks.connectWebhook).toHaveBeenCalledWith("r1", ["full"]));
    expect(await screen.findByText("Full events")).toBeInTheDocument();
    expect(screen.getByText(/all events, including ones Stripe adds later/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect Stripe" })).toBeNull();
  });

  it("thin or both send the matching payloads", async () => {
    resources.listResources.mockResolvedValue([key("stripe")]);
    hooks.connectWebhook.mockResolvedValue(webhook(connectedBoth));
    renderSetup(<WebhookSetup envId="e1" resource={webhook(fresh)} />);
    await screen.findByRole("button", { name: "Connect Stripe" });
    fireEvent.click(screen.getByRole("radio", { name: /Both/ }));
    expect(screen.getByText(/12 payment, checkout, subscription and invoice events/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Connect Stripe" }));
    await waitFor(() => expect(hooks.connectWebhook).toHaveBeenCalledWith("r1", ["full", "thin"]));
  });

  it("connected: shows what each destination receives and links to change it in Stripe (test mode)", async () => {
    resources.listResources.mockResolvedValue([key("stripe")]);
    renderSetup(<WebhookSetup envId="e1" resource={webhook(connectedBoth)} />);
    expect(await screen.findByText("Thin events")).toBeInTheDocument();
    expect(screen.getByText("12 events")).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: /Open in Stripe/ });
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "https://dashboard.stripe.com/test/workbench/webhooks/we_1",
      "https://dashboard.stripe.com/test/workbench/webhooks/ed_test_1",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Show events" }));
    expect(screen.getByText(THIN.join(", "))).toBeInTheDocument();
    expect(stripeDashboardLink("we_9", true)).toBe("https://dashboard.stripe.com/workbench/webhooks/we_9");
  });

  it("connected: changing what the app receives applies it in Stripe", async () => {
    resources.listResources.mockResolvedValue([key("stripe")]);
    hooks.connectWebhook.mockResolvedValue(webhook(connectedBoth));
    renderSetup(<WebhookSetup envId="e1" resource={webhook(connectedBoth)} />);
    fireEvent.click(await screen.findByRole("button", { name: /Change what your app receives/ }));
    const apply = screen.getByRole("button", { name: "Apply in Stripe" });
    expect(apply).toBeDisabled(); // nothing changed yet
    fireEvent.click(screen.getByRole("radio", { name: /Thin events/ }));
    fireEvent.click(apply);
    await waitFor(() => expect(hooks.connectWebhook).toHaveBeenCalledWith("r1", ["thin"]));
  });

  it("warns and offers Reconnect when the cb address changed since connecting", async () => {
    resources.listResources.mockResolvedValue([key("stripe")]);
    hooks.connectWebhook.mockResolvedValue(webhook(connectedBoth));
    renderSetup(
      <WebhookSetup
        envId="e1"
        resource={webhook({ ...connectedBoth, connectedUrl: "https://old.example/api/hooks/r1" })}
      />,
    );
    expect(await screen.findByText(/old address/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reconnect" }));
    await waitFor(() => expect(hooks.connectWebhook).toHaveBeenCalledWith("r1", ["full", "thin"]));
  });

  it("without a Stripe key: the URL to paste and how Connect becomes available", async () => {
    resources.listResources.mockResolvedValue([]);
    renderSetup(<WebhookSetup envId="e1" resource={webhook(fresh)} />);
    expect(await screen.findByText(URL_)).toBeInTheDocument();
    expect(await screen.findByText(/Add your Stripe secret key/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Connect Stripe" })).toBeNull();
  });

  it("does not offer Connect when Stripe can't reach the cb address", async () => {
    resources.listResources.mockResolvedValue([key("stripe")]);
    renderSetup(
      <WebhookSetup envId="e1" resource={webhook(fresh, { webhookUrl: "http://localhost:4200/api/hooks/r1" })} />,
    );
    expect(await screen.findByRole("button", { name: "Connect Stripe" })).toBeDisabled();
    expect(screen.getByText(/can't reach this address/)).toBeInTheDocument();
  });

  it("a webhook saved before secretsSet existed had a pasted secret: its URL, no missing-secret hint", async () => {
    resources.listResources.mockResolvedValue([]);
    renderSetup(<WebhookSetup envId="e1" resource={webhook({})} />);
    expect(await screen.findByText(URL_)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByText(/Add your Stripe secret key/)).toBeNull();
  });
});

describe("FR-WH-001 Razorpay: Connect when a Razorpay key is saved, else URL + cb-made secret", () => {
  const SECRET = "gen_SECRET_abcdefghijklmnopqrstuvwxyz012345";
  const rzp = (config: Record<string, unknown>) =>
    webhook({ provider: "razorpay", path: "/hooks/rzp", ...config }, { name: "RAZORPAY_WEBHOOK_SECRET" });

  it("with a Razorpay key: Connect Razorpay; afterwards the events and a link to change them", async () => {
    resources.listResources.mockResolvedValue([key("razorpay")]);
    hooks.connectWebhook.mockResolvedValue(
      rzp({ razorpayWebhookId: "TkAbc123", razorpayEvents: ["payment.captured", "order.paid"], connectedUrl: URL_ }),
    );
    renderSetup(<WebhookSetup envId="e1" resource={rzp({ secretOrigin: "generated" })} generatedSecret={SECRET} />);
    // The secret cb made stays behind "Set it up yourself" when Connect can do it.
    expect(await screen.findByRole("button", { name: "Connect Razorpay" })).toBeInTheDocument();
    expect(screen.queryByText(SECRET)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Connect Razorpay" }));
    await waitFor(() => expect(hooks.connectWebhook).toHaveBeenCalledWith("r1", undefined));
    expect(await screen.findByText(/Connected to Razorpay/)).toBeInTheDocument();
    expect(screen.getByText("2 events")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open in Razorpay/ })).toHaveAttribute("href", RAZORPAY_WEBHOOKS_LINK);
  });

  it("the manual route stays: URL and the cb-made secret behind Set it up yourself", async () => {
    resources.listResources.mockResolvedValue([key("razorpay")]);
    renderSetup(<WebhookSetup envId="e1" resource={rzp({ secretOrigin: "generated" })} generatedSecret={SECRET} />);
    fireEvent.click(await screen.findByRole("button", { name: /Set it up yourself/ }));
    expect(screen.getByText(SECRET)).toBeInTheDocument();
    expect(screen.getByText(URL_)).toBeInTheDocument();
  });

  it("without a Razorpay key: URL + secret shown at once, and how Connect becomes available", async () => {
    resources.listResources.mockResolvedValue([]);
    renderSetup(<WebhookSetup envId="e1" resource={rzp({ secretOrigin: "generated" })} generatedSecret={SECRET} />);
    expect(await screen.findByText(SECRET)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy signing secret" })).toBeInTheDocument();
    expect(await screen.findByText(/Add your Razorpay key/)).toBeInTheDocument();
  });

  it("New secret only for a secret cb made, never for one the admin typed", async () => {
    resources.listResources.mockResolvedValue([]);
    hooks.regenerateWebhookSecret.mockResolvedValue({
      ...rzp({}),
      generatedSecret: "fresh_SECRET_abcdefghijklmnopqrstuvwxyz0123",
    });
    const { unmount } = renderSetup(<WebhookSetup envId="e1" resource={rzp({ secretOrigin: "typed" })} />);
    expect(await screen.findByText(URL_)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New secret" })).toBeNull();
    unmount();
    renderSetup(<WebhookSetup envId="e1" resource={rzp({ secretOrigin: "generated" })} />);
    fireEvent.click(await screen.findByRole("button", { name: "New secret" }));
    expect(await screen.findByText("fresh_SECRET_abcdefghijklmnopqrstuvwxyz0123")).toBeInTheDocument();
  });
});
