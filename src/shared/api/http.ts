import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { API_BASE_PATH, CORRELATION_HEADER, CSRF_HEADER } from "@/constants";
import { ApiError } from "./api-error";
import { newCorrelationId } from "./correlation";
import { type ApiPaginated, isApiErrorBody, isApiSuccess, type PaginatedResult } from "./envelope";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Correlation id for the current user flow; generated per request when omitted. */
    correlationId?: string;
  }
}

/** THE axios instance. All HTTP in the app goes through it. */
export const http = axios.create({
  baseURL: API_BASE_PATH,
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

const SAFE_METHODS = new Set(["get", "head", "options"]);

http.interceptors.request.use((config) => {
  config.headers.set(CORRELATION_HEADER, config.correlationId ?? newCorrelationId());
  // Cookie-authenticated mutations must carry the CSRF header (backend M0-D4).
  if (!SAFE_METHODS.has((config.method ?? "get").toLowerCase())) config.headers.set(CSRF_HEADER, "1");
  return config;
});

/**
 * D2 (FR-UI-001): what an ApiError keeps of the failed request — never the axios error itself, whose `config.data`
 * is the request body (a secret the admin just typed). Errors live in dialog and query state.
 */
function causeOf(error: AxiosError) {
  return { code: error.code, status: error.response?.status, method: error.config?.method, url: error.config?.url };
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const correlationId = String(error.config?.headers?.get(CORRELATION_HEADER) ?? "");
    if (error.response) {
      const body = error.response.data;
      if (isApiErrorBody(body)) return Promise.reject(new ApiError({ ...body.error, cause: causeOf(error) }));
      return Promise.reject(
        new ApiError({
          code: "UNEXPECTED_RESPONSE",
          message: `Unexpected response from the server (HTTP ${error.response.status}).`,
          statusCode: error.response.status,
          correlationId,
          cause: causeOf(error),
        }),
      );
    }
    return Promise.reject(
      new ApiError({
        code: "NETWORK_ERROR",
        message: "Can't reach the server. Check your connection and try again.",
        statusCode: 0,
        correlationId,
        isNetwork: true,
        cause: causeOf(error),
      }),
    );
  },
);

function unwrap<T>(body: unknown, status: number, correlationId: string): T {
  if (!isApiSuccess<T>(body)) {
    throw new ApiError({
      code: "UNEXPECTED_RESPONSE",
      message: `Unexpected response from the server (HTTP ${status}).`,
      statusCode: status,
      correlationId,
    });
  }
  return body.data;
}

function correlationOf(headers: unknown): string {
  const h = headers as { get?: (name: string) => unknown } | undefined;
  return String(h?.get?.(CORRELATION_HEADER) ?? "");
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.get(url, config);
  return unwrap<T>(res.data, res.status, correlationOf(res.config.headers));
}

export async function apiGetPaginated<T>(url: string, config?: AxiosRequestConfig): Promise<PaginatedResult<T>> {
  const res = await http.get(url, config);
  const items = unwrap<T[]>(res.data, res.status, correlationOf(res.config.headers));
  return { items, pagination: (res.data as ApiPaginated<T>).meta.pagination };
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.post(url, body, config);
  return unwrap<T>(res.data, res.status, correlationOf(res.config.headers));
}

export async function apiPatch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.patch(url, body, config);
  return unwrap<T>(res.data, res.status, correlationOf(res.config.headers));
}

export async function apiPut<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.put(url, body, config);
  return unwrap<T>(res.data, res.status, correlationOf(res.config.headers));
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.delete(url, config);
  return unwrap<T>(res.data, res.status, correlationOf(res.config.headers));
}
