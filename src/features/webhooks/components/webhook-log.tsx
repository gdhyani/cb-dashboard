"use client";

import { RotateCcw, Send } from "lucide-react";
import { useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { PaginationBar } from "@/shared/components/pagination-bar";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { timeAgo } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useReplayWebhook, useWebhookEvents } from "../hooks/use-webhook-events";
import { useSendWebhookToMe } from "../hooks/use-webhook-setup";
import type { WebhookDelivery, WebhookEvent } from "../types";

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
  onReplay,
  replaying,
  onSendToMe,
  sending,
}: {
  event: WebhookEvent;
  onReplay: () => void;
  replaying: boolean;
  onSendToMe: () => void;
  sending: boolean;
}) {
  const routing = Date.now() - new Date(event.receivedAt).getTime() < ROUTING_WINDOW_MS;
  const nobody = event.deliveries.length === 0 && !routing;
  const label = event.type || event.eventId;
  return (
    <TableRow>
      <TableCell className="max-w-[16rem] py-2.5 align-top">
        <span className="block truncate font-mono text-sm text-foreground">{label}</span>
        <span className="text-xs text-foreground-lighter">{event.provider === "razorpay" ? "Razorpay" : "Stripe"}</span>
      </TableCell>
      <TableCell className="min-w-[16rem] py-2.5 align-top">
        {event.deliveries.length === 0 ? (
          <p className="text-xs text-foreground-lighter">
            {routing
              ? "Finding the developer who caused it…"
              : "No one on the team caused this (a test event from the dashboard, or stripe trigger), so it was kept here."}
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {event.deliveries.map((d) => {
              const status = deliveryLabel(d);
              return (
                <li key={d.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-foreground-light">
                  <BadgeLabel tone={status.tone}>{status.text}</BadgeLabel>
                  <span>
                    {d.userEmail} · {d.deviceName}
                  </span>
                  {d.status !== "delivered" && d.lastError && (
                    <span className="text-foreground-lighter">{d.lastError}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </TableCell>
      <TableCell className="py-2.5 align-top text-xs whitespace-nowrap text-foreground-lighter">
        {timeAgo(event.receivedAt)}
      </TableCell>
      <TableCell className="py-2 pr-3 text-right align-top">
        {nobody ? (
          <Button
            size="sm"
            variant="secondary"
            aria-label={`Send ${label} to me`}
            loading={sending}
            onClick={onSendToMe}
          >
            <Send />
            Send to me
          </Button>
        ) : (
          <Button size="sm" variant="ghost" aria-label={`Replay ${label}`} loading={replaying} onClick={onReplay}>
            <RotateCcw />
            Replay
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

/** FR-WH-003: the last 24 h of provider webhooks and where each one went. Mounted only while the log is open. */
export function WebhookLog({ envId }: { envId: string }) {
  const [page, setPage] = useState(1);
  const events = useWebhookEvents(envId, page);
  const replay = useReplayWebhook(envId);
  const sendToMe = useSendWebhookToMe(envId);
  return (
    <QueryState isPending={events.isPending} error={events.error} skeleton={<SkeletonRows rows={4} />}>
      {events.data && events.data.items.length === 0 ? (
        <EmptyState
          title="Nothing in the last 24 hours"
          description="Each Stripe or Razorpay event shows up here and goes only to the developer whose app caused it"
        />
      ) : (
        events.data && (
          <div className="flex flex-col gap-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Delivered to</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="w-24">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.data.items.map((e) => (
                  <EventRow
                    key={e.id}
                    event={e}
                    replaying={replay.isPending && replay.variables === e.id}
                    onReplay={() => replay.mutate(e.id)}
                    sending={sendToMe.isPending && sendToMe.variables === e.id}
                    onSendToMe={() => sendToMe.mutate(e.id)}
                  />
                ))}
              </TableBody>
            </Table>
            <PaginationBar pagination={events.data.pagination} onPage={setPage} />
            <p className="text-xs text-foreground-lighter">Kept for 24 hours</p>
          </div>
        )
      )}
    </QueryState>
  );
}
