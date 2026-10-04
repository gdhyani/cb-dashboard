/** FR-WH-003: a provider webhook kept 24 h, with one delivery per developer device that should get it. */
export interface WebhookDelivery {
  id: string;
  status: "pending" | "delivered" | "skipped" | "expired";
  attempts: number;
  appStatus: number | null;
  lastError: string | null;
  deliveredAt: string | null;
  deviceName: string;
  userEmail: string;
}

export interface WebhookEvent {
  id: string;
  eventId: string;
  type: string;
  provider: string;
  serviceId: string;
  serviceName: string;
  routing: "matched" | "unmatched";
  receivedAt: string;
  expiresAt: string;
  deliveries: WebhookDelivery[];
}
