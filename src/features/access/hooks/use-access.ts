import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/access.api";
import { accessKeys } from "../api/access.keys";
import type { Grant } from "../types";

export const useAccessMatrix = (projectId: string, enabled = true) =>
  useQuery({
    queryKey: accessKeys.matrix(projectId),
    queryFn: () => api.getAccess(projectId),
    enabled,
    refetchInterval: 10_000,
  });

export function useAccessMutations(projectId: string) {
  const client = useQueryClient();
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: accessKeys.matrix(projectId) }),
      client.invalidateQueries({ queryKey: ["environments"] }),
    ]);
  return {
    grant: useMutation({
      mutationFn: ({ envId, userId, expiresAt }: { envId: string; userId: string; expiresAt?: string | null }) =>
        api.grantAccess(envId, { userId, expiresAt }),
      onSuccess: (g) => {
        notifySuccess(g.expiresAt ? "Time-limited access granted" : "Access granted");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    setProfiles: useMutation({
      mutationFn: ({ grantId, resourceProfiles }: { grantId: string; resourceProfiles: Grant["resourceProfiles"] }) =>
        api.updateGrantProfiles(grantId, resourceProfiles),
      onSuccess: () => {
        notifySuccess("Credential profiles updated. Live connections reconnect with them.");
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
