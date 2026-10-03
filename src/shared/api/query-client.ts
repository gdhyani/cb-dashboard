import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-error";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}

const MAX_RETRIES = 2;

/** Retry network failures and 5xx; never retry 4xx (the request itself is wrong). */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  return error instanceof ApiError && (error.isNetwork || error.statusCode >= 500);
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: shouldRetry },
      mutations: { retry: false },
    },
  });
}
