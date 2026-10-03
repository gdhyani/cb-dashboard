// PRD §12.7 — identical shapes in cb-backend and cb-env.
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: { correlationId: string };
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  meta: { correlationId: string; pagination: Pagination };
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: ApiErrorDetail[];
    correlationId: string;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;
  const v = value as { success?: unknown; error?: { code?: unknown; statusCode?: unknown } };
  return v.success === false && typeof v.error?.code === "string" && typeof v.error.statusCode === "number";
}

export function isApiSuccess<T>(value: unknown): value is ApiSuccess<T> {
  return typeof value === "object" && value !== null && (value as { success?: unknown }).success === true;
}
