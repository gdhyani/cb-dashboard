import type { Resource } from "@/features/resources";
import { apiGetPaginated, apiPatch, apiPost } from "@/shared/api/http";
import type { WebhookEvent } from "../types";

export const listWebhookEvents = (envId: string, page: number, pageSize = 20) =>
  apiGetPaginated<WebhookEvent>(`/environments/${envId}/webhook-events?page=${page}&pageSize=${pageSize}`);
export const replayWebhookEvent = (eventId: string) =>
  apiPost<{ queued: number }>(`/webhook-events/${eventId}/replay`, {});
/** An event nobody owns, to the caller's own signed-in machines. */
export const sendWebhookToMe = (eventId: string) =>
  apiPost<{ queued: number }>(`/webhook-events/${eventId}/send-to-me`, {});
/** cb creates (or points again) the Stripe webhook with the environment's Stripe key; the secret stays on cb. */
export const connectStripeWebhook = (resourceId: string) =>
  apiPost<Resource>(`/resources/${resourceId}/webhook/connect`, {});
/** Razorpay: a new cb-made signing secret, returned once. */
export const regenerateWebhookSecret = (resourceId: string) =>
  apiPatch<Resource & { generatedSecret?: string }>(`/resources/${resourceId}`, { regenerateSecret: true });
