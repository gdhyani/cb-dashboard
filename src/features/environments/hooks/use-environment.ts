import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/environments.api";
import { environmentKeys } from "../api/environments.keys";

export const useEnvironment = (envId: string) =>
  useQuery({ queryKey: environmentKeys.detail(envId), queryFn: () => api.getEnvironment(envId) });

export function useEnvironmentMutations(envId: string) {
  const client = useQueryClient();
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: environmentKeys.detail(envId) }),
      client.invalidateQueries({ queryKey: ["projects"] }),
      client.invalidateQueries({ queryKey: ["orgs"] }),
    ]);
  return {
    kill: useMutation({
      mutationFn: (reason: string) => api.updateEnvironment(envId, { killed: true, reason }),
      onSuccess: () => {
        notifySuccess("Environment suspended. Active connections were terminated.");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    revive: useMutation({
      mutationFn: () => api.updateEnvironment(envId, { killed: false }),
      onSuccess: () => {
        notifySuccess("Environment resumed");
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    remove: useMutation({
      mutationFn: () => api.deleteEnvironment(envId),
      onSuccess: refresh,
      onError: (e) => notifyError(e),
    }),
  };
}
