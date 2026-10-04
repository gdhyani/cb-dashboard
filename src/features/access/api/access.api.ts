import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/shared/api/http";
import type { AccessMatrix, Grant, MemberAccess, ProjectAccessInput } from "../types";

export const getAccess = (projectId: string) => apiGet<AccessMatrix>(`/projects/${projectId}/access`);
export const grantAccess = (envId: string, body: { userId: string; expiresAt?: string | null }) =>
  apiPost<Grant>(`/environments/${envId}/grants`, body);
export const revokeGrant = (grantId: string) => apiDelete<{ revoked: true }>(`/grants/${grantId}`);
export const updateGrant = (
  grantId: string,
  body: { resourceProfiles?: Grant["resourceProfiles"]; expiresAt?: string | null },
) => apiPatch<Grant>(`/grants/${grantId}`, body);

/** Sets a person's access to the project exactly (project-wide or listed environments). */
export const setProjectAccess = (projectId: string, userId: string, body: ProjectAccessInput) =>
  apiPut<Grant[]>(`/projects/${projectId}/access/${userId}`, body);
export const removeProjectAccess = (projectId: string, userId: string) =>
  apiDelete<{ revoked: number }>(`/projects/${projectId}/access/${userId}`);

export const getMemberAccess = (orgId: string, userId: string) =>
  apiGet<MemberAccess>(`/orgs/${orgId}/members/${userId}/access`);
