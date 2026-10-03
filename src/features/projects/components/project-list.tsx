"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { CLI_COMMANDS } from "@/constants";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { useProjects } from "../hooks/use-projects";

export function ProjectList({ orgId, isAdmin }: { orgId: string; isAdmin: boolean }) {
  const projects = useProjects(orgId);
  return (
    <QueryState isPending={projects.isPending} error={projects.error}>
      {projects.data?.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            isAdmin
              ? "Create a project, add resources and variables, then invite developers."
              : "An admin hasn't created any projects yet."
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects.data?.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                href={`/orgs/${orgId}/projects/${p.id}`}
                className="flex h-full flex-col gap-4 rounded-lg border border-border p-5 transition-colors hover:border-ring"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-medium tracking-tight">{p.name}</span>
                  <span className="font-mono text-xs text-subtle">{p.slug}</span>
                  {p.description && <span className="text-sm text-muted-foreground">{p.description}</span>}
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  {p.environments.map((e) => (
                    <BadgeLabel key={e.id} tone={e.killed ? "warning" : e.hasAccess ? "strong" : "muted"}>
                      {`${e.name}${e.killed ? " · off" : e.hasAccess ? "" : " · no access"}`}
                    </BadgeLabel>
                  ))}
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
      {projects.data && projects.data.length > 0 && !isAdmin && (
        <p className="font-mono text-xs text-subtle">
          Use a project locally: {CLI_COMMANDS.login} → {CLI_COMMANDS.init} → {CLI_COMMANDS.run}
        </p>
      )}
    </QueryState>
  );
}
