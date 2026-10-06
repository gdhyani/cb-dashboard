import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Resource } from "@/features/resources";
import { EditVariableDialog } from "@/features/variables/components/edit-variable-dialog";
import type { ServiceGroup } from "@/features/variables/lib/group";
import type { Variable } from "@/features/variables/types";
import { ApiError } from "@/shared/api/api-error";

const vars = vi.hoisted(() => ({
  createService: vi.fn(),
  createVariable: vi.fn(),
  listVariables: vi.fn(),
  updateVariable: vi.fn(),
  deleteVariable: vi.fn(),
  previewAs: vi.fn(),
}));
const resources = vi.hoisted(() => ({
  listResources: vi.fn(),
  createResource: vi.fn(),
  rotateResource: vi.fn(),
  updateResource: vi.fn(),
  deleteResource: vi.fn(),
  listProfiles: vi.fn(),
  createProfile: vi.fn(),
  rotateProfile: vi.fn(),
  deleteProfile: vi.fn(),
  listPresets: vi.fn(),
  testResource: vi.fn(),
}));
vi.mock("@/features/variables/api/variables.api", () => vars);
vi.mock("@/features/resources/api/resources.api", () => resources);

const variable = (o: Partial<Variable> & { key: string }): Variable => ({
  id: `v-${o.key}`,
  environmentId: "e1",
  type: "brokered",
  required: false,
  value: null,
  format: null,
  resourceId: null,
  resourceName: null,
  field: null,
  updatedAt: "",
  ...o,
});
const resource = (o: Partial<Resource>): Resource => ({
  id: "r1",
  environmentId: "e1",
  kind: "mongodb",
  name: "MONGODB_URI",
  config: { host: "db.internal:27017", database: "shop" },
  credentialsSet: true,
  rotatedAt: "2026-10-02T10:00:00.000Z",
  disabled: false,
  brokeredFields: [],
  createdAt: "",
  ...o,
});

const MONGO_VAR = variable({ key: "MONGODB_URI", resourceId: "r1", field: "url" });
const MONGO: ServiceGroup = {
  resource: resource({}),
  type: "mongodb",
  main: MONGO_VAR,
  rows: [{ variable: MONGO_VAR, extra: false }],
};
const LLM_VAR = variable({ key: "LLM_API_KEY", resourceId: "r2", field: "key" });
const LLM_URL = variable({ key: "MODEL_SERVER_URL", resourceId: "r2", field: "baseUrl" });
const LLM: ServiceGroup = {
  resource: resource({
    id: "r2",
    kind: "http",
    name: "LLM_API_KEY",
    config: { provider: "ai-custom", upstreamUrl: "http://10.0.4.12:8000", authScheme: "bearer" },
  }),
  type: "ai",
  provider: "custom",
  main: LLM_VAR,
  rows: [
    { variable: LLM_VAR, extra: false },
    { variable: LLM_URL, extra: true, parentKey: "LLM_API_KEY" },
  ],
};

function renderEdit(props: Partial<ComponentProps<typeof EditVariableDialog>> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <EditVariableDialog envId="e1" open onOpenChange={() => {}} variable={MONGO_VAR} group={MONGO} {...props} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  resources.listProfiles.mockResolvedValue([{ name: "default", rotatedAt: null, isDefault: true }]);
  vars.updateVariable.mockResolvedValue({});
  resources.updateResource.mockResolvedValue({});
});

