import { describe, expect, it } from "vitest";
import type { Resource } from "@/features/resources";
import { chipLabel, groupVariables, typeOfResource } from "@/features/variables/lib/group";
import type { Variable } from "@/features/variables/types";

const v = (o: Partial<Variable> & { key: string }): Variable => ({
  id: o.key,
  environmentId: "e",
  type: "plain",
  required: false,
  value: null,
  format: null,
  resourceId: null,
  resourceName: null,
  field: null,
  updatedAt: "",
  ...o,
});
const r = (o: Partial<Resource>): Resource => ({
  id: "r1",
  environmentId: "e",
  kind: "mongodb",
  name: "x",
  config: {},
  credentialsSet: true,
  rotatedAt: null,
  disabled: false,
  brokeredFields: [],
  createdAt: "",
  ...o,
});

describe("grouping (D1, legacy data)", () => {
  it("puts extras under the main key, standalone keys stay single rows", () => {
    const g = groupVariables(
      [
        v({ key: "PORT", value: "3000" }),
        v({ key: "STRIPE_SECRET_KEY", type: "brokered", resourceId: "s", field: "key" }),
        v({ key: "NEXT_PUBLIC_PK", resourceId: "s", value: "pk" }),
      ],
      [r({ id: "s", kind: "http", config: { upstreamUrl: "https://api.stripe.com", provider: "stripe" } })],
    );
    expect(g.items.map((i) => (i.kind === "service" ? `svc:${i.group.main?.key}` : i.row.variable.key))).toEqual([
      "PORT",
      "svc:STRIPE_SECRET_KEY",
    ]);
    const svc = g.items.find((i) => i.kind === "service");
    if (svc?.kind !== "service") throw new Error("expected a service group");
    expect(svc.group.rows.map((x) => [x.variable.key, x.extra])).toEqual([
      ["STRIPE_SECRET_KEY", false],
      ["NEXT_PUBLIC_PK", true],
    ]);
    expect(svc.group.type).toBe("stripe");
  });

  it("legacy: no variable on the main field → first brokered is shown as main; resource without variables → orphan", () => {
    const g = groupVariables(
      [
        v({ key: "AWS_REGION", type: "brokered", resourceId: "a", field: "region" }),
        v({ key: "AWS_ACCESS_KEY_ID", type: "brokered", resourceId: "a", field: "accessKeyId" }),
      ],
      [r({ id: "a", kind: "aws" }), r({ id: "o", kind: "redis", name: "cache" })],
    );
    const svc = g.items.find((i) => i.kind === "service");
    if (svc?.kind !== "service") throw new Error("expected a service group");
    expect(svc.group.main?.key).toBe("AWS_ACCESS_KEY_ID");
    expect(g.orphans.map((o) => o.resource.name)).toEqual(["cache"]);
  });

  it("Firebase read as a key file: the credentials-file key is the main key, not the project id or email", () => {
    const g = groupVariables(
      [
        v({ key: "FIREBASE_CLIENT_EMAIL", type: "brokered", resourceId: "fb", field: "clientEmail" }),
        v({ key: "FIREBASE_PROJECT_ID", type: "brokered", resourceId: "fb", field: "projectId" }),
        v({ key: "GOOGLE_APPLICATION_CREDENTIALS", type: "brokered", resourceId: "fb", field: "credentialsFile" }),
      ],
      [r({ id: "fb", kind: "google-sa" })],
    );
    const svc = g.items.find((i) => i.kind === "service");
    if (svc?.kind !== "service") throw new Error("expected a service group");
    expect(svc.group.main?.key).toBe("GOOGLE_APPLICATION_CREDENTIALS");
  });

  it("chip labels and provider detection", () => {
    expect(typeOfResource(r({ kind: "http", config: { provider: "openai", upstreamUrl: "https://x" } }))).toEqual({
      type: "ai",
      provider: "openai",
    });
    expect(typeOfResource(r({ kind: "http", config: { upstreamUrl: "https://api.openai.com" } }))).toEqual({
      type: "ai",
      provider: "openai",
    });
    expect(
      typeOfResource(r({ kind: "http", config: { provider: "ai-custom", upstreamUrl: "http://10.0.4.12:8000" } })),
    ).toEqual({
      type: "ai",
      provider: "custom",
    });
    expect(typeOfResource(r({ kind: "http", config: { upstreamUrl: "http://10.0.4.12:8000" } }))).toEqual({
      type: "http",
    });
    expect(typeOfResource(r({ kind: "oauth", config: { tokenUrl: "https://oauth2.googleapis.com/token" } }))).toEqual({
      type: "oauth",
      provider: "google",
    });
    expect(typeOfResource(r({ kind: "google-sa" }))).toEqual({ type: "gcp" });
    expect(chipLabel("ai", "custom")).toBe("AI · Custom");
    expect(chipLabel("ai", "openai")).toBe("AI · OpenAI");
    expect(chipLabel("oauth", "google")).toBe("Sign-in · Google");
    expect(chipLabel("visible")).toBe("Shown as-is");
    expect(chipLabel("mongodb")).toBe("MongoDB");
  });
});
