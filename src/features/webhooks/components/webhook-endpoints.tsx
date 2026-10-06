"use client";

import { useResources } from "@/features/resources";
import { StaggerItem } from "@/shared/components/stagger";
import { WebhookEndpoint } from "./webhook-endpoint";

/** FR-WH-001: every webhook service's URL on the Webhooks tab, so a deleted provider endpoint is easy to re-add. */
export function WebhookEndpoints({ envId }: { envId: string }) {
  const resources = useResources(envId);
  const hooks = (resources.data ?? []).filter((r) => r.kind === "webhook" && r.webhookUrl);
  if (hooks.length === 0) return null;
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border px-4">
      {hooks.map((r, i) => {
        const path = typeof r.config.path === "string" ? r.config.path : "";
        const provider = typeof r.config.provider === "string" ? r.config.provider : undefined;
        return (
          <StaggerItem key={r.id} index={i} className="flex flex-col gap-2 py-3">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-sm text-foreground">{r.name}</span>
              {path && <span className="text-xs text-subtle">→ your app at {path}</span>}
            </p>
            <WebhookEndpoint url={r.webhookUrl ?? ""} provider={provider} />
          </StaggerItem>
        );
      })}
    </ul>
  );
}
