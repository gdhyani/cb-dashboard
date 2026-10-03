import { apiDelete, apiGet, apiPost } from "@/shared/api/http";
import type { AccessMatrix, Grant } from "../types";

export const getAccess = (projectId: string) => apiGet<AccessMatrix>(`/projects/${projectId}/access`);
export const grantAccess = (envId: string, body: { userId: string; expiresAt?: string | null }) =>
  apiPost<Grant>(`/environments/${envId}/grants`, body);
export const revokeGrant = (grantId: string) => apiDelete<{ revoked: true }>(`/grants/${grantId}`);