describe("Edit variable dialog (D9, FR-UI-001)", () => {
  it("D5 title names the type and the key", () => {
    renderEdit();
    expect(screen.getByRole("heading", { name: "Edit MongoDB variable · MONGODB_URI" })).toBeInTheDocument();
  });

  it("D9 rename sends only the key", async () => {
    const onOpenChange = vi.fn();
    renderEdit({ onOpenChange });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "mongo url" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(vars.updateVariable).toHaveBeenCalledWith("v-MONGODB_URI", { key: "MONGO_URL" }));
    expect(resources.updateResource).not.toHaveBeenCalled();
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("rename conflict shows on the Key field and the dialog stays open", async () => {
    vars.updateVariable.mockRejectedValue(
      new ApiError({
        code: "CONFLICT",
        message: "MONGO_URL already exists in this environment.",
        statusCode: 409,
        correlationId: "c",
      }),
    );
    const onOpenChange = vi.fn();
    renderEdit({ onOpenChange });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "MONGO_URL" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("MONGO_URL already exists in this environment.")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("FR-UI-001 the stored secret is never shown; Replace value starts empty", () => {
    renderEdit({ startReplacing: true });
    const input = screen.getByLabelText(/Connection URL/);
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("type", "password");
    expect(screen.getByText(/can't be viewed/)).toBeInTheDocument();
  });

  it("D9 Replace value is tested first; a failure is shown inline and the value is kept", async () => {
    resources.updateResource.mockRejectedValue(
      new ApiError({
        code: "SERVICE_TEST_FAILED",
        message: "Authentication failed.",
        statusCode: 422,
        correlationId: "c",
      }),
    );
    renderEdit();
    fireEvent.click(screen.getByRole("button", { name: "Replace value" }));
    fireEvent.change(screen.getByLabelText(/Connection URL/), { target: { value: "mongodb://u:new@h/shop" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(resources.updateResource).toHaveBeenCalledWith("r1", {
        connectionUri: "mongodb://u:new@h/shop",
        test: true,
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Authentication failed.");
    expect(screen.getByLabelText(/Connection URL/)).toHaveValue("mongodb://u:new@h/shop");
  });

  it("settings: changing the AI Custom base URL is tested and sends only what changed", async () => {
    renderEdit({ variable: LLM_VAR, group: LLM });
    expect(screen.getByRole("heading", { name: "Edit AI variable · LLM_API_KEY" })).toBeInTheDocument();
    const base = screen.getByLabelText("Base URL");
    expect(base).toHaveValue("http://10.0.4.12:8000");
    fireEvent.change(base, { target: { value: "http://10.0.4.20:8000" } });
    // review I5: a new address needs the key again.
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/API key \(new value\)/), { target: { value: "k2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(resources.updateResource).toHaveBeenCalledWith("r2", {
        apiKey: "k2",
        upstreamUrl: "http://10.0.4.20:8000",
        test: true,
      }),
    );
  });

  it("linked extra keys can be renamed from the main key's dialog", async () => {
    renderEdit({ variable: LLM_VAR, group: LLM });
    fireEvent.change(screen.getByDisplayValue("MODEL_SERVER_URL"), { target: { value: "LLM_URL" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(vars.updateVariable).toHaveBeenCalledWith("v-MODEL_SERVER_URL", { key: "LLM_URL" }));
  });

  it('CA certificate: replaced or removed ("") from the edit dialog, tested first', async () => {
    const PEM = "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----";
    const withCa: ServiceGroup = { ...MONGO, resource: resource({ config: { host: "h", caCert: PEM } }) };
    renderEdit({ group: withCa });
    const ca = screen.getByLabelText(/CA certificate/);
    expect(ca).toHaveValue(PEM);
    fireEvent.change(ca, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(resources.updateResource).toHaveBeenCalledWith("r1", { caCert: "", test: true }));
  });

  it("plain values are editable in place", async () => {
    const port = variable({ key: "PORT", type: "plain", value: "3000" });
    renderEdit({ variable: port, group: undefined });
    expect(screen.getByRole("heading", { name: "Edit variable · PORT" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Value"), { target: { value: "4000" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(vars.updateVariable).toHaveBeenCalledWith("v-PORT", { value: "4000" }));
  });

  it("review I2: renaming to a key that already exists changes nothing — no request at all", async () => {
    renderEdit({ takenKeys: ["DATABASE_URL"] });
    fireEvent.click(screen.getByRole("button", { name: "Replace value" }));
    fireEvent.change(screen.getByLabelText(/Connection URL/), { target: { value: "mongodb://u:new@h/shop" } });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "DATABASE_URL" } });
    expect(screen.getByText(/DATABASE_URL already exists/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(resources.updateResource).not.toHaveBeenCalled();
    expect(vars.updateVariable).not.toHaveBeenCalled();
  });

  it("review I4: a service no variable uses can be edited (settings, value) without a key", async () => {
    const orphan: ServiceGroup = {
      resource: resource({ id: "o1", kind: "redis", name: "cache" }),
      type: "redis",
      rows: [],
    };
    renderEdit({ variable: undefined, group: orphan });
    expect(screen.getByRole("heading", { name: "Edit Redis service · cache" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Key")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Replace value" }));
    fireEvent.change(screen.getByLabelText(/Connection URL/), { target: { value: "redis://h:6379" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(resources.updateResource).toHaveBeenCalledWith("o1", { connectionUri: "redis://h:6379", test: true }),
    );
  });

  it("review M9: removing the read-only login asks first", async () => {
    resources.listProfiles.mockResolvedValue([
      { name: "default", rotatedAt: null, isDefault: true },
      { name: "readonly", rotatedAt: "2026-10-01T00:00:00.000Z", isDefault: false },
    ]);
    resources.deleteProfile.mockResolvedValue({ deleted: true });
    renderEdit();
    fireEvent.click(await screen.findByRole("button", { name: "Remove" }));
    expect(resources.deleteProfile).not.toHaveBeenCalled();
    const confirm = await screen.findByRole("button", { name: "Remove login" });
    fireEvent.click(confirm);
    await waitFor(() => expect(resources.deleteProfile).toHaveBeenCalledWith("r1", "readonly"));
  });
});

describe("FR-WH-001 editing a webhook signing secret", () => {
  const WH_VAR = variable({ key: "STRIPE_WEBHOOK_SECRET", resourceId: "r9", field: "secret" });
  const WH: ServiceGroup = {
    resource: resource({
      id: "r9",
      kind: "webhook",
      name: "STRIPE_WEBHOOK_SECRET",
      config: { provider: "stripe", path: "/api/webhooks/stripe", port: 3060 },
      webhookUrl: "https://cb.example/api/hooks/r9",
    }),
    type: "webhook",
    provider: "stripe",
    main: WH_VAR,
    rows: [{ variable: WH_VAR, extra: false }],
  };

  it("sends a new port as a number and an emptied port as null (back to PORT / 3000)", async () => {
    renderEdit({ variable: WH_VAR, group: WH });
    const port = await screen.findByLabelText(/App port/);
    expect(port).toHaveValue("3060");
    fireEvent.change(port, { target: { value: "4000" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/ }));
    await waitFor(() =>
      expect(resources.updateResource).toHaveBeenCalledWith("r9", expect.objectContaining({ port: 4000, test: true })),
    );
  });

  it("shows the URL to paste into Stripe again, with the setup steps", () => {
    renderEdit({ variable: WH_VAR, group: WH });
    expect(screen.getByText("https://cb.example/api/hooks/r9")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy webhook URL" })).toBeInTheDocument();
    expect(screen.getByText(/Stripe Dashboard/)).toBeInTheDocument();
  });

  it("other services show no webhook URL", () => {
    renderEdit();
    expect(screen.queryByRole("button", { name: "Copy webhook URL" })).toBeNull();
  });

  it("an emptied port is cleared", async () => {
    renderEdit({ variable: WH_VAR, group: WH });
    fireEvent.change(await screen.findByLabelText(/App port/), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/ }));
    await waitFor(() =>
      expect(resources.updateResource).toHaveBeenCalledWith("r9", expect.objectContaining({ port: null })),
    );
  });
});
