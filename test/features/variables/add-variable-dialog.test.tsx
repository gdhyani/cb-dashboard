import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddVariableDialog } from "@/features/variables/components/add-variable-dialog";
import { ApiError } from "@/shared/api/api-error";

const api = vi.hoisted(() => ({
  createService: vi.fn(),
  createVariable: vi.fn(),
  listVariables: vi.fn(),
  updateVariable: vi.fn(),
  deleteVariable: vi.fn(),
  previewAs: vi.fn(),
}));
vi.mock("@/features/variables/api/variables.api", () => api);

function renderDialog(props: Partial<ComponentProps<typeof AddVariableDialog>> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AddVariableDialog envId="e1" open onOpenChange={() => {}} {...props} />
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe("Add variable dialog (D2, D5, FR-UI-001)", () => {
  it("normalizes the key and blocks invalid names", () => {
    renderDialog();
    const key = screen.getByLabelText("Key");
    fireEvent.change(key, { target: { value: "mongodb uri" } });
    expect(key).toHaveValue("MONGODB_URI");
    fireEvent.change(key, { target: { value: "1abc" } });
    expect(screen.getByText(/UPPER_SNAKE_CASE/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("saves a plain value through /variables", async () => {
    api.createVariable.mockResolvedValue({ key: "PORT" });
    const onOpenChange = vi.fn();
    renderDialog({ onOpenChange });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "PORT" } });
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "3000" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(api.createVariable).toHaveBeenCalledWith("e1", { type: "plain", key: "PORT", value: "3000" }),
    );
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("titles follow the type; quick add opens with the type and provider set", () => {
    renderDialog({ initialType: "ai", initialProvider: "openai" });
    expect(screen.getByRole("heading", { name: "Add AI variable" })).toBeInTheDocument();
    expect(screen.getAllByText("OpenAI").length).toBeGreaterThan(0);
  });

  it("Save & test failure is shown inline and keeps every value; nothing closes", async () => {
    api.createService.mockRejectedValue(
      new ApiError({
        code: "SERVICE_TEST_FAILED",
        message: "connect ECONNREFUSED 127.0.0.1:1",
        statusCode: 422,
        correlationId: "c1",
      }),
    );
    const onOpenChange = vi.fn();
    renderDialog({ initialType: "mongodb", onOpenChange });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "MONGODB_URI" } });
    fireEvent.change(screen.getByLabelText(/Connection URL/), { target: { value: "mongodb://u:p@127.0.0.1:1/x" } });
    fireEvent.click(screen.getByRole("button", { name: "Save & test" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("ECONNREFUSED");
    expect(screen.getByLabelText("Key")).toHaveValue("MONGODB_URI");
    expect(screen.getByLabelText(/Connection URL/)).toHaveValue("mongodb://u:p@127.0.0.1:1/x");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("a taken key is shown on the Key field", async () => {
    api.createService.mockRejectedValue(
      new ApiError({
        code: "CONFLICT",
        message: "MONGODB_URI already exists in this environment.",
        statusCode: 409,
        correlationId: "c2",
      }),
    );
    renderDialog({ initialType: "mongodb" });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "MONGODB_URI" } });
    fireEvent.change(screen.getByLabelText(/Connection URL/), { target: { value: "mongodb://h/x" } });
    fireEvent.click(screen.getByRole("button", { name: "Save & test" }));
    expect(await screen.findByText("MONGODB_URI already exists in this environment.")).toBeInTheDocument();
  });

  it("AI Custom pre-ticks the base-URL extra and lets the user rename it", async () => {
    api.createService.mockResolvedValue({ service: {}, variables: [{ key: "LLM_API_KEY" }], test: null });
    renderDialog({ initialType: "ai", initialProvider: "custom" });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "LLM_API_KEY" } });
    fireEvent.change(screen.getByLabelText(/API key/), { target: { value: "k" } });
    fireEvent.change(screen.getByLabelText("Base URL"), { target: { value: "http://10.0.4.12:8000" } });
    fireEvent.click(screen.getByRole("button", { name: /Suggested extra keys/ }));
    const extraKey = screen.getByDisplayValue("LLM_BASE_URL");
    fireEvent.change(extraKey, { target: { value: "model server url" } });
    expect(extraKey).toHaveValue("MODEL_SERVER_URL");
    fireEvent.click(screen.getByRole("button", { name: "Save & test" }));
    await waitFor(() => expect(api.createService).toHaveBeenCalled());
    expect(api.createService.mock.calls[0]?.[1]).toMatchObject({
      key: "LLM_API_KEY",
      resource: { kind: "http", provider: "ai-custom", upstreamUrl: "http://10.0.4.12:8000", apiKey: "k" },
      extras: [{ key: "MODEL_SERVER_URL", field: "baseUrl" }],
    });
  });

  it("never asks for a fake value or prefix", () => {
    renderDialog({ initialType: "stripe" });
    expect(screen.queryByText(/prefix/i)).toBeNull();
    expect(screen.queryByText(/fake/i)).toBeNull();
    expect(screen.queryByLabelText(/prefix/i)).toBeNull();
  });
});
