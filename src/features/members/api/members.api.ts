import type { Role } from "@/features/auth/types";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/shared/api/http";
import type { CreatedInvite, Invite, Member } from "../types";

export const listMembers = (orgId: string) => apiGet<Member[]>(`/orgs/${orgId}/members`);
export const updateRole = (orgId: string, userId: string, role: Role) =>
  apiPatch<Member>(`/orgs/${orgId}/members/${userId}`, { role });
export const removeMember = (orgId: string, userId: string) =>
  apiDelete<{ removed: true }>(`/orgs/${orgId}/members/${userId}`);
export const listInvites = (orgId: string) => apiGet<Invite[]>(`/orgs/${orgId}/invites`);
export const createInvite = (orgId: string, body: { role: Role; email?: string }) =>
  apiPost<CreatedInvite>(`/orgs/${orgId}/invites`, body);
export const revokeInvite = (orgId: string, inviteId: string) =>
  apiDelete<{ revoked: true }>(`/orgs/${orgId}/invites/${inviteId}`);
