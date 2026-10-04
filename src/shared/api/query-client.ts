import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-error";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
    /** `allowSignedOut`: a 401 is an expected answer (e.g. "who am I?" on public pages), not an expired session. */
    queryMeta: { allowSignedOut?: boolean };
    mutationMeta: { allowSignedOut?: boolean };
  }
}

const MAX_RETRIES = 2;

/** Retry network failures and 5xx; never retry 4xx (the request itself is wrong). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  return error instanceof ApiError && (error.isNetwork || error.statusCode >= 500);
}

/** The session cookie is missing, expired or revoked (not a wrong password, which is INVALID_CREDENTIALS). */
export function isSessionExpired(error: unknown): boolean {
  return error instanceof ApiError && error.code === "UNAUTHORIZED";
}

export function makeQueryClient(options: { onUnauthorized?: () => void } = {}): QueryClient {
  const handle = (error: unknown, meta: { allowSignedOut?: boolean } | undefined) => {
    if (isSessionExpired(error) && !meta?.allowSignedOut) options.onUnauthorized?.();
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError: (error, query) => handle(error, query.meta) }),
    mutationCache: new MutationCache({ onError: (error, _v, _c, mutation) => handle(error, mutation.meta) }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}
