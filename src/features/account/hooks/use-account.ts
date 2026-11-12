import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/account.api";
import { accountKeys } from "../api/account.keys";

/** The signed-in user's dashboard sessions. `enabled` is false for developers: the backend lists sessions to admins only. */
export function useMySessions(orgId: string, userId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.sessions(orgId),
    queryFn: () => api.listOrgSessions(orgId),
    enabled: enabled && Boolean(userId),
    select: (sessions) => sessions.filter((s) => s.user.id === userId),
  });
}

export function useRevokeMySession(orgId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.revokeSession,
    onSuccess: () => {
      notifySuccess("Session signed out");
      return client.invalidateQueries({ queryKey: accountKeys.sessions(orgId) });
    },
    onError: (e) => notifyError(e),
  });
}

export const useMyDevices = () => useQuery({ queryKey: accountKeys.devices, queryFn: api.listMyDevices });

export function useRevokeMyDevice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.revokeDevice,
    onSuccess: () => {
      notifySuccess("Device revoked");
      return Promise.all([
        client.invalidateQueries({ queryKey: ["me"] }),
        client.invalidateQueries({ queryKey: ["orgs"] }),
      ]);
    },
    onError: (e) => notifyError(e),
  });
}
