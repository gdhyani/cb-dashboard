"use client";

import Link from "next/link";
import { ActivityFeed } from "@/features/audit/components/activity-feed";
import { HealthStatus } from "@/features/health";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { BadgeLabel } from "@/shared/components/badge-label";
import { PageHeader } from "@/shared/components/page-header";
import { Section } from "@/shared/components/section";
import { useOrg } from "../hooks/use-orgs";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 border-l border-border pl-4">
      <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">{label}</span>
    </div>
  );
}

export function OrgOverview({ orgId }: { orgId: string }) {
  const org = useOrg(orgId);
  const projects = useProjects(orgId);
  const envs = projects.data?.flatMap((p) => p.environments.map((e) => ({ ...e, project: p }))) ?? [];
  return (
    <>
      <PageHeader eyebrow="organization" title={org.data?.name ?? "…"} description={<HealthStatus />} />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat label="projects" value={projects.data?.length ?? "—"} />
        <Stat label="environments" value={envs.length || "—"} />
        <Stat label="members" value={org.data?.memberCount ?? "—"} />
        <Stat label="disabled" value={envs.filter((e) => e.killed).length} />
      </div>
      <Section title="Environments">
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {envs.map((e) => (
            <li key={e.id}>
              <Link
                href={`/orgs/${orgId}/projects/${e.project.id}/environments/${e.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
              >
                <span>
                  <span className="text-muted-foreground">{e.project.name} / </span>
                  <span className="font-mono">{e.name}</span>
                </span>
                <BadgeLabel tone={e.killed ? "warning" : e.hasAccess ? "strong" : "muted"}>
                  {e.killed ? "disabled" : e.hasAccess ? "access" : "no access"}
                </BadgeLabel>
              </Link>
            </li>
          ))}
          {envs.length === 0 && <li className="px-4 py-3 text-sm text-subtle">No environments yet.</li>}
        </ul>
      </Section>
      {org.isAdmin && (
        <Section title="Recent activity" description="Logins, grants, revocations and connections.">
          <ActivityFeed orgId={orgId} pageSize={30} compact />
        </Section>
      )}
    </>
  );
}
