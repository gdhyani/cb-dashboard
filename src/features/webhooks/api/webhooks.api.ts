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
/** cb creates (or points again) the provider's webhook with the stored key; secrets stay on cb. */
export const connectWebhook = (resourceId: string, payloads?: StripePayload[]) =>
  apiPost<Resource>(`/resources/${resourceId}/webhook/connect`, payloads ? { payloads } : {});
/** Stripe: which payloads the app's webhook code reads. */
export type StripePayload = "full" | "thin";
/** Razorpay: a new cb-made signing secret, returned once. */
export const regenerateWebhookSecret = (resourceId: string) =>
  apiPatch<Resource & { generatedSecret?: string }>(`/resources/${resourceId}`, { regenerateSecret: true });
