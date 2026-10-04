import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/emergency-stop.api";
import { stopKeys } from "../api/emergency-stop.keys";
import type { StopScope } from "../types";

export const useStops = (orgId: string) =>
  useQuery({ queryKey: stopKeys.list(orgId), queryFn: () => api.listStops(orgId), refetchInterval: 15_000 });

export function useStopMutations(orgId: string) {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["orgs", orgId] });
  return {
    activate: useMutation({
      mutationFn: (body: { scope: StopScope; targetId?: string; reason: string }) => api.activateStop(orgId, body),
      onSuccess: (s) => {
        notifySuccess(`Access stopped for ${s.targetLabel}. Live connections are closing.`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
    clear: useMutation({
      mutationFn: (id: string) => api.clearStop(id),
      onSuccess: (s) => {
        notifySuccess(`Access restored for ${s.targetLabel}`);
        return refresh();
      },
      onError: (e) => notifyError(e),
    }),
  };
}
