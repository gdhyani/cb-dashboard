"use client";

import { format, parseISO } from "date-fns";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ActivityFeed } from "@/features/audit";
import { HealthStatus } from "@/features/health";
import { EnvironmentTable, useProjects } from "@/features/projects";
import { KINDS } from "@/features/resources";
import { useOrgStats } from "@/features/stats";
import { BlockBars } from "@/shared/components/charts/block-bars";
import { BlockHeatmap } from "@/shared/components/charts/block-heatmap";
import { SegmentMeter } from "@/shared/components/charts/segment-meter";
import { Waffle } from "@/shared/components/charts/waffle";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonChart, SkeletonRows } from "@/shared/components/skeletons";
import { StaggerBlock } from "@/shared/components/stagger";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useOrg } from "../hooks/use-orgs";

const CATEGORY_ROWS = [
  { key: "runtime", label: "Connections" },
  { key: "access", label: "Access" },
  { key: "config", label: "Configuration" },
  { key: "security", label: "Devices" },
  { key: "team", label: "Team" },
] as const;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Studio metric card: micro label, a large tabular number, a caption (or a 14-day meter). */
function MetricCard({
  label,
  value,
  trend,
  caption,
  index,
}: {
  label: string;
  value: ReactNode;
  trend?: number[];
  caption?: ReactNode;
  index: number;
}) {
  return (
    <StaggerBlock index={index} className="min-w-0">
      <Card className="h-full">
        <CardContent className="flex h-full flex-col gap-2">
          <span className="heading-meta truncate text-foreground-lighter">{label}</span>
          <span className="text-2xl text-foreground tabular-nums">{value}</span>
          {trend && <SegmentMeter values={trend} />}
          <span className="mt-auto truncate text-xs text-foreground-lighter">{trend ? "Last 14 days" : caption}</span>
        </CardContent>
      </Card>
    </StaggerBlock>
  );
}

/** A chart in a Card: micro title + description in the header band, the chart below. */
function ChartCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="flex min-w-0 flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children}
    </Card>
  );
}

/** Org home (Studio style): health, KPIs, activity charts, environments and recent activity. */
export function OrgOverview({ orgId }: { orgId: string }) {
  const org = useOrg(orgId);
  const projects = useProjects(orgId);
  const stats = useOrgStats(orgId);
  const envRows =
    projects.data?.flatMap((p) => p.environments.map((environment) => ({ environment, project: p }))) ?? [];
  const days = stats.data?.days ?? [];
  const sum = (pick: (d: (typeof days)[number]) => number) => days.reduce((a, d) => a + pick(d), 0);
  const mine = stats.data?.scope === "me";
  const columns = days.map((d) => format(parseISO(d.date), "MMM d"));
  const heatRows = CATEGORY_ROWS.map((c) => ({ label: c.label, values: days.map((d) => d.byCategory[c.key]) }));
  const suspended = envRows.filter((r) => r.environment.killed).length;
  const grants = (stats.data?.grants.permanent ?? 0) + (stats.data?.grants.temporary ?? 0);

  return (
    <>
      <PageHeader
        title={org.data?.name ?? "…"}
        description={
          mine ? "Your access and activity in this organization" : "Usage, access and activity across your projects"
        }
        actions={<HealthStatus />}
      />

      <div className="grid grid-cols-2 gap-3 pt-8 lg:grid-cols-4">
        {stats.isPending ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[124px] rounded-lg" />)
        ) : (
          <>
            <MetricCard
              index={0}
              label={mine ? "Your connections" : "Connections"}
              value={sum((d) => d.connections)}
              trend={days.map((d) => d.connections)}
            />
            <MetricCard index={1} label="Denied" value={sum((d) => d.denied)} trend={days.map((d) => d.denied)} />
            <MetricCard
              index={2}
              label="Environments"
              value={envRows.length}
              caption={`${suspended} suspended · ${plural(projects.data?.length ?? 0, "project")}`}
            />
            <MetricCard
              index={3}
              label="Members"
              value={org.data?.memberCount ?? "—"}
              caption={`${plural(grants, "active grant")}`}
            />
          </>
        )}
      </div>

      <Section
        title={mine ? "Your activity" : "Activity"}
        description={
          mine
            ? "Your sign-ins, connections and changes over the last 14 days"
            : "Everything that happened in this organization over the last 14 days"
        }
      >
        <ChartCard title="By category" description="Darker blocks mean a busier day for that row">
          <CardContent>
            <QueryState isPending={stats.isPending} error={stats.error} skeleton={<SkeletonChart height={170} />}>
              <BlockHeatmap rows={heatRows} columns={columns} />
            </QueryState>
          </CardContent>
        </ChartCard>

        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="Connections by project" description="Brokered connections opened, last 14 days">
            <CardContent className="flex-1">
              <QueryState isPending={stats.isPending} error={stats.error} skeleton={<SkeletonRows rows={2} />}>
                <BlockBars
                  items={(stats.data?.connectionsByProject ?? [])
                    .slice(0, 5)
                    .map((p) => ({ label: p.name, value: p.connections }))}
                  empty="No projects yet"
                />
              </QueryState>
            </CardContent>
          </ChartCard>
          <ChartCard title="Services by type" description="Services whose credentials stay on the server">
            <CardContent>
              <QueryState isPending={stats.isPending} error={stats.error} skeleton={<SkeletonRows rows={2} />}>
                <Waffle
                  groups={(stats.data?.resourcesByKind ?? []).map((r) => ({
                    label: KINDS[r.kind as keyof typeof KINDS]?.label ?? r.kind,
                    count: r.count,
                  }))}
                  empty="No services yet"
                />
              </QueryState>
            </CardContent>
            {stats.data && (
              <CardContent className="flex flex-col gap-3">
                <span className="heading-meta text-foreground-lighter">{mine ? "Your grants" : "Active grants"}</span>
                <Waffle
                  groups={[
                    { label: "Permanent", count: stats.data.grants.permanent },
                    { label: "Time-limited", count: stats.data.grants.temporary, hollow: true },
                  ]}
                  empty="No developer grants yet"
                />
              </CardContent>
            )}
          </ChartCard>
        </div>
      </Section>

      <Section
        title="Environments"
        description="Every environment across your projects"
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href={`/orgs/${orgId}/projects`}>View projects</Link>
          </Button>
        }
      >
        <QueryState isPending={projects.isPending} error={projects.error} skeleton={<SkeletonRows rows={3} />}>
          <EnvironmentTable orgId={orgId} rows={envRows} showProject empty="No environments yet" />
        </QueryState>
      </Section>

      {org.isAdmin && (
        <Section
          title="Recent activity"
          description="Sign-ins, grants, revocations and connections"
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link href={`/orgs/${orgId}/audit`}>
                View all activity
                <ArrowRight strokeWidth={1.5} />
              </Link>
            </Button>
          }
        >
          <Card>
            <CardContent className="py-2">
              <ActivityFeed orgId={orgId} pageSize={30} compact />
            </CardContent>
          </Card>
        </Section>
      )}
    </>
  );
}
