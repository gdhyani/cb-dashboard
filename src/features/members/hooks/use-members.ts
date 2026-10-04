import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role } from "@/features/auth/types";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/members.api";
import { memberKeys } from "../api/members.keys";

export const useMembers = (orgId: string) =>
  useQuery({ queryKey: memberKeys.list(orgId), queryFn: () => api.listMembers(orgId) });
export const useInvites = (orgId: string, enabled = true) =>
  useQuery({ queryKey: memberKeys.invites(orgId), queryFn: () => api.listInvites(orgId), enabled });

export function useMemberMutations(orgId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["orgs", orgId] });
  return {
    updateRole: useMutation({
      mutationFn: ({ userId, role }: { userId: string; role: Role }) => api.updateRole(orgId, userId, role),
      onSuccess: () => {
        notifySuccess("Role updated");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    remove: useMutation({
      mutationFn: (userId: string) => api.removeMember(orgId, userId),
      onSuccess: () => {
        notifySuccess("Member removed; their access was revoked");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    createInvite: useMutation({
      mutationFn: (body: { role: Role; email?: string }) => api.createInvite(orgId, body),
      onSuccess: () => refresh(),
      onError: (e) => notifyError(e),
    }),
    revokeInvite: useMutation({
      mutationFn: (inviteId: string) => api.revokeInvite(orgId, inviteId),
      onSuccess: () => refresh(),
      onError: (e) => notifyError(e),
    }),
  };
}
