"use client";

import { format, isToday, isYesterday } from "date-fns";
import { Activity, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { PaginationBar } from "@/shared/components/pagination-bar";
import { QueryState } from "@/shared/components/query-state";
import { timeAgo } from "@/shared/lib/format-time";
import { cn } from "@/shared/lib/utils";
import { useAudit } from "../hooks/use-audit";
import { describe } from "../lib/describe";
import { type FeedItem, groupFeed, sessionSummary } from "../lib/group";
import type { AuditCategory, AuditEvent } from "../types";

const FILTERS: { value: AuditCategory | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "access", label: "Access" },
  { value: "team", label: "Team" },
  { value: "config", label: "Config" },
  { value: "security", label: "Devices" },
  { value: "runtime", label: "Usage" },
];

function dayLabel(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, d MMMM");
}

function Context({ event }: { event: AuditEvent }) {
  const parts = [event.project?.name, event.environment?.name].filter(Boolean);
  return parts.length > 0 ? <span className="font-mono text-xs text-subtle">{parts.join(" / ")}</span> : null;
}

function Time({ iso }: { iso: string }) {
  return (
    <time
      dateTime={iso}
      title={new Date(iso).toLocaleString()}
      className="shrink-0 font-mono text-xs tabular-nums text-subtle"
    >
      {format(new Date(iso), "HH:mm")}
    </time>
  );
}

function EventRow({ event, nested = false }: { event: AuditEvent; nested?: boolean }) {
  const d = describe(event);
  const Icon = d.icon;
  return (
    <li className={cn("flex items-start gap-3 py-2.5", nested && "py-1.5 pl-9")}>
      <span
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border",
          d.alert ? "border-destructive/50 text-destructive" : "border-border text-muted-foreground",
          nested && "size-5 border-transparent",
        )}
      >
        <Icon className={nested ? "size-3.5" : "size-3.5"} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className={cn("text-sm text-muted-foreground", nested && "text-[13px]")}>{d.text}</p>
        {!nested && <Context event={event} />}
      </div>
      {event.outcome !== "success" && <BadgeLabel tone="warning">{event.outcome}</BadgeLabel>}
      <Time iso={event.createdAt} />
    </li>
  );
}

function SessionRow({ events }: { events: AuditEvent[] }) {
  const [open, setOpen] = useState(false);
  const first = events[events.length - 1] ?? events[0];
  const last = events[0];
  if (!first || !last) return null;
  const s = sessionSummary(events);
  const facts = [
    s.connections > 0 && `${s.connections} connection${s.connections === 1 ? "" : "s"}`,
    s.calls > 0 && `${s.calls} API call${s.calls === 1 ? "" : "s"}`,
  ].filter(Boolean);
  return (
    <li className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-start gap-3 py-2.5 text-left"
      >
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
          <Activity className="size-3.5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">{first.actor?.name ?? "Someone"}</strong> used{" "}
            <strong className="font-medium text-foreground">{first.environment?.name ?? "an environment"}</strong>
            {facts.length > 0 && <> · {facts.join(" · ")}</>}
          </p>
          <span className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-subtle">
            {first.project?.name}
            {s.resources.length > 0 && <span>· {s.resources.join(", ")}</span>}
            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
              <ChevronRight className={cn("size-3 transition-transform", open && "rotate-90")} />
              {open ? "hide" : `${events.length} events`}
            </span>
          </span>
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">
          {format(new Date(first.createdAt), "HH:mm")}–{format(new Date(last.createdAt), "HH:mm")}
        </span>
      </button>
      {open && (
        <ul className="mb-2 flex flex-col border-l border-border ml-3">
          {[...events].reverse().map((e) => (
            <EventRow key={e.id} event={e} nested />
          ))}
        </ul>
      )}
    </li>
  );
}

function newestOf(item: FeedItem): string {
  return item.kind === "event" ? item.event.createdAt : (item.events[0]?.createdAt ?? "");
}

/** J8: readable activity — sentences, day headers, sessions for runtime noise, category filters. */
export function ActivityFeed({
  orgId,
  pageSize = 50,
  compact = false,
}: {
  orgId: string;
  pageSize?: number;
  compact?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<AuditCategory | undefined>();
  const audit = useAudit(orgId, page, pageSize, category);
  const items = groupFeed(audit.data?.items ?? []);
  let lastDay = "";

  return (
    <div className="flex flex-col gap-4">
      {!compact && (
        <div role="tablist" aria-label="Filter activity" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              role="tab"
              aria-selected={category === f.value}
              onClick={() => {
                setCategory(f.value);
                setPage(1);
              }}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm transition-colors",
                category === f.value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      <QueryState isPending={audit.isPending} error={audit.error} rows={compact ? 4 : 8}>
        {items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Activity appears as people log in, change config, get access and run apps."
          />
        ) : (
          <ol className="flex flex-col">
            {(compact ? items.slice(0, 8) : items).map((item) => {
              const day = dayLabel(newestOf(item));
              const header = day !== lastDay;
              lastDay = day;
              return (
                <Fragment key={item.kind === "event" ? item.event.id : item.id}>
                  {header && !compact && (
                    <li className="pt-4 pb-1 font-mono text-xs uppercase tracking-[0.2em] text-subtle first:pt-0">
                      {day}
                    </li>
                  )}
                  <li className="list-none border-b border-border/60 last:border-b-0">
                    <ul>
                      {item.kind === "event" ? <EventRow event={item.event} /> : <SessionRow events={item.events} />}
                    </ul>
                  </li>
                </Fragment>
              );
            })}
          </ol>
        )}
        {!compact && audit.data && <PaginationBar pagination={audit.data.pagination} onPage={setPage} />}
        {compact && audit.data && audit.data.items.length > 0 && (
          <p className="font-mono text-xs text-subtle">Updated {timeAgo(audit.data.items[0]?.createdAt)}</p>
        )}
      </QueryState>
    </div>
  );
}
