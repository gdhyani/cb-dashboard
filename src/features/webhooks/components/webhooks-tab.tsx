"use client";

import { History } from "lucide-react";
import { useState } from "react";
import { useResources } from "@/features/resources";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonCards } from "@/shared/components/skeletons";
import { Button } from "@/shared/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/shared/ui/sheet";
import { WebhookEndpoints } from "./webhook-endpoints";
import { WebhookLog } from "./webhook-log";

/**
 * FR-WH-001/003: the Webhooks page shows each webhook service's setup in its own card (URL to paste, app path); the
 * delivery log opens in a side sheet on demand — most admins only need the setup, so the log isn't loaded until asked.
 */
export function WebhooksTab({ envId }: { envId: string }) {
  const resources = useResources(envId);
  const [logOpen, setLogOpen] = useState(false);
  const hooks = (resources.data ?? []).filter((r) => r.kind === "webhook" && r.webhookUrl);
  return (
    <QueryState
      isPending={resources.isPending}
      error={resources.error}
      skeleton={<SkeletonCards cards={2} columns={1} />}
    >
      {hooks.length === 0 ? (
        <EmptyState
          title="No webhooks yet"
          description="Add a Webhook signing secret in Variables and paste its URL into Stripe or Razorpay. Each event then goes only to the developer whose app caused it"
        />
      ) : (
        <Section
          className="pt-0 md:pt-0"
          title="Endpoints"
          description="Where Stripe and Razorpay send events; cb passes each one only to the developer who caused it"
          actions={
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={logOpen}
              aria-controls="webhook-log"
              onClick={() => setLogOpen((o) => !o)}
            >
              <History />
              Delivery log
            </Button>
          }
        >
          <WebhookEndpoints envId={envId} hooks={hooks} />
          <Sheet open={logOpen} onOpenChange={setLogOpen}>
            <SheetContent side="right" id="webhook-log" className="w-[46rem] max-w-[95vw]">
              <div className="flex flex-col gap-1 border-b border-border px-5 py-4 pr-12">
                <SheetTitle visible className="text-base">
                  Delivery log
                </SheetTitle>
                <p className="text-sm text-foreground-lighter">
                  Provider webhooks from the last 24 hours and where each one went
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{logOpen && <WebhookLog envId={envId} />}</div>
              <div className="flex justify-end border-t border-border px-5 py-3">
                <SheetClose asChild>
                  <Button variant="secondary" size="sm">
                    Close
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </Section>
      )}
    </QueryState>
  );
}
