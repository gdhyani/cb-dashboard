import { apiDelete, apiGet } from "@/shared/api/http";
import type { AccountDevice, AccountSession } from "../types";

/** Admins only on the backend: every member's sessions; the account page keeps the signed-in user's. */
export const listOrgSessions = (orgId: string) => apiGet<AccountSession[]>(`/orgs/${orgId}/sessions`);
export const revokeSession = (sessionId: string) => apiDelete<{ revoked: true }>(`/sessions/${sessionId}`);
export const listMyDevices = () => apiGet<AccountDevice[]>("/me/devices");
export const revokeDevice = (deviceId: string) => apiDelete<{ revoked: true }>(`/devices/${deviceId}`);
