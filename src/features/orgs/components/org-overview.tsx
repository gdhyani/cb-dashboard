"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import type { ReactNode } from "react";
import { ActivityFeed } from "@/features/audit/components/activity-feed";
import { HealthStatus } from "@/features/health";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { KINDS } from "@/features/resources/lib/kinds";
import { useOrgStats } from "@/features/stats";
import { BadgeLabel } from "@/shared/components/badge-label";
import { BlockBars } from "@/shared/components/charts/block-bars";
import { BlockHeatmap } from "@/shared/components/charts/block-heatmap";
import { SegmentMeter } from "@/shared/components/charts/segment-meter";
import { Waffle } from "@/shared/components/charts/waffle";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonChart, SkeletonRows } from "@/shared/components/skeletons";
import { StaggerBlock, StaggerItem } from "@/shared/components/stagger";
import { Skeleton } from "@/shared/ui/skeleton";
import { useOrg } from "../hooks/use-orgs";

const CATEGORY_ROWS = [
  { key: "runtime", label: "Connections" },
  { key: "access", label: "Access" },
  { key: "config", label: "Configuration" },
  { key: "security", label: "Devices" },
  { key: "team", label: "Team" },
] as const;

function StatTile({
  label,
  value,
  trend,
  foot,
  index,
}: {
  label: string;
  value: ReactNode;
  trend?: number[];
  foot?: ReactNode;
  index: number;
}) {
  return (
    <StaggerBlock index={index} className="cb-grid flex min-w-0 flex-col gap-3 rounded-lg border border-border p-4">
      <span className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">{label}</span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</span>
      {trend ? (
        <div className="flex flex-col gap-1.5">
          <SegmentMeter values={trend} />
          <span className="text-xs text-subtle">last 14 days</span>
        </div>
      ) : (
        <span className="text-xs text-subtle">{foot}</span>
      )}
    </StaggerBlock>
  );
}

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-lg border border-border p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium">{title}</h3>
        {description && <p className="text-xs text-subtle">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function OrgOverview({ orgId }: { orgId: string }) {
  const org = useOrg(orgId);
  const projects = useProjects(orgId);
  const stats = useOrgStats(orgId);
  const envs = projects.data?.flatMap((p) => p.environments.map((e) => ({ ...e, project: p }))) ?? [];
  const days = stats.data?.days ?? [];
  const sum = (pick: (d: (typeof days)[number]) => number) => days.reduce((a, d) => a + pick(d), 0);
  const mine = stats.data?.scope === "me";
  const columns = days.map((d) => format(parseISO(d.date), "MMM d"));
  const heatRows = CATEGORY_ROWS.map((c) => ({ label: c.label, values: days.map((d) => d.byCategory[c.key]) }));

  return (
    <>
      <PageHeader breadcrumb="Organization" title={org.data?.name ?? "…"} description={<HealthStatus />} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.isPending ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-lg" />)
        ) : (
          <>
            <StatTile
              index={0}
              label={mine ? "Your connections" : "Connections"}
              value={sum((d) => d.connections)}
              trend={days.map((d) => d.connections)}
            />
            <StatTile index={1} label="Denied" value={sum((d) => d.denied)} trend={days.map((d) => d.denied)} />
            <StatTile
              index={2}
              label="Environments"
              value={envs.length}
              foot={`${envs.filter((e) => e.killed).length} suspended · ${projects.data?.length ?? 0} projects`}
            />
            <StatTile
              index={3}
              label="Members"
              value={org.data?.memberCount ?? "—"}
              foot={`${(stats.data?.grants.permanent ?? 0) + (stats.data?.grants.temporary ?? 0)} active grants`}
            />
          </>
        )}
      </div>

      <Section
        title={mine ? "Your activity" : "Activity"}
        description={
          mine
            ? "Your logins, connections and changes, last 14 days."
            : "Everything that happened in this organization, last 14 days."
        }
      >
        <div className="rounded-lg border border-border p-4 sm:p-5">
          <QueryState isPending={stats.isPending} error={stats.error} skeleton={<SkeletonChart height={170} />}>
            <BlockHeatmap rows={heatRows} columns={columns} />
          </QueryState>
        </div>
      </Section>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Connections by project" description="Brokered connections opened, last 14 days.">
          <QueryState isPending={stats.isPending} error={stats.error} skeleton={<SkeletonRows rows={2} />}>
            <BlockBars
              items={(stats.data?.connectionsByProject ?? [])
                .slice(0, 5)
                .map((p) => ({ label: p.name, value: p.connections }))}
              empty="No projects yet."
            />
          </QueryState>
        </Panel>
        <Panel title="Resources by type" description="Services whose credentials stay on the server.">
          <QueryState isPending={stats.isPending} error={stats.error} skeleton={<SkeletonRows rows={2} />}>
            <Waffle
              groups={(stats.data?.resourcesByKind ?? []).map((r) => ({
                label: KINDS[r.kind as keyof typeof KINDS]?.label ?? r.kind,
                count: r.count,
              }))}
              empty="No resources yet."
            />
            {stats.data && (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-xs text-subtle">{mine ? "Your grants" : "Active grants"}</p>
                <Waffle
                  groups={[
                    { label: "Permanent", count: stats.data.grants.permanent },
                    { label: "Time-limited", count: stats.data.grants.temporary, hollow: true },
                  ]}
                  empty="No developer grants yet."
                />
              </div>
            )}
          </QueryState>
        </Panel>
      </div>

      <Section title="Environments">
        <QueryState isPending={projects.isPending} error={projects.error} skeleton={<SkeletonRows rows={3} />}>
          <ul className="cb-grid-wide flex flex-col divide-y divide-border rounded-lg border border-border">
            {envs.map((e, i) => (
              <StaggerItem key={e.id} index={i}>
                <Link
                  href={`/orgs/${orgId}/projects/${e.project.id}/environments/${e.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="min-w-0 truncate">
                    <span className="text-muted-foreground">{e.project.name} / </span>
                    <span className="font-mono">{e.name}</span>
                  </span>
                  <BadgeLabel tone={e.killed ? "warning" : e.hasAccess ? "strong" : "muted"}>
                    {e.killed ? "Suspended" : e.hasAccess ? "Access granted" : "No access"}
                  </BadgeLabel>
                </Link>
              </StaggerItem>
            ))}
            {envs.length === 0 && <li className="px-4 py-3 text-sm text-subtle">No environments yet.</li>}
          </ul>
        </QueryState>
      </Section>

      {org.isAdmin && (
        <Section title="Recent activity" description="Logins, grants, revocations and connections.">
          <ActivityFeed orgId={orgId} pageSize={30} compact />
        </Section>
      )}
    </>
  );
}
