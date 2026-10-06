import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "@/shared/lib/notify";
import * as api from "../api/webhooks.api";

/** Resources (and their webhook status) live under the environment's query keys. */
const useRefreshEnv = (envId: string) => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["environments", envId] });
};

export function useConnectStripe(envId: string) {
  const refresh = useRefreshEnv(envId);
  return useMutation({
    mutationFn: (resourceId: string) => api.connectStripeWebhook(resourceId),
    onSuccess: () => {
      notifySuccess("Connected — Stripe now sends every event to cb");
      return refresh();
    },
    onError: (e) => notifyError(e),
  });
}

export function useRegenerateWebhookSecret(envId: string) {
  const refresh = useRefreshEnv(envId);
  return useMutation({
    // FR-UI-001: the answer holds a secret meant to be shown once; never keep it in the mutation cache.
    gcTime: 0,
    mutationFn: (resourceId: string) => api.regenerateWebhookSecret(resourceId),
    onSuccess: () => refresh(),
    onError: (e) => notifyError(e),
  });
}

export function useSendWebhookToMe(envId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.sendWebhookToMe(eventId),
    onSuccess: (r) => {
      notifySuccess(`Sent to your machine${r.queued > 1 ? "s" : ""} — it arrives while your app runs with cb run`);
      return qc.invalidateQueries({ queryKey: ["environments", envId] });
    },
    onError: (e) => notifyError(e),
  });
}
