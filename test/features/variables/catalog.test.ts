import { describe, expect, it } from "vitest";
import {
  buildCreateRequest,
  type DraftState,
  dialogTitle,
  initialExtras,
  normalizeKey,
  QUICK_ADD,
  TYPES,
  type TypeId,
} from "@/features/variables/lib/catalog";

const draft = (over: Partial<DraftState>) =>
  buildCreateRequest({ key: "K", type: "plain", value: "", fields: {}, extras: [], ...over });

describe("D5 dialog titles", () => {
  it("names the type, not the provider", () => {
    expect(dialogTitle("Add", "plain")).toBe("Add variable");
    expect(dialogTitle("Add", "gen")).toBe("Add random secret");
    expect(dialogTitle("Add", "mongodb")).toBe("Add MongoDB variable");
    expect(dialogTitle("Add", "ai")).toBe("Add AI variable");
    expect(dialogTitle("Add", "oauth")).toBe("Add sign-in variable");
    expect(dialogTitle("Edit", "stripe")).toBe("Edit Stripe variable");
  });
});

describe("D2 key names", () => {
  it("normalizes to UPPER_SNAKE without inventing names", () => {
    expect(normalizeKey("mongodb uri")).toBe("MONGODB_URI");
    expect(normalizeKey("next-public.app url")).toBe("NEXT_PUBLIC_APP_URL");
    expect(normalizeKey("")).toBe("");
  });
});

describe("D4 quick add", () => {
  it("sets type (and provider) only", () => {
    expect(QUICK_ADD.find((q) => q.id === "openai")).toMatchObject({ type: "ai", provider: "openai" });
    expect(QUICK_ADD.some((q) => q.label.toLowerCase().includes("self-hosted"))).toBe(false);
  });
});

describe("buildCreateRequest (catalog → API)", () => {
  it("plain, random secret and shown-as-is go to /variables", () => {
    expect(draft({ key: "PORT", value: "3000" })).toEqual({
      endpoint: "variables",
      body: { type: "plain", key: "PORT", value: "3000" },
    });
    expect(draft({ key: "AUTH_SECRET", type: "gen", format: "base64:32" })).toEqual({
      endpoint: "variables",
      body: { type: "generated", key: "AUTH_SECRET", format: "base64:32" },
    });
    expect(draft({ key: "W", type: "visible", value: "whsec" })).toEqual({
      endpoint: "variables",
      body: { type: "visible", key: "W", value: "whsec" },
    });
  });

  it("MongoDB → services with the user's key and the URL as the secret; no fake prefix ever", () => {
    const r = draft({ key: "MY_DB", type: "mongodb", value: "mongodb+srv://u:p@c/x" });
    expect(r).toEqual({
      endpoint: "services",
      body: {
        key: "MY_DB",
        test: true,
        extras: [],
        resource: { kind: "mongodb", connectionUri: "mongodb+srv://u:p@c/x" },
      },
    });
    expect(JSON.stringify(r)).not.toContain("fakePrefix");
  });

  it("AI OpenAI uses the preset; AI Custom sends base URL, style and header and pre-ticks the base-URL extra", () => {
    expect(draft({ key: "OPENAI_API_KEY", type: "ai", provider: "openai", value: "sk" }).body).toMatchObject({
      preset: "openai",
      resource: { kind: "http", apiKey: "sk" },
    });
    const extras = initialExtras("ai", "custom");
    expect(extras[0]).toMatchObject({ suggestedKey: "LLM_BASE_URL", on: true });
    const first = extras[0];
    if (!first) throw new Error("expected an extra");
    const custom = draft({
      key: "LLM_API_KEY",
      type: "ai",
      provider: "custom",
      value: "k",
      fields: { upstreamUrl: "http://10.0.4.12:8000", basePath: "/v1", authScheme: "bearer" },
      extras: [{ ...first, key: "MODEL_SERVER_URL" }],
    });
    expect(custom.body).toEqual({
      key: "LLM_API_KEY",
      test: true,
      resource: {
        kind: "http",
        provider: "ai-custom",
        apiKey: "k",
        upstreamUrl: "http://10.0.4.12:8000",
        basePath: "/v1",
        authScheme: "bearer",
      },
      extras: [{ key: "MODEL_SERVER_URL", field: "baseUrl" }],
    });
  });

  it("Stripe publishable key extra is a linked plain value; unticked extras are not sent", () => {
    const ex = initialExtras("stripe");
    const first = ex[0];
    if (!first) throw new Error("expected an extra");
    const r = draft({
      key: "STRIPE_SECRET_KEY",
      type: "stripe",
      value: "sk",
      extras: [{ ...first, on: true, value: "pk_1" }],
    });
    expect(r.body).toMatchObject({
      preset: "stripe",
      extras: [{ key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", value: "pk_1" }],
    });
    expect(draft({ key: "S", type: "stripe", value: "sk", extras: ex }).body).toMatchObject({ extras: [] });
  });

  it("AWS sends both real keys and region; access key ID extra is pre-ticked", () => {
    const ex = initialExtras("aws");
    expect(ex.find((e) => e.suggestedKey === "AWS_ACCESS_KEY_ID")?.on).toBe(true);
    const r = draft({
      key: "AWS_SECRET_ACCESS_KEY",
      type: "aws",
      value: "secret123",
      fields: { accessKeyId: "AKIA1", region: "ap-south-1" },
      extras: ex,
    });
    expect(r.body).toMatchObject({
      preset: "aws-s3",
      resource: { kind: "aws", secretAccessKey: "secret123", accessKeyId: "AKIA1", region: "ap-south-1" },
    });
  });

  it("Google service account picks the main field from 'reads it as'", () => {
    const json = '{"project_id":"p","client_email":"e","private_key":"-----BEGIN PRIVATE KEY-----"}';
    expect(draft({ key: "FB", type: "gcp", value: json, fields: { readsAs: "json" } }).body).toMatchObject({
      mainField: "credentialsJson",
      resource: { kind: "google-sa", serviceAccountJson: json },
    });
    expect(draft({ key: "FB_KEY", type: "gcp", value: json, fields: { readsAs: "privateKey" } }).body).toMatchObject({
      mainField: "privateKey",
    });
  });

  it("every type in the catalog builds a request without throwing", () => {
    for (const id of Object.keys(TYPES) as TypeId[]) {
      const p = TYPES[id].providers?.[0]?.id;
      expect(() => draft({ key: "K", type: id, provider: p, value: "v" }), id).not.toThrow();
    }
  });
});
