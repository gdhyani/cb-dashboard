"use client";

import { format } from "date-fns";
import { Activity, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeAgo } from "@/shared/lib/format-time";
import { cn } from "@/shared/lib/utils";
import { useAudit } from "../hooks/use-audit";
import { describe } from "../lib/describe";
import { groupFeed, sessionSummary } from "../lib/group";
import type { AuditEvent } from "../types";

function Line({
  icon: Icon,
  alert,
  children,
  time,
}: {
  icon: LucideIcon;
  alert?: boolean;
  children: ReactNode;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", alert ? "text-destructive" : "text-foreground-lighter")}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 text-sm text-foreground-light">{children}</div>
      <span className="shrink-0 font-mono text-xs tabular-nums text-foreground-lighter">{time}</span>
    </div>
  );
}

function EventLine({ event }: { event: AuditEvent }) {
  const d = describe(event);
  return (
    <Line icon={d.icon} alert={d.alert} time={format(new Date(event.createdAt), "HH:mm")}>
      {d.text} {event.outcome !== "success" && <BadgeLabel tone="warning">{event.outcome}</BadgeLabel>}
    </Line>
  );
}

function SessionLine({ events }: { events: AuditEvent[] }) {
  const first = events[events.length - 1] ?? events[0];
  if (!first) return null;
  const s = sessionSummary(events);
  const facts = [
    s.connections > 0 && `${s.connections} connection${s.connections === 1 ? "" : "s"}`,
    s.calls > 0 && `${s.calls} API call${s.calls === 1 ? "" : "s"}`,
  ].filter(Boolean);
  return (
    <Line icon={Activity} time={format(new Date(first.createdAt), "HH:mm")}>
      <strong className="font-medium text-foreground">{first.actor?.name ?? "Someone"}</strong> used{" "}
      <strong className="font-medium text-foreground">{first.environment?.name ?? "an environment"}</strong>
      {facts.length > 0 && <> · {facts.join(" · ")}</>}
    </Line>
  );
}

/** Compact recent activity for the org overview (placed inside a Card there): a short list, no toolbar or pagination (J8). */
export function ActivityList({ orgId, pageSize = 30 }: { orgId: string; pageSize?: number }) {
  const audit = useAudit(orgId, 1, pageSize);
  const items = groupFeed(audit.data?.items ?? []).slice(0, 8);
  return (
    <QueryState isPending={audit.isPending} error={audit.error} skeleton={<SkeletonRows rows={4} />}>
      {items.length === 0 ? (
        <EmptyState
          icon={<Activity strokeWidth={1.5} />}
          title="No activity yet"
          description="Activity appears as people sign in, change config, get access and run apps"
        />
      ) : (
        <div className="flex flex-col gap-2">
          <ol className="flex flex-col divide-y divide-border">
            {items.map((item, i) => (
              <StaggerItem key={item.kind === "event" ? item.event.id : item.id} index={i}>
                {item.kind === "event" ? <EventLine event={item.event} /> : <SessionLine events={item.events} />}
              </StaggerItem>
            ))}
          </ol>
          <p className="pb-1 text-xs text-foreground-lighter">Updated {timeAgo(audit.data?.items[0]?.createdAt)}</p>
        </div>
      )}
    </QueryState>
  );
}
