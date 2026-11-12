"use client";

import { format } from "date-fns";
import { Activity, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { PaginationBar } from "@/shared/components/pagination-bar";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { useTableQuery } from "@/shared/hooks/use-table-query";
import { cn } from "@/shared/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useAudit } from "../hooks/use-audit";
import { auditFilters, auditSearchFields, CATEGORY_OPTIONS, logTime, OUTCOME_OPTIONS } from "../lib/audit-query";
import { describe } from "../lib/describe";
import { groupFeed, sessionSummary } from "../lib/group";
import type { AuditCategory, AuditEvent } from "../types";

const COLUMNS = 5;
const OUTCOME_TONE = { success: "success", denied: "warning", error: "danger" } as const;

function Outcome({ outcome }: { outcome: AuditEvent["outcome"] }) {
  return (
    <BadgeLabel tone={OUTCOME_TONE[outcome]}>
      {OUTCOME_OPTIONS.find((o) => o.value === outcome)?.label ?? outcome}
    </BadgeLabel>
  );
}

function Actor({ actor }: { actor: AuditEvent["actor"] }) {
  if (!actor) return <span className="text-foreground-lighter">System</span>;
  return (
    <span className="flex min-w-0 items-center gap-2" title={actor.email}>
      <AvatarInitials name={actor.name} size="sm" />
      <span className="truncate">{actor.name}</span>
    </span>
  );
}

function Where({ event }: { event: AuditEvent }) {
  const parts = [event.project?.name, event.environment?.name].filter(Boolean);
  return parts.length > 0 ? (
    <span className="block truncate font-mono text-xs text-foreground-lighter">{parts.join(" / ")}</span>
  ) : (
    <span className="text-foreground-muted">—</span>
  );
}

function EventRow({ event, nested = false }: { event: AuditEvent; nested?: boolean }) {
  const d = describe(event);
  const Icon = d.icon;
  return (
    <TableRow className={cn(nested && "bg-surface-75")}>
      <TableCell className="py-2 font-mono text-xs whitespace-nowrap text-foreground-lighter tabular-nums">
        <time dateTime={event.createdAt} title={new Date(event.createdAt).toLocaleString()}>
          {logTime(event.createdAt)}
        </time>
      </TableCell>
      <TableCell className="py-2">{!nested && <Actor actor={event.actor} />}</TableCell>
      <TableCell className={cn("py-2", nested && "pl-10")}>
        <span className="flex items-start gap-2 text-foreground-light">
          <Icon
            className={cn("mt-0.5 size-4 shrink-0", d.alert ? "text-destructive" : "text-foreground-lighter")}
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="min-w-0">{d.text}</span>
        </span>
      </TableCell>
      <TableCell className="py-2">
        <Where event={event} />
      </TableCell>
      <TableCell className="py-2">
        <Outcome outcome={event.outcome} />
      </TableCell>
    </TableRow>
  );
}

/** Runtime noise from one run, collapsed into a row that expands to its events. */
function SessionRows({ events }: { events: AuditEvent[] }) {
  const [open, setOpen] = useState(false);
  const first = events[events.length - 1] ?? events[0];
  const last = events[0];
  if (!first || !last) return null;
  const s = sessionSummary(events);
  const facts = [
    s.connections > 0 && `${s.connections} connection${s.connections === 1 ? "" : "s"}`,
    s.calls > 0 && `${s.calls} API call${s.calls === 1 ? "" : "s"}`,
    s.resources.length > 0 && s.resources.join(", "),
  ].filter(Boolean);
  return (
    <>
      <TableRow>
        <TableCell className="py-2 font-mono text-xs whitespace-nowrap text-foreground-lighter tabular-nums">
          {logTime(first.createdAt)}–{format(new Date(last.createdAt), "HH:mm:ss")}
        </TableCell>
        <TableCell className="py-2">
          <Actor actor={first.actor} />
        </TableCell>
        <TableCell className="py-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex items-start gap-2 text-left text-foreground-light hover:text-foreground"
          >
            <Activity className="mt-0.5 size-4 shrink-0 text-foreground-lighter" strokeWidth={1.5} aria-hidden="true" />
            <span className="min-w-0">
              Used{" "}
              <strong className="font-medium text-foreground">{first.environment?.name ?? "an environment"}</strong>
              {facts.length > 0 && <> · {facts.join(" · ")}</>}
              <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-foreground-lighter">
                <ChevronRight className={cn("size-3 transition-transform", open && "rotate-90")} aria-hidden="true" />
                {open ? "Hide events" : `${events.length} events`}
              </span>
            </span>
          </button>
        </TableCell>
        <TableCell className="py-2">
          <Where event={first} />
        </TableCell>
        <TableCell className="py-2">
          <Outcome outcome="success" />
        </TableCell>
      </TableRow>
      {open && events.map((e) => <EventRow key={e.id} event={e} nested />)}
    </>
  );
}

/**
 * J8 Activity, Studio logs-explorer style: search and outcome filter over the loaded page, category filter on the
 * server, a dense table with runtime sessions collapsed, pagination below.
 */
export function ActivityLog({ orgId, pageSize = 50 }: { orgId: string; pageSize?: number }) {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<AuditCategory | undefined>();
  const audit = useAudit(orgId, page, pageSize, category);
  const q = useTableQuery({ rows: audit.data?.items, fields: auditSearchFields, filters: auditFilters });
  const items = groupFeed(q.rows);
  const unfiltered = !category && q.total === 0;

  return (
    <div className="flex flex-col gap-3">
      <TableToolbar
        search={q.search}
        onSearch={q.setSearch}
        placeholder="Search actor, action or target…"
        count={q.rows.length}
        total={q.total}
        noun="event"
        onClear={() => {
          q.clear();
          setCategory(undefined);
          setPage(1);
        }}
        filters={
          <>
            <Select
              value={category ?? "all"}
              onValueChange={(v) => {
                setCategory(v === "all" ? undefined : (v as AuditCategory));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-[28px] w-auto text-xs" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={q.filter("outcome")} onValueChange={(v) => q.setFilter("outcome", v)}>
              <SelectTrigger className="h-[28px] w-auto text-xs" aria-label="Filter by outcome">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any outcome</SelectItem>
                {OUTCOME_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
      <QueryState isPending={audit.isPending} error={audit.error} skeleton={<SkeletonRows rows={8} />}>
        {unfiltered ? (
          <EmptyState
            icon={<Activity strokeWidth={1.5} />}
            title="No activity yet"
            description="Activity appears as people sign in, change config, get access and run apps"
          />
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Time</TableHead>
                <TableHead className="w-40">Actor</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="w-48">Where</TableHead>
                <TableHead className="w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={COLUMNS} className="text-foreground-lighter">
                    No events match your filters
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <Fragment key={item.kind === "event" ? item.event.id : item.id}>
                    {item.kind === "event" ? <EventRow event={item.event} /> : <SessionRows events={item.events} />}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        )}
        {audit.data && <PaginationBar pagination={audit.data.pagination} onPage={setPage} />}
      </QueryState>
    </div>
  );
}
