import { describe, expect, it } from "vitest";
import type { Resource } from "@/features/resources";
import {
  AWS_SERVICES,
  buildCreateRequest,
  fieldError,
  initialExtras,
  QUICK_ADD,
  TYPES,
} from "@/features/variables/lib/catalog";
import { chipLabel, typeOfResource } from "@/features/variables/lib/group";

const draft = (provider: string, fields: Record<string, string>) => {
  const extras = initialExtras("aws", provider);
  return buildCreateRequest({
    key: "X_SECRET",
    type: "aws",
    provider,
    value: "secret123",
    fields: { accessKeyId: "AKIA1", ...fields },
    extras,
  });
};

describe("FR-GW-005 AWS type: a Service choice fills the endpoint and the SDK's variable names", () => {
  it("offers S3, SES, SQS and S3-compatible storage", () => {
    expect(AWS_SERVICES.map((s) => s.id)).toEqual(["s3", "ses", "sqs", "compatible"]);
    expect(TYPES.aws.providers).toBe(AWS_SERVICES);
    expect(TYPES.aws.providerLabel).toBe("Service");
  });

  it("S3: endpoint from the region, AWS_ENDPOINT_URL_S3 pre-ticked", () => {
    const r = draft("s3", { region: "ap-south-1" });
    expect(r.body).toMatchObject({
      preset: "aws-s3",
      resource: {
        kind: "aws",
        region: "ap-south-1",
        endpoint: "https://s3.ap-south-1.amazonaws.com",
        awsService: "s3",
      },
    });
    expect(r.body.extras).toEqual([
      { key: "AWS_ACCESS_KEY_ID", field: "accessKeyId" },
      { key: "AWS_ENDPOINT_URL_S3", field: "endpoint" },
    ]);
  });

  it("SES: email.<region> endpoint and AWS_ENDPOINT_URL_SESV2 (the variable SDK v3's SESv2Client reads)", () => {
    const r = draft("ses", { region: "ap-southeast-1" });
    expect(r.body).toMatchObject({
      resource: { endpoint: "https://email.ap-southeast-1.amazonaws.com", awsService: "ses" },
    });
    expect(r.body.extras).toContainEqual({ key: "AWS_ENDPOINT_URL_SESV2", field: "endpoint" });
    // The classic SESClient's name is offered too, not ticked.
    expect(initialExtras("aws", "ses").find((e) => e.suggestedKey === "AWS_ENDPOINT_URL_SES")?.on).toBe(false);
  });

  it("SQS: sqs.<region> endpoint and AWS_ENDPOINT_URL_SQS", () => {
    const r = draft("sqs", { region: "eu-west-1" });
    expect(r.body).toMatchObject({ resource: { endpoint: "https://sqs.eu-west-1.amazonaws.com", awsService: "sqs" } });
    expect(r.body.extras).toContainEqual({ key: "AWS_ENDPOINT_URL_SQS", field: "endpoint" });
  });

  it("S3-compatible: the endpoint is asked for (required, https) and handed over as AWS_ENDPOINT_URL", () => {
    const req = TYPES.aws.required("compatible");
    expect(req.map((f) => f.name)).toContain("endpoint");
    expect(TYPES.aws.required("s3").map((f) => f.name)).not.toContain("endpoint");
    expect(fieldError(req, { endpoint: "abc.r2.cloudflarestorage.com" })).toMatch(/https:\/\//);
    const r = draft("compatible", { region: "auto", endpoint: "https://abc.r2.cloudflarestorage.com" });
    expect(r.body).toMatchObject({ resource: { endpoint: "https://abc.r2.cloudflarestorage.com", region: "auto" } });
    expect((r.body.resource as Record<string, unknown>).awsService).toBeUndefined();
    expect(r.body.extras).toContainEqual({ key: "AWS_ENDPOINT_URL", field: "endpoint" });
  });

  it("stored AWS services show their service (from awsService or the endpoint)", () => {
    const aws = (config: Record<string, unknown>) => ({ kind: "aws", config }) as unknown as Resource;
    expect(typeOfResource(aws({ endpoint: "https://email.ap-southeast-1.amazonaws.com" }))).toEqual({
      type: "aws",
      provider: "ses",
    });
    expect(typeOfResource(aws({ endpoint: "https://sqs.eu-west-1.amazonaws.com" }))).toEqual({
      type: "aws",
      provider: "sqs",
    });
    expect(typeOfResource(aws({ endpoint: "https://s3.us-east-1.amazonaws.com" }))).toEqual({
      type: "aws",
      provider: "s3",
    });
    expect(typeOfResource(aws({ endpoint: "https://abc.r2.cloudflarestorage.com" }))).toEqual({
      type: "aws",
      provider: "compatible",
    });
    expect(chipLabel("aws", "ses")).toBe("AWS · SES");
    expect(chipLabel("aws", "compatible")).toBe("AWS · S3-compatible");
  });

  it("Quick add has Amazon SES next to AWS S3", () => {
    expect(QUICK_ADD.find((q) => q.id === "ses")).toMatchObject({ type: "aws", provider: "ses" });
    expect(QUICK_ADD.find((q) => q.id === "aws")).toMatchObject({ type: "aws", provider: "s3" });
  });
});
