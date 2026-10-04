import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/devices.api";
import { deviceKeys } from "../api/devices.keys";

export const useMyDevices = () => useQuery({ queryKey: deviceKeys.mine, queryFn: api.listMyDevices });
export const useOrgDevices = (orgId: string, enabled = true) =>
  useQuery({ queryKey: deviceKeys.org(orgId), queryFn: () => api.listOrgDevices(orgId), enabled });

export const useOrgSessions = (orgId: string) =>
  useQuery({
    queryKey: deviceKeys.sessions(orgId),
    queryFn: () => api.listOrgSessions(orgId),
    refetchInterval: 30_000,
  });

export function useRevokeSession(orgId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.revokeSession,
    onSuccess: () => {
      notifySuccess("Signed out — that browser must log in again");
      return client.invalidateQueries({ queryKey: deviceKeys.sessions(orgId) });
    },
    onError: (e) => notifyError(e),
  });
}

export function useRevokeDevice() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.revokeDevice,
    onSuccess: () => {
      notifySuccess("Device revoked — its connections were closed");
      return Promise.all([
        client.invalidateQueries({ queryKey: ["me"] }),
        client.invalidateQueries({ queryKey: ["orgs"] }),
      ]);
    },
    onError: (e) => notifyError(e),
  });
}
