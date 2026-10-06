"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { PaginationBar } from "@/shared/components/pagination-bar";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeAgo } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { useReplayWebhook, useWebhookEvents } from "../hooks/use-webhook-events";
import type { WebhookDelivery, WebhookEvent } from "../types";
import { WebhookEndpoints } from "./webhook-endpoints";

/** The backend keeps re-routing an unclaimed event for 15 s (an owner record or linking event may still arrive). */
const ROUTING_WINDOW_MS = 20_000;

function deliveryLabel(d: WebhookDelivery): { text: string; tone: "success" | "warning" | "muted" | "default" } {
  if (d.status === "delivered") return { text: `Delivered${d.appStatus ? ` · ${d.appStatus}` : ""}`, tone: "success" };
  if (d.status === "pending")
    return d.attempts > 0
      ? { text: `Retrying · ${d.attempts} tries`, tone: "warning" }
      : { text: "Waiting", tone: "default" };
  if (d.status === "skipped") return { text: "Not sent", tone: "muted" };
  return { text: "Expired", tone: "muted" };
}

function EventRow({
  event,
  index,
  onReplay,
  replaying,
}: {
  event: WebhookEvent;
  index: number;
  onReplay: () => void;
  replaying: boolean;
}) {
  return (
    <StaggerItem index={index} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-foreground">{event.type || event.eventId}</span>
          <span className="text-xs text-subtle">
            {event.provider === "razorpay" ? "Razorpay" : "Stripe"} · {timeAgo(event.receivedAt)}
          </span>
        </p>
        {event.deliveries.length === 0 ? (
          <p className="text-xs text-subtle">
            {Date.now() - new Date(event.receivedAt).getTime() < ROUTING_WINDOW_MS
              ? "Finding the developer who caused it…"
              : "No one on the team caused this, so it was kept here. Developers can receive these with cb webhooks listen."}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {event.deliveries.map((d) => {
              const label = deliveryLabel(d);
              return (
                <li key={d.id} className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <BadgeLabel tone={label.tone}>{label.text}</BadgeLabel>
                  <span>
                    {d.userEmail} · {d.deviceName}
                  </span>
                  {d.status !== "delivered" && d.lastError && <span className="text-subtle">{d.lastError}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        aria-label={`Replay ${event.type || event.eventId}`}
        loading={replaying}
        onClick={onReplay}
        className="self-start"
      >
        <RotateCcw className="size-3.5" />
        Replay
      </Button>
    </StaggerItem>
  );
}

/** FR-WH-003: the last 24 h of provider webhooks and where each one went. */
export function WebhookEvents({ envId }: { envId: string }) {
  const [page, setPage] = useState(1);
  const events = useWebhookEvents(envId, page);
  const replay = useReplayWebhook(envId);
  return (
    <div className="flex flex-col gap-4">
      <WebhookEndpoints envId={envId} />
      <QueryState isPending={events.isPending} error={events.error} skeleton={<SkeletonRows rows={4} />}>
        {events.data && events.data.items.length === 0 ? (
          <EmptyState
            title="No webhooks yet"
            description="Add a Webhook signing secret in Variables and paste its URL into Stripe or Razorpay. Each event shows up here and goes only to the developer whose app caused it."
          />
        ) : (
          events.data && (
            <div className="flex flex-col gap-3">
              <ul className="divide-y divide-border rounded-lg border border-border px-4">
                {events.data.items.map((e, i) => (
                  <EventRow
                    key={e.id}
                    event={e}
                    index={i}
                    replaying={replay.isPending && replay.variables === e.id}
                    onReplay={() => replay.mutate(e.id)}
                  />
                ))}
              </ul>
              <p className="text-xs text-subtle">Kept for 24 hours.</p>
              <PaginationBar pagination={events.data.pagination} onPage={setPage} />
            </div>
          )
        )}
      </QueryState>
    </div>
  );
}
