"use client";

import { ChevronDown, History } from "lucide-react";
import { useState } from "react";
import { useResources } from "@/features/resources";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { WebhookEndpoints } from "./webhook-endpoints";
import { WebhookLog } from "./webhook-log";

/**
 * FR-WH-001/003: the Webhooks tab shows each webhook service's setup (URL to paste, app path); the delivery log is
 * opened on demand — most admins only need the setup, so the log isn't loaded until asked for.
 */
export function WebhooksTab({ envId }: { envId: string }) {
  const resources = useResources(envId);
  const [logOpen, setLogOpen] = useState(false);
  const hooks = (resources.data ?? []).filter((r) => r.kind === "webhook" && r.webhookUrl);
  return (
    <QueryState isPending={resources.isPending} error={resources.error} skeleton={<SkeletonRows rows={2} />}>
      {hooks.length === 0 ? (
        <EmptyState
          title="No webhooks yet"
          description="Add a Webhook signing secret in Variables and paste its URL into Stripe or Razorpay. Each event then goes only to the developer whose app caused it."
        />
      ) : (
        <div className="flex flex-col gap-4">
          <WebhookEndpoints hooks={hooks} />
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            aria-expanded={logOpen}
            aria-controls="webhook-log"
            onClick={() => setLogOpen((o) => !o)}
          >
            <History className="size-3.5" />
            Delivery log
            <ChevronDown className={cn("size-3.5 transition-transform", logOpen && "rotate-180")} />
          </Button>
          {logOpen && (
            <section id="webhook-log" aria-label="Delivery log">
              <WebhookLog envId={envId} />
            </section>
          )}
        </div>
      )}
    </QueryState>
  );
}
