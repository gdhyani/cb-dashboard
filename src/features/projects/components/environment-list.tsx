"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useProjectMutations } from "../hooks/use-projects";
import type { Project } from "../types";

export function EnvironmentList({ project, isAdmin }: { project: Project; isAdmin: boolean }) {
  const [name, setName] = useState("");
  const { createEnvironment } = useProjectMutations(project.orgId);
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {project.environments.map((e) => (
          <li key={e.id}>
            <Link
              href={`/orgs/${project.orgId}/projects/${project.id}/environments/${e.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
            >
              <span className="font-mono">{e.name}</span>
              <span className="flex items-center gap-2">
                {e.killed && (
                  <BadgeLabel tone="warning" dot>
                    Suspended
                  </BadgeLabel>
                )}
                <BadgeLabel tone={e.hasAccess ? "strong" : "muted"}>
                  {e.hasAccess ? "Access granted" : "No access"}
                </BadgeLabel>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <form
          className="flex gap-2"
          onSubmit={(ev) => {
            ev.preventDefault();
            createEnvironment.mutate({ projectId: project.id, name }, { onSuccess: () => setName("") });
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
            placeholder="new environment, e.g. preview"
            className="max-w-xs font-mono"
            aria-label="New environment name"
          />
          <Button variant="outline" type="submit" disabled={!name.trim()}>
            Create environment
          </Button>
        </form>
      )}
    </div>
  );
}
