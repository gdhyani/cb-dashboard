import type { ApiErrorDetail } from "./envelope";

export interface ApiErrorInit {
  code: string;
  message: string;
  statusCode: number;
  correlationId: string;
  details?: ApiErrorDetail[];
  isNetwork?: boolean;
  cause?: unknown;
}

/** The one error type the UI handles. Mirrors the backend error shape (PRD §12.7). */
export class ApiError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly correlationId: string;
  readonly details?: ApiErrorDetail[];
  readonly isNetwork: boolean;

  constructor(init: ApiErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = "ApiError";
    this.code = init.code;
    this.statusCode = init.statusCode;
    this.correlationId = init.correlationId;
    this.details = init.details;
    this.isNetwork = init.isNetwork ?? false;
  }
}
