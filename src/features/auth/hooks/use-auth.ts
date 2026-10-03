import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyError } from "@/shared/lib/notify";
import * as api from "../api/auth.api";
import { authKeys } from "../api/auth.keys";

export function useMe(options: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: authKeys.me, queryFn: api.getMe, retry: false, staleTime: 60_000, ...options });
}

function useSessionMutation<TBody, TResult>(fn: (body: TBody) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => client.invalidateQueries(),
    onError: (error) => notifyError(error),
  });
}

export const useLogin = () => useSessionMutation(api.login);
export const useSignup = () => useSessionMutation(api.signup);
export const useAcceptInvite = () => useSessionMutation(api.acceptInvite);

export function useLogout() {
  const client = useQueryClient();
  return useMutation({ mutationFn: api.logout, onSettled: () => client.clear() });
}

export function useInvitePreview(token: string) {
  return useQuery({ queryKey: authKeys.invite(token), queryFn: () => api.previewInvite(token), retry: false });
}
