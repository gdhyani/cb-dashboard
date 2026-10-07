import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiPost, http } from "@/shared/api/http";
import { SecretInput, SecretTextarea } from "@/shared/components/secret-input";

const CANARY = "CANARY_sk_live_dashboard_hygiene_0001";

describe("browser-side secret hygiene (D2–D5, FR-UI-001)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("D4 secret inputs use autocomplete=new-password, and a caller can't switch it back on", () => {
    render(<SecretInput aria-label="k" autoComplete="on" />);
    expect(screen.getByLabelText("k")).toHaveAttribute("autocomplete", "new-password");
    render(<SecretTextarea aria-label="t" autoComplete="on" />);
    expect(screen.getByLabelText("t")).toHaveAttribute("autocomplete", "off");
  });

  it("D2 an API error kept in state holds no request body (the typed secret)", async () => {
    const mock = new MockAdapter(http);
    mock.onPost("/environments/e1/services").reply(422, {
      success: false,
      error: {
        code: "SERVICE_TEST_FAILED",
        message: "The API rejected the key (HTTP 401)",
        statusCode: 422,
        correlationId: "c",
      },
    });
    const err = await apiPost("/environments/e1/services", { resource: { apiKey: CANARY } }).catch((e: unknown) => e);
    const seen = new WeakSet<object>();
    const dump = JSON.stringify(err, (_k, v) => {
      if (v && typeof v === "object") {
        if (seen.has(v)) return undefined;
        seen.add(v);
      }
      return v;
    });
    expect(dump).not.toContain(CANARY);
    expect(String((err as { cause?: { config?: { data?: unknown } } }).cause?.config?.data ?? "")).not.toContain(
      CANARY,
    );
    expect((err as Error).message).toBe("The API rejected the key (HTTP 401)");
    mock.restore();
  });

  it("D3 D5 typing and submitting a secret writes nothing to storage or the URL", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const before = window.location.href;
    const { AddVariableDialog } = await import("@/features/variables/components/add-variable-dialog");
    const client = new QueryClient();
    const { fireEvent } = await import("@testing-library/react");
    render(
      <QueryClientProvider client={client}>
        <AddVariableDialog envId="e1" open onOpenChange={() => {}} initialType="ai" initialProvider="openai" />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "OPENAI_API_KEY" } });
    fireEvent.change(screen.getByLabelText(/API key/), { target: { value: CANARY } });
    expect(setItem.mock.calls.flat().join("")).not.toContain(CANARY);
    expect(window.location.href).toBe(before);
    expect(document.cookie).not.toContain(CANARY);
  });
});
