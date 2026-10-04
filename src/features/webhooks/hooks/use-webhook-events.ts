import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/webhooks.api";
import { webhookKeys } from "../api/webhooks.keys";

export const useWebhookEvents = (envId: string, page: number) =>
  useQuery({
    queryKey: webhookKeys.list(envId, page),
    queryFn: () => api.listWebhookEvents(envId, page),
    placeholderData: keepPreviousData,
    refetchInterval: 5_000,
  });

export function useReplayWebhook(envId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.replayWebhookEvent(eventId),
    onSuccess: (r) => {
      notifySuccess(
        r.queued > 0 ? `Sent again to ${r.queued} device${r.queued > 1 ? "s" : ""}` : "No device to send it to",
      );
      return qc.invalidateQueries({ queryKey: webhookKeys.all(envId) });
    },
    onError: (e) => notifyError(e),
  });
}
