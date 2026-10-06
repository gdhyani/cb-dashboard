import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Resource } from "@/features/resources";
import { WebhookEndpoint, WebhooksTab } from "@/features/webhooks";
import { providerCanReach } from "@/features/webhooks/lib/endpoint";

const hooks = vi.hoisted(() => ({ listWebhookEvents: vi.fn(), replayWebhookEvent: vi.fn() }));
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

const webhook = (o: Partial<Resource>): Resource => ({
  id: "r1",
  environmentId: "e1",
  kind: "webhook",
  name: "STRIPE_WEBHOOK_SECRET",
  config: { provider: "stripe", path: "/api/webhooks/stripe" },
  credentialsSet: true,
  rotatedAt: null,
  disabled: false,
  brokeredFields: ["secret"],
  createdAt: "",
  webhookUrl: "https://cb.example/api/hooks/r1",
  ...o,
});
const empty = {
  items: [],
  pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
};

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => vi.clearAllMocks());

describe("FR-WH-001 the webhook URL can always be found again", () => {
  it("knows which URLs a provider can't reach (localhost, loopback, private networks)", () => {
    expect(providerCanReach("https://cb.example/api/hooks/r1")).toBe(true);
    expect(providerCanReach("https://abc.trycloudflare.com/api/hooks/r1")).toBe(true);
    for (const u of [
      "http://localhost:4200/api/hooks/r1",
      "http://127.0.0.1:4200/api/hooks/r1",
      "http://10.0.0.5/api/hooks/r1",
      "http://192.168.1.4/api/hooks/r1",
      "http://172.20.0.2/api/hooks/r1",
      "http://my-mac.local/api/hooks/r1",
      "http://[::1]:4200/api/hooks/r1",
      "not a url",
    ])
      expect(providerCanReach(u)).toBe(false);
  });

  it("shows the URL as text with a copy button and the provider's setup steps", () => {
    render(<WebhookEndpoint url="https://cb.example/api/hooks/r1" provider="razorpay" />);
    expect(screen.getByText("https://cb.example/api/hooks/r1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy webhook URL" })).toBeInTheDocument();
    expect(screen.getByText(/Razorpay Dashboard/)).toBeInTheDocument();
    expect(screen.queryByText(/can't reach/)).toBeNull();
  });

  it("warns when Stripe or Razorpay can't reach the URL (PUBLIC_URL unset or local)", () => {
    render(<WebhookEndpoint url="http://localhost:4200/api/hooks/r1" provider="stripe" />);
    expect(screen.getByText(/Stripe can't reach this address/)).toBeInTheDocument();
  });

  it("the Webhooks tab lists every webhook service's URL, even before any event arrives", async () => {
    hooks.listWebhookEvents.mockResolvedValue(empty);
    resources.listResources.mockResolvedValue([
      webhook({}),
      webhook({
        id: "r2",
        name: "RAZORPAY_WEBHOOK_SECRET",
        config: { provider: "razorpay", path: "/hooks/rzp" },
        webhookUrl: "https://cb.example/api/hooks/r2",
      }),
      { ...webhook({ id: "r3", kind: "mongodb", name: "MONGODB_URI" }), webhookUrl: undefined },
    ]);
    renderWithClient(<WebhooksTab envId="e1" />);
    expect(await screen.findByText("https://cb.example/api/hooks/r1")).toBeInTheDocument();
    expect(screen.getByText("https://cb.example/api/hooks/r2")).toBeInTheDocument();
    expect(screen.getByText("STRIPE_WEBHOOK_SECRET")).toBeInTheDocument();
    expect(screen.getByText(/\/hooks\/rzp/)).toBeInTheDocument();
    expect(screen.queryByText("MONGODB_URI")).toBeNull();
  });
});

describe("FR-WH-003 the Webhooks tab shows setup; the delivery log is one click away", () => {
  it("does not load or show deliveries until Delivery log is opened", async () => {
    resources.listResources.mockResolvedValue([webhook({})]);
    hooks.listWebhookEvents.mockResolvedValue({
      ...empty,
      items: [
        {
          id: "w1",
          eventId: "evt_1",
          type: "payment_intent.succeeded",
          provider: "stripe",
          serviceId: "r1",
          serviceName: "STRIPE_WEBHOOK_SECRET",
          routing: "matched",
          receivedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          deliveries: [],
        },
      ],
    });
    renderWithClient(<WebhooksTab envId="e1" />);
    expect(await screen.findByText("https://cb.example/api/hooks/r1")).toBeInTheDocument();
    expect(screen.queryByText("payment_intent.succeeded")).toBeNull();
    expect(hooks.listWebhookEvents).not.toHaveBeenCalled();
    const toggle = screen.getByRole("button", { name: /Delivery log/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("payment_intent.succeeded")).toBeInTheDocument();
  });

  it("with no webhook services it explains how to add one, and has no log button", async () => {
    resources.listResources.mockResolvedValue([]);
    renderWithClient(<WebhooksTab envId="e1" />);
    expect(await screen.findByText("No webhooks yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delivery log/ })).toBeNull();
  });
});
