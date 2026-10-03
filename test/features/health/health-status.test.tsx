import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HealthStatus } from "@/features/health";
import { http } from "@/shared/api/http";

let mock: MockAdapter;
beforeEach(() => {
  mock = new MockAdapter(http);
});
afterEach(() => mock.restore());

function wrap(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("<HealthStatus />", () => {
  it("shows the backend status and checks", async () => {
    mock.onGet("/health").reply(200, {
      success: true,
      data: { status: "ok", uptimeSec: 720, version: "0.0.0", checks: { mongodb: "up" } },
      meta: { correlationId: "c" },
    });
    wrap(<HealthStatus />);
    expect(screen.getByText(/checking/i)).toBeInTheDocument();
    expect(await screen.findByText("ok")).toBeInTheDocument();
    expect(screen.getByText("mongodb up")).toBeInTheDocument();
    expect(screen.getByText("12m")).toBeInTheDocument();
  });

  it("shows the error code and correlation id when the backend fails", async () => {
    mock.onGet("/health").reply(503, {
      success: false,
      error: { code: "SERVICE_UNAVAILABLE", message: "down", statusCode: 503, correlationId: "corr-503" },
    });
    wrap(<HealthStatus />);
    expect(await screen.findByText("SERVICE_UNAVAILABLE")).toBeInTheDocument();
    expect(screen.getByText(/corr-503/)).toBeInTheDocument();
  });
});
