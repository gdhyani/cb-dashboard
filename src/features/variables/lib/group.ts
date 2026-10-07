import type { Resource } from "@/features/resources";
import type { Variable } from "../types";
import { AI_PROVIDERS, MAIN_FIELD, OAUTH_PROVIDERS, TYPES, type TypeId, WEBHOOK_PROVIDERS } from "./catalog";

export interface Row {
  variable: Variable;
  extra: boolean;
  parentKey?: string;
}

export interface ServiceGroup {
  resource: Resource;
  type: TypeId;
  provider?: string;
  main?: Variable;
  rows: Row[];
}

export type GroupedItem = { kind: "variable"; row: Row } | { kind: "service"; group: ServiceGroup };

export interface Grouped {
  items: GroupedItem[];
  /** Services no variable uses (legacy data); still editable and removable. */
  orphans: ServiceGroup[];
}

const HOST_TYPES: Record<string, { type: TypeId; provider?: string }> = {
  "api.openai.com": { type: "ai", provider: "openai" },
  "api.anthropic.com": { type: "ai", provider: "anthropic" },
  "generativelanguage.googleapis.com": { type: "ai", provider: "gemini" },
  "api.groq.com": { type: "ai", provider: "groq" },
  "api.mistral.ai": { type: "ai", provider: "mistral" },
  "openrouter.ai": { type: "ai", provider: "openrouter" },
  "api.stripe.com": { type: "stripe" },
  "api.razorpay.com": { type: "razorpay" },
};

const hostOf = (url: unknown) => {
  try {
    return new URL(String(url)).hostname;
  } catch {
    return "";
  }
};

/** Which "What is this?" type a stored service belongs to (provider hint first, then known hosts). */
export function typeOfResource(r: Resource): { type: TypeId; provider?: string } {
  switch (r.kind) {
    case "mongodb":
    case "postgres":
    case "mysql":
    case "redis":
    case "smtp":
    case "apns":
      return { type: r.kind };
    case "aws": {
      const service = String(r.config.awsService ?? "");
      if (service === "s3" || service === "ses" || service === "sqs") return { type: "aws", provider: service };
      const host = hostOf(r.config.endpoint);
      if (/^email(-fips)?\.[a-z0-9-]+\.amazonaws\.com$/.test(host)) return { type: "aws", provider: "ses" };
      if (/^sqs(-fips)?\.[a-z0-9-]+\.amazonaws\.com$/.test(host)) return { type: "aws", provider: "sqs" };
      if (!host || /^s3[.-]/.test(host)) return { type: "aws", provider: "s3" };
      return { type: "aws", provider: "compatible" };
    }
    case "google-sa":
      return { type: "gcp" };
    case "webhook":
      return { type: "webhook", provider: String(r.config.provider ?? "stripe") };
    case "oauth": {
      const host = hostOf(r.config.tokenUrl);
      if (host === "oauth2.googleapis.com") return { type: "oauth", provider: "google" };
      if (host === "github.com") return { type: "oauth", provider: "github" };
      return { type: "oauth", provider: "custom" };
    }
    default: {
      const hint = String(r.config.provider ?? "");
      if (hint === "ai-custom") return { type: "ai", provider: "custom" };
      if (AI_PROVIDERS.some((p) => p.presetId === hint)) return { type: "ai", provider: hint };
      if (hint === "stripe" || hint === "razorpay" || hint === "supabase") return { type: hint };
      return HOST_TYPES[hostOf(r.config.upstreamUrl)] ?? { type: "http" };
    }
  }
}

export function chipLabel(type: TypeId, provider?: string): string {
  if (type === "plain") return "Plain";
  if (type === "gen") return "Random secret";
  if (type === "visible") return "Shown as-is";
  if (type === "http") return "API key";
  if (type === "aws") return `AWS · ${{ ses: "SES", sqs: "SQS", compatible: "S3-compatible" }[provider ?? ""] ?? "S3"}`;
  if (type === "ai") {
    const p = AI_PROVIDERS.find((x) => x.id === provider);
    return `AI · ${!p || p.id === "custom" ? "Custom" : p.name}`;
  }
  if (type === "webhook") {
    const p = WEBHOOK_PROVIDERS.find((x) => x.id === provider);
    return `Webhook · ${p?.name ?? "Other"}`;
  }
  if (type === "oauth") {
    const p = OAUTH_PROVIDERS.find((x) => x.id === provider);
    return `Sign-in · ${!p || p.id === "custom" ? "Other" : p.name}`;
  }
  return TYPES[type].name;
}

const byKey = (a: Variable, b: Variable) => a.key.localeCompare(b.key);

/** D1: keys of a service sit together (main key first, extras under it); everything else is a single row. */
export function groupVariables(variables: Variable[], resources: Resource[]): Grouped {
  const byResource = new Map<string, Variable[]>();
  const standalone: Variable[] = [];
  const known = new Set(resources.map((r) => r.id));
  for (const v of variables) {
    if (v.resourceId && known.has(v.resourceId)) {
      const list = byResource.get(v.resourceId) ?? [];
      list.push(v);
      byResource.set(v.resourceId, list);
    } else standalone.push(v);
  }

  const items: GroupedItem[] = standalone.map((variable) => ({ kind: "variable", row: { variable, extra: false } }));
  const orphans: ServiceGroup[] = [];
  for (const resource of resources) {
    const { type, provider } = typeOfResource(resource);
    const list = (byResource.get(resource.id) ?? []).sort(byKey);
    if (list.length === 0) {
      orphans.push({ resource, type, provider, rows: [] });
      continue;
    }
    // A Google service account can be read as the whole JSON, a key file or the private key: each is its main key.
    const mainFields =
      resource.kind === "google-sa"
        ? ["credentialsJson", "credentialsFile", "privateKey"]
        : [MAIN_FIELD[resource.kind]];
    const main =
      mainFields.map((f) => list.find((v) => v.type === "brokered" && v.field === f)).find(Boolean) ??
      list.find((v) => v.type === "brokered") ??
      list[0];
    const rows: Row[] = [
      ...(main ? [{ variable: main, extra: false }] : []),
      ...list.filter((v) => v !== main).map((variable) => ({ variable, extra: true, parentKey: main?.key })),
    ];
    items.push({ kind: "service", group: { resource, type, provider, main, rows } });
  }
  const sortKey = (i: GroupedItem) =>
    i.kind === "variable" ? i.row.variable.key : (i.group.main?.key ?? i.group.resource.name);
  items.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  return { items, orphans };
}
