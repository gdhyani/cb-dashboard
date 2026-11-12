import { apiDelete, apiGet } from "@/shared/api/http";
import type { AccountDevice, AccountSession } from "../types";

/** Admins only on the backend: every member's sessions; the account page keeps the signed-in user's. */
export const listOrgSessions = (orgId: string) => apiGet<AccountSession[]>(`/orgs/${orgId}/sessions`);
export const revokeSession = (sessionId: string) => apiDelete<{ revoked: true }>(`/sessions/${sessionId}`);
export const listMyDevices = () => apiGet<AccountDevice[]>("/me/devices");
export const revokeDevice = (deviceId: string) => apiDelete<{ revoked: true }>(`/devices/${deviceId}`);

/** What deleting the account would do (FR-ACC-003): orgs where you are the only owner are deleted with it. */
export interface DeletionPreview {
  email: string;
  orgsDeleted: { id: string; name: string; memberCount: number }[];
  orgsLeft: { id: string; name: string; role: "owner" | "admin" | "developer" }[];
}
export const getDeletionPreview = () => apiGet<DeletionPreview>("/auth/me/deletion");
/** FR-ACC-001: needs the account password and the email typed again. */
export const deleteAccount = (body: { password: string; confirm: string }) =>
  apiDelete<{ deleted: true }>("/auth/me", { data: body });
/** FR-ACC-002: owners only; needs the password and the organization name typed again. */
export const deleteOrganization = (orgId: string, body: { password: string; confirm: string }) =>
  apiDelete<{ deleted: true }>(`/orgs/${orgId}`, { data: body });
/** FR-ACC-004: leave = remove your own membership (the backend refuses the last owner). */
export const leaveOrganization = (orgId: string, userId: string) =>
  apiDelete<{ removed: true }>(`/orgs/${orgId}/members/${userId}`);
