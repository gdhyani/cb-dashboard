"use client";

import type { Resource } from "@/features/resources";
import { BadgeLabel } from "@/shared/components/badge-label";
import { ServiceLogo } from "@/shared/components/service-logo";
import { StaggerBlock } from "@/shared/components/stagger";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { providerName } from "../lib/endpoint";
import { WebhookSetup } from "./webhook-setup";

/** FR-WH-001: every webhook service's setup on the Webhooks page (Connect, URL, secret), so it is never lost. */
export function WebhookEndpoints({ envId, hooks }: { envId: string; hooks: Resource[] }) {
  return (
    <div className="flex flex-col gap-4">
      {hooks.map((r, i) => {
        const path = typeof r.config.path === "string" ? r.config.path : "";
        const provider = typeof r.config.provider === "string" ? r.config.provider : "stripe";
        return (
          <StaggerBlock key={r.id} index={i}>
            <Card>
              <CardHeader className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
                <ServiceLogo icon={provider} />
                <span className="min-w-0 truncate font-mono text-sm text-foreground">{r.name}</span>
                <BadgeLabel tone="muted">{providerName(provider)}</BadgeLabel>
                {path && <span className="text-xs text-foreground-lighter sm:ml-auto">→ your app at {path}</span>}
              </CardHeader>
              <CardContent>
                <WebhookSetup envId={envId} resource={r} />
              </CardContent>
            </Card>
          </StaggerBlock>
        );
      })}
    </div>
  );
}
