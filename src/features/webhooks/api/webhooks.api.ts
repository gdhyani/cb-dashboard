import { apiGetPaginated, apiPost } from "@/shared/api/http";
import type { WebhookEvent } from "../types";

export const listWebhookEvents = (envId: string, page: number, pageSize = 20) =>
  apiGetPaginated<WebhookEvent>(`/environments/${envId}/webhook-events?page=${page}&pageSize=${pageSize}`);
export const replayWebhookEvent = (eventId: string) =>
  apiPost<{ queued: number }>(`/webhook-events/${eventId}/replay`, {});
