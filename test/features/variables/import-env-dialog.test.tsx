import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImportEnvDialog } from "@/features/variables/components/import-env-dialog";
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

beforeEach(() => vi.clearAllMocks());

function renderDialog(onOpenChange = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ImportEnvDialog envId="e1" open onOpenChange={onOpenChange} existingKeys={["PORT"]} />
    </QueryClientProvider>,
  );
}

describe("OQ10 Import .env (one 'What is this?' per line, FR-UI-001)", () => {
  it("reviews each line, skips existing keys, imports through the normal calls and reports each line", async () => {
    api.createVariable.mockResolvedValue({});
    api.createService.mockResolvedValueOnce({ service: {}, variables: [], test: { ok: true } }).mockRejectedValueOnce(
      new ApiError({
        code: "SERVICE_TEST_FAILED",
        message: "The API rejected the key (HTTP 401)",
        statusCode: 422,
        correlationId: "c",
      }),
    );
    renderDialog();
    fireEvent.change(screen.getByLabelText("Your .env"), {
      target: {
        value:
          "PORT=3000\nAPP_NAME=shop\nAUTH_SECRET=zzz\nDATABASE_URL=postgres://u:REALPW@db/app\nOPENAI_API_KEY=sk-proj-REALKEY",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    expect(screen.getByText("PORT")).toBeInTheDocument();
    expect(screen.getByText(/already exists/)).toBeInTheDocument();
    // Values are never shown back on the review screen.
    expect(screen.queryByText(/REALPW|REALKEY/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Import 4 variables" }));
    await waitFor(() => expect(screen.getByText(/3 added, 1 not added/)).toBeInTheDocument());
    expect(api.createVariable).toHaveBeenCalledWith("e1", { type: "plain", key: "APP_NAME", value: "shop" });
    expect(api.createVariable).toHaveBeenCalledWith(
      "e1",
      expect.objectContaining({ type: "generated", key: "AUTH_SECRET" }),
    );
    expect(api.createService).toHaveBeenCalledWith(
      "e1",
      expect.objectContaining({
        key: "DATABASE_URL",
        test: true,
        resource: expect.objectContaining({ kind: "postgres" }),
      }),
    );
    expect(api.createService).toHaveBeenCalledWith(
      "e1",
      expect.objectContaining({ key: "OPENAI_API_KEY", preset: "openai" }),
    );
    expect(screen.getByText(/The API rejected the key/)).toBeInTheDocument();
    expect(api.createVariable).not.toHaveBeenCalledWith("e1", expect.objectContaining({ key: "PORT" }));
  });

  it("lets the admin change a line's type before importing", async () => {
    api.createVariable.mockResolvedValue({});
    renderDialog();
    fireEvent.change(screen.getByLabelText("Your .env"), { target: { value: "SESSION_SECRET=fixed-value" } });
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    fireEvent.change(screen.getByLabelText("What is SESSION_SECRET?"), { target: { value: "plain" } });
    fireEvent.click(screen.getByRole("button", { name: "Import 1 variable" }));
    await waitFor(() =>
      expect(api.createVariable).toHaveBeenCalledWith("e1", {
        type: "plain",
        key: "SESSION_SECRET",
        value: "fixed-value",
      }),
    );
  });
});

describe("Import .env: a secret is never imported as Plain by default (security run 2026-10-07)", () => {
  it("a secret-looking line has no type until the admin chooses; 'Secret shown as-is' creates a visible variable", async () => {
    api.createVariable.mockResolvedValue({});
    renderDialog();
    fireEvent.change(screen.getByLabelText("Your .env"), {
      target: { value: "CB_TOKEN=CANARY_8b584afc52a0cfdb33633e4d64901bef\nAPP_NAME=shop" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    const pick = (await screen.findByLabelText("What is CB_TOKEN?")) as HTMLSelectElement;
    expect(pick.value).toBe("");
    expect(screen.getByText(/looks like a secret/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Import 2 variables/ })).toBeDisabled();
    fireEvent.change(pick, { target: { value: "visible" } });
    fireEvent.click(screen.getByRole("button", { name: /Import 2 variables/ }));
    await waitFor(() =>
      expect(api.createVariable).toHaveBeenCalledWith("e1", {
        type: "visible",
        key: "CB_TOKEN",
        value: "CANARY_8b584afc52a0cfdb33633e4d64901bef",
      }),
    );
    expect(api.createVariable).toHaveBeenCalledWith("e1", { type: "plain", key: "APP_NAME", value: "shop" });
  });
});
