import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddVariableDialog } from "@/features/variables/components/add-variable-dialog";

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

const SA = JSON.stringify({
  type: "service_account",
  project_id: "cb-test",
  client_email: "sa@cb-test.iam.gserviceaccount.com",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCSECRETKEYBODY\n-----END PRIVATE KEY-----\n",
});
const CA = "-----BEGIN CERTIFICATE-----\nMIIEQTCCAqmgAwIBAgIUCABODYLINE\n-----END CERTIFICATE-----\n";
const winFile = (text: string, name: string) => new File([`﻿${text.replace(/\n/g, "\r\n")}`], name);
/** Text a person can read on screen — not what sits inside a (masked) form field. */
function visibleText(): string {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let out = "";
  for (let n = walker.nextNode(); n; n = walker.nextNode())
    if (!n.parentElement?.closest("textarea, input")) out += n.textContent;
  return out;
}
const choose = (file: File, index = 0) =>
  fireEvent.change(screen.getAllByLabelText(/choose a file/i)[index] as HTMLElement, { target: { files: [file] } });

beforeEach(() => {
  vi.clearAllMocks();
  api.createService.mockResolvedValue({ service: { id: "r1" }, variables: [], test: null });
});

describe("secret files by upload (Firebase JSON, CA .pem)", () => {
  it("Firebase: the key file chosen from disk is sent as the service account, as saved on Windows or not", async () => {
    renderDialog({ initialType: "gcp" });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "FIREBASE_SERVICE_ACCOUNT" } });
    choose(winFile(SA, "cb-test-firebase-adminsdk.json"));
    await screen.findByText(/cb-test-firebase-adminsdk\.json/);
    expect(visibleText()).not.toContain("SECRETKEYBODY");
    fireEvent.click(screen.getByRole("button", { name: "Save & test" }));
    await waitFor(() => expect(api.createService).toHaveBeenCalled());
    expect(api.createService.mock.calls[0]?.[1].resource.serviceAccountJson).toBe(SA);
  });

  it("Firebase: a file that is not a service-account key is refused with a reason that never shows its content", async () => {
    renderDialog({ initialType: "gcp" });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "FIREBASE_SERVICE_ACCOUNT" } });
    choose(new File([CA], "ca.pem"));
    expect(await screen.findByText(/certificate, not a service-account key/i)).toBeInTheDocument();
    expect(visibleText()).not.toContain("CABODYLINE");
    fireEvent.click(screen.getByRole("button", { name: "Save & test" }));
    expect(api.createService).not.toHaveBeenCalled();
  });

  it("Aiven: a MySQL URL on aivencloud.com opens Advanced and asks for the CA; the chosen ca.pem is sent", async () => {
    renderDialog({ initialType: "mysql" });
    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "DATABASE_URL" } });
    fireEvent.change(screen.getByLabelText(/Connection URL/), {
      target: { value: "mysql://avnadmin:pw@testcb-x.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED" },
    });
    expect(await screen.findByText(/Aiven signs its servers with its own CA/)).toBeInTheDocument();
    choose(winFile(CA, "ca.pem"));
    await screen.findByText(/ca\.pem — read/);
    fireEvent.click(screen.getByRole("button", { name: "Save & test" }));
    await waitFor(() => expect(api.createService).toHaveBeenCalled());
    expect(api.createService.mock.calls[0]?.[1].resource.caCert).toBe(CA.trim());
  });

  it("CA: a private key dropped into the CA field is refused without showing it", async () => {
    renderDialog({ initialType: "mysql" });
    fireEvent.click(screen.getByRole("button", { name: /Advanced/ }));
    choose(new File([JSON.parse(SA).private_key], "key.pem"));
    expect(await screen.findByText(/holds a private key/i)).toBeInTheDocument();
    expect(visibleText()).not.toContain("SECRETKEYBODY");
  });
});
