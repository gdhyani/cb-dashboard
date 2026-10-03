"use client";

import { useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { PaginationBar } from "@/shared/components/pagination-bar";
import { QueryState } from "@/shared/components/query-state";
import { Timeline } from "@/shared/components/timeline";
import { timeAgo } from "@/shared/lib/format-time";
import { useAudit } from "../hooks/use-audit";
import type { AuditEvent } from "../types";

const LANES: Record<string, number> = {
  org: 0,
  member: 0,
  device: 1,
  project: 2,
  environment: 2,
  resource: 2,
  variable: 2,
  grant: 3,
  agent: 4,
  tunnel: 4,
  http: 4,
};

function describe(e: AuditEvent): string {
  const who = e.actor?.name ?? "system";
  const what = e.action.replaceAll(".", " ").replaceAll("_", " ");
  return `${who} · ${what}${e.target ? ` · ${e.target}` : ""}`;
}

/** J8: audit trail as a git-graph style timeline; lanes group org, devices, config, access and runtime. */
export function AuditFeed({
  orgId,
  pageSize = 25,
  compact = false,
}: {
  orgId: string;
  pageSize?: number;
  compact?: boolean;
}) {
  const [page, setPage] = useState(1);
  const audit = useAudit(orgId, page, pageSize);
  return (
    <QueryState isPending={audit.isPending} error={audit.error} rows={compact ? 4 : 8}>
      <div className="flex flex-col gap-4">
        <Timeline
          lanes={5}
          items={(audit.data?.items ?? []).map((e) => ({
            id: e.id,
            lane: LANES[e.action.split(".")[0] ?? ""] ?? 0,
            emphasis:
              e.outcome === "success" && !/revoked|killed|removed|expired/.test(e.action) ? "normal" : "warning",
            title: <span className="text-foreground">{describe(e)}</span>,
            meta: e.outcome !== "success" ? <BadgeLabel tone="warning">{e.outcome}</BadgeLabel> : undefined,
            time: timeAgo(e.createdAt),
          }))}
        />
        {!compact && audit.data && <PaginationBar pagination={audit.data.pagination} onPage={setPage} />}
      </div>
    </QueryState>
  );
}
