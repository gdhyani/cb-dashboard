"use client";

import type { Project } from "../types";
import { CreateEnvironmentDialog } from "./create-environment-dialog";
import { EnvironmentTable } from "./environment-table";

/** Project › Overview: the project's environments; admins add one with the dashed "New environment" button. */
export function EnvironmentList({ project, isAdmin }: { project: Project; isAdmin: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <EnvironmentTable
        orgId={project.orgId}
        rows={project.environments.map((environment) => ({ environment, project }))}
        empty="No environments yet"
      />
      {isAdmin && (
        <div>
          <CreateEnvironmentDialog project={project} />
        </div>
      )}
    </div>
  );
}
