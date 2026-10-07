"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { StaggerItem } from "@/shared/components/stagger";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useProjectMutations } from "../hooks/use-projects";
import type { Project } from "../types";

export function EnvironmentList({ project, isAdmin }: { project: Project; isAdmin: boolean }) {
  const [name, setName] = useState("");
  const { createEnvironment } = useProjectMutations(project.orgId);
  return (
    <div className="flex flex-col gap-3">
      <ul className="cb-grid-wide flex flex-col divide-y divide-border rounded-lg border border-border">
        {project.environments.map((e, i) => (
          <StaggerItem key={e.id} index={i}>
            <Link
              href={`/orgs/${project.orgId}/projects/${project.id}/environments/${e.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
            >
              <span className="font-mono">{e.name}</span>
              <span className="flex items-center gap-2">
                {e.killed && (
                  <BadgeLabel tone="warning" dot>
                    Suspended
                  </BadgeLabel>
                )}
                <BadgeLabel tone={e.hasAccess ? "success" : "muted"}>
                  {e.hasAccess ? "Access granted" : "No access"}
                </BadgeLabel>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </ul>
      {isAdmin && (
        <form
          method="post"
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(ev) => {
            ev.preventDefault();
            createEnvironment.mutate({ projectId: project.id, name }, { onSuccess: () => setName("") });
          }}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
            placeholder="new environment, e.g. preview"
            className="font-mono sm:max-w-xs"
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
