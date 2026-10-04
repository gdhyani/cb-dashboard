import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebhookEvents } from "@/features/webhooks";

const api = vi.hoisted(() => ({ listWebhookEvents: vi.fn(), replayWebhookEvent: vi.fn() }));
vi.mock("@/features/webhooks/api/webhooks.api", () => api);

const page = (items: unknown[]) => ({
  items,
  pagination: { page: 1, pageSize: 20, total: items.length, totalPages: 1, hasNext: false, hasPrev: false },
});

function renderList() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WebhookEvents envId="e1" />
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe("FR-WH-003 webhook deliveries in the dashboard", () => {
  it("lists each event with who it went to and how it went; never bodies", async () => {
    api.listWebhookEvents.mockResolvedValue(
      page([
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
          deliveries: [
            {
              id: "d1",
              status: "delivered",
              attempts: 0,
              appStatus: 200,
              lastError: null,
              deliveredAt: new Date().toISOString(),
              deviceName: "bob-laptop",
              userEmail: "bob@example.com",
            },
          ],
        },
        {
          id: "w2",
          eventId: "evt_2",
          type: "charge.refunded",
          provider: "stripe",
          serviceId: "r1",
          serviceName: "STRIPE_WEBHOOK_SECRET",
          routing: "unmatched",
          receivedAt: new Date(Date.now() - 60_000).toISOString(),
          expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          deliveries: [],
        },
      ]),
    );
    renderList();
    expect(await screen.findByText("payment_intent.succeeded")).toBeInTheDocument();
    expect(screen.getByText(/bob@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Delivered · 200/)).toBeInTheDocument();
    expect(screen.getByText(/No one on the team caused this/)).toBeInTheDocument();
  });

  it("Replay re-queues the event", async () => {
    api.listWebhookEvents.mockResolvedValue(
      page([
        {
          id: "w3",
          eventId: "evt_3",
          type: "payment.captured",
          provider: "razorpay",
          serviceId: "r2",
          serviceName: "RAZORPAY_WEBHOOK_SECRET",
          routing: "matched",
          receivedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          deliveries: [
            {
              id: "d3",
              status: "pending",
              attempts: 2,
              appStatus: 500,
              lastError: "app answered 500",
              deliveredAt: null,
              deviceName: "cara-laptop",
              userEmail: "cara@example.com",
            },
          ],
        },
      ]),
    );
    api.replayWebhookEvent.mockResolvedValue({ queued: 1 });
    renderList();
    expect(await screen.findByText(/app answered 500/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Replay payment.captured" }));
    await waitFor(() => expect(api.replayWebhookEvent).toHaveBeenCalledWith("w3"));
  });

  it("an empty list explains how webhooks get here", async () => {
    api.listWebhookEvents.mockResolvedValue(page([]));
    renderList();
    expect(await screen.findByText("No webhooks yet")).toBeInTheDocument();
  });
});

describe("review M7: just-arrived events are not called unclaimed yet", () => {
  it("says cb is still finding who caused it during the first seconds", async () => {
    api.listWebhookEvents.mockResolvedValue(
      page([
        {
          id: "w9",
          eventId: "evt_9",
          type: "checkout.session.completed",
          provider: "stripe",
          serviceId: "r1",
          serviceName: "STRIPE_WEBHOOK_SECRET",
          routing: "unmatched",
          receivedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          deliveries: [],
        },
      ]),
    );
    renderList();
    expect(await screen.findByText(/Finding the developer who caused it/)).toBeInTheDocument();
    expect(screen.queryByText(/No one on the team caused this/)).toBeNull();
  });
});
