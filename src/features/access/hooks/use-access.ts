import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/access.api";
import { accessKeys } from "../api/access.keys";
import type { ProjectAccessInput } from "../types";

export const useAccessMatrix = (projectId: string, enabled = true) =>
  useQuery({
    queryKey: accessKeys.matrix(projectId),
    queryFn: () => api.getAccess(projectId),
    enabled: enabled && Boolean(projectId),
    refetchInterval: 10_000,
  });

export const useMemberAccess = (orgId: string, userId: string | undefined) =>
  useQuery({
    queryKey: accessKeys.member(orgId, userId ?? ""),
    queryFn: () => api.getMemberAccess(orgId, userId ?? ""),
    enabled: Boolean(userId),
  });

export function useAccessMutations(projectId: string) {
  const client = useQueryClient();
  // Access changes ripple into environment "has access" flags, member panels and stats.
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: accessKeys.matrix(projectId) }),
      client.invalidateQueries({ queryKey: ["environments"] }),
      client.invalidateQueries({ queryKey: ["orgs"] }),
      client.invalidateQueries({ queryKey: ["projects"] }),
    ]);
  return {
    setAccess: useMutation({
      mutationFn: ({ userId, body }: { userId: string; body: ProjectAccessInput }) =>
        api.setProjectAccess(projectId, userId, body),
      onSuccess: refresh,
      onError: (e) => notifyError(e),
    }),
    removeAccess: useMutation({
      mutationFn: (userId: string) => api.removeProjectAccess(projectId, userId),
      onSuccess: () => {
        notifySuccess("Access removed. Active connections were terminated.");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    revoke: useMutation({
      mutationFn: (grantId: string) => api.revokeGrant(grantId),
      onSuccess: () => {
        notifySuccess("Access revoked. Active connections were terminated.");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
  };
}
