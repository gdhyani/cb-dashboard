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
  resources.listResources.mockResolvedValue([]);
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
    // Saved: back to the read-only view in the same dialog, not closed.
    expect(await screen.findByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByLabelText("Key")).toHaveAttribute("readonly");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
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
    // The model name is its own plain variable (LLM_MODEL), never a service setting.
    expect(screen.queryByLabelText("Model name")).toBeNull();
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

  it('CA certificate: the stored one shows its subject and expiry only; Remove sends "" (tested first)', async () => {
    const withCa: ServiceGroup = {
      ...MONGO,
      resource: resource({
        config: {
          host: "h",
          caCertFile: { subject: "CN=Aiven Project CA", notAfter: "2035-01-01T00:00:00.000Z", size: 1500 },
        },
      }),
    };
    renderEdit({ group: withCa });
    expect(screen.getByText(/CN=Aiven Project CA/)).toBeInTheDocument();
    expect(screen.getByText(/2035/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Remove CA certificate/ }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(resources.updateResource).toHaveBeenCalledWith("r1", { caCert: "", test: true }));
  });

  it("CA certificate: a new file replaces the stored one", async () => {
    const PEM = "-----BEGIN CERTIFICATE-----\nMIIBNEW\n-----END CERTIFICATE-----\n";
    const withCa: ServiceGroup = {
      ...MONGO,
      resource: resource({
        config: { host: "h", caCertFile: { subject: "CN=Old", notAfter: "2030-01-01T00:00:00.000Z", size: 900 } },
      }),
    };
    renderEdit({ group: withCa });
    fireEvent.change(screen.getByLabelText(/choose a file/i), { target: { files: [new File([PEM], "new-ca.pem")] } });
    await screen.findByText(/new-ca\.pem/);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(resources.updateResource).toHaveBeenCalledWith("r1", { caCert: PEM, test: true }));
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

describe("D9 read-only view first, Edit unlocks the same form", () => {
  it("opens read-only: the title has no verb, fields can't be typed in, only Close and Edit", () => {
    const onOpenChange = vi.fn();
    renderEdit({ initialMode: "view", onOpenChange });
    expect(screen.getByRole("heading", { name: "MongoDB variable · MONGODB_URI" })).toBeInTheDocument();
    expect(screen.getByLabelText("Key")).toHaveAttribute("readonly");
    expect(screen.getByLabelText(/CA certificate/)).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: "Replace value" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    // The footer Close (the dialog's own X is also "Close") just closes.
    const close = screen.getAllByRole("button", { name: "Close" }).find((b) => b.textContent === "Close");
    fireEvent.click(close as HTMLElement);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Edit unlocks the fields in the same dialog; Cancel drops the changes and goes back to read-only", () => {
    const onOpenChange = vi.fn();
    renderEdit({ initialMode: "view", onOpenChange });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("heading", { name: "Edit MongoDB variable · MONGODB_URI" })).toBeInTheDocument();
    const key = screen.getByLabelText("Key");
    expect(key).not.toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: "Replace value" })).toBeInTheDocument();
    fireEvent.change(key, { target: { value: "OTHER" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByLabelText("Key")).toHaveValue("MONGODB_URI");
    expect(screen.getByLabelText("Key")).toHaveAttribute("readonly");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(vars.updateVariable).not.toHaveBeenCalled();
  });

  it("FR-UI-001 a typed secret is gone once back in the read-only view", async () => {
    renderEdit({ initialMode: "view" });
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Replace value" }));
    fireEvent.change(screen.getByLabelText(/Connection URL/), { target: { value: "mongodb://u:p@h/db" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByDisplayValue("mongodb://u:p@h/db")).toBeNull();
    expect(screen.queryByLabelText(/Connection URL/)).toBeNull();
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

  it("has no App port field: cb detects the port the app listens on", async () => {
    renderEdit({ variable: WH_VAR, group: WH, initialMode: "edit" });
    await screen.findByText("https://cb.example/api/hooks/r9");
    expect(screen.queryByLabelText(/App port/)).toBeNull();
  });

  it("adds the thin destination's secret without retyping the main one", async () => {
    renderEdit({ variable: WH_VAR, group: WH, initialMode: "edit" });
    fireEvent.click(await screen.findByRole("button", { name: "Replace value" }));
    fireEvent.change(screen.getByLabelText(/Thin events signing secret/), { target: { value: "whsec_thin_new" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/ }));
    await waitFor(() =>
      expect(resources.updateResource).toHaveBeenCalledWith("r9", { thinSigningSecret: "whsec_thin_new", test: true }),
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
});

describe("FR-GW-005 AWS: a new region moves the endpoint, so the keys are asked again", () => {
  const AWS_VAR = variable({ key: "SES_SECRET_ACCESS_KEY", resourceId: "ra", field: "secretAccessKey" });
  const AWS: ServiceGroup = {
    resource: resource({
      id: "ra",
      kind: "aws",
      name: "SES_SECRET_ACCESS_KEY",
      config: { region: "ap-southeast-1", endpoint: "https://email.ap-southeast-1.amazonaws.com", awsService: "ses" },
    }),
    type: "aws",
    provider: "ses",
    main: AWS_VAR,
    rows: [{ variable: AWS_VAR, extra: false }],
  };

  it("sends the SES endpoint of the new region together with the keys", async () => {
    renderEdit({ variable: AWS_VAR, group: AWS, initialMode: "edit" });
    fireEvent.change(await screen.findByLabelText(/^Region/), { target: { value: "eu-west-1" } });
    expect(screen.getByText(/A new address needs the key again/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Secret access key \(new value\)/), {
      target: { value: "new-secret-0000" },
    });
    fireEvent.change(screen.getByLabelText(/Access key ID \(new value\)/), { target: { value: "AKIANEW" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/ }));
    await waitFor(() =>
      expect(resources.updateResource).toHaveBeenCalledWith(
        "ra",
        expect.objectContaining({
          region: "eu-west-1",
          endpoint: "https://email.eu-west-1.amazonaws.com",
          secretAccessKey: "new-secret-0000",
          accessKeyId: "AKIANEW",
        }),
      ),
    );
  });
});
