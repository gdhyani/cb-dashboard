"use client";

import { CLI_COMMANDS } from "@/constants";
import { DevicesTable } from "@/features/devices/components/devices-table";
import { EnvironmentTable, useProjects } from "@/features/projects";
import { CopyCommand } from "@/shared/components/copy-command";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const QUICK_START = [
  { step: "Add the package to your app", command: CLI_COMMANDS.install },
  { step: "Sign in from this laptop", command: CLI_COMMANDS.login },
  { step: "Link the folder to a project", command: CLI_COMMANDS.init },
  { step: "Run your app as usual", command: CLI_COMMANDS.run },
] as const;

/** Developer view: the environments I can use, a CLI quick start, my devices. */
export function MyAccess({ orgId }: { orgId: string }) {
  const projects = useProjects(orgId);
  const rows =
    projects.data?.flatMap((p) =>
      p.environments.filter((e) => e.hasAccess).map((environment) => ({ environment, project: p })),
    ) ?? [];
  return (
    <>
      <PageHeader title="My Access" description="What you can run locally and the devices you are signed in on" />

      <Section title="Environments" description="Environments you have been granted access to">
        <QueryState isPending={projects.isPending} error={projects.error} skeleton={<SkeletonRows rows={2} />}>
          <EnvironmentTable
            orgId={orgId}
            rows={rows}
            showProject
            empty="No access yet — ask an admin to grant you an environment"
          />
        </QueryState>
      </Section>

      <Section title="Quick start" description="Run any environment you can use from your laptop">
        <Card>
          <CardHeader>
            <CardTitle>CLI</CardTitle>
            <CardDescription>Your app keeps its usual SDKs; real credentials never reach your laptop</CardDescription>
          </CardHeader>
          {QUICK_START.map((s, i) => (
            <CardContent key={s.command} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <span className="flex shrink-0 items-center gap-3 text-sm text-foreground sm:w-60">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong font-mono text-[10px] text-foreground-lighter">
                  {i + 1}
                </span>
                {s.step}
              </span>
              <div className="min-w-0 flex-1">
                <CopyCommand command={s.command} />
              </div>
            </CardContent>
          ))}
        </Card>
      </Section>

      <Section title="Devices" description="Laptops you are signed in on with the CLI">
        <DevicesTable scope="mine" />
      </Section>
    </>
  );
}
