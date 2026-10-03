"use client";

import Link from "next/link";
import { CLI_COMMANDS } from "@/constants";
import { DevicesTable } from "@/features/devices/components/devices-table";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { BadgeLabel } from "@/shared/components/badge-label";
import { CopyCommand } from "@/shared/components/copy-command";
import { PageHeader } from "@/shared/components/page-header";
import { Section } from "@/shared/components/section";

/** Developer view: my grants, my devices, CLI quick-start. */
export function MyAccess({ orgId }: { orgId: string }) {
  const projects = useProjects(orgId);
  const accessible =
    projects.data?.flatMap((p) => p.environments.filter((e) => e.hasAccess).map((e) => ({ ...e, project: p }))) ?? [];
  return (
    <>
      <PageHeader
        eyebrow="you"
        title="My access"
        description="What you can run locally, and the devices you are logged in on."
      />
      <Section title="Quick start">
        <div className="flex max-w-xl flex-col gap-2">
          {Object.values(CLI_COMMANDS).map((c) => (
            <CopyCommand key={c} command={c} />
          ))}
        </div>
      </Section>
      <Section title="Environments you can use">
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {accessible.map((e) => (
            <li key={e.id}>
              <Link
                href={`/orgs/${orgId}/projects/${e.project.id}/environments/${e.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
              >
                <span>
                  <span className="text-muted-foreground">{e.project.name} / </span>
                  <span className="font-mono">{e.name}</span>
                </span>
                {e.killed ? (
                  <BadgeLabel tone="warning">disabled</BadgeLabel>
                ) : (
                  <BadgeLabel tone="strong">access</BadgeLabel>
                )}
              </Link>
            </li>
          ))}
          {accessible.length === 0 && (
            <li className="px-4 py-3 text-sm text-subtle">No access yet — ask an admin to grant you an environment.</li>
          )}
        </ul>
      </Section>
      <Section title="My devices">
        <DevicesTable scope="mine" />
      </Section>
    </>
  );
}
