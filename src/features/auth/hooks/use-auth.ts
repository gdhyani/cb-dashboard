import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifySuccess } from "@/shared/lib/notify";
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

/**
 * Login, signup and invite forms show failures inline (FormError) — no error toast, and a 401 is not "session
 * expired". Success gets a short confirmation toast (Supabase copy: past tense, one quiet detail line).
 */
function useSessionMutation<TBody, TResult>(
  fn: (body: TBody) => Promise<TResult>,
  confirm: (result: TResult) => [string, string?],
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    meta: { allowSignedOut: true },
    onSuccess: (result) => {
      notifySuccess(...confirm(result));
      return client.invalidateQueries();
    },
  });
}

export const useLogin = () => useSessionMutation(api.login, (me) => ["Signed in", `as ${me.user.email}`]);
export const useSignup = () =>
  useSessionMutation(api.signup, (me) => [
    "Account created",
    me.memberships[0] ? `You own ${me.memberships[0].orgName}` : undefined,
  ]);
export const useAcceptInvite = () =>
  useSessionMutation(api.acceptInvite, (r) => [
    "Invite accepted",
    r.me.memberships.find((m) => m.orgId === r.orgId)?.orgName
      ? `You joined ${r.me.memberships.find((m) => m.orgId === r.orgId)?.orgName}`
      : undefined,
  ]);

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => notifySuccess("Signed out"),
    onSettled: () => client.clear(),
  });
}

export function useInvitePreview(token: string) {
  return useQuery({ queryKey: authKeys.invite(token), queryFn: () => api.previewInvite(token), retry: false });
}
