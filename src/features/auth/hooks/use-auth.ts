import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/auth.api";
import { authKeys } from "../api/auth.keys";

/** `allowSignedOut`: on public pages a 401 just means "not logged in" — don't bounce to /login. */
export function useMe({ allowSignedOut, ...options }: { enabled?: boolean; allowSignedOut?: boolean } = {}) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: api.getMe,
    retry: false,
    staleTime: 60_000,
    meta: { allowSignedOut },
    ...options,
  });
}

/** Login, signup and invite forms show failures inline (FormError) — no toast, and a 401 is not "session expired". */
function useSessionMutation<TBody, TResult>(fn: (body: TBody) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    meta: { allowSignedOut: true },
    onSuccess: () => client.invalidateQueries(),
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
