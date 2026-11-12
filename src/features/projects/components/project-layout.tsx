"use client";

import type { ReactNode } from "react";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { SideMenu, type SideMenuGroup } from "@/shared/components/side-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import { useProject } from "../hooks/use-projects";

/** Every project page: the product menu (project pages + its environments) beside the page, from lg up. */
export function ProjectLayout({
  orgId,
  projectId,
  children,
}: {
  orgId: string;
  projectId: string;
  children: ReactNode;
}) {
  const org = useOrg(orgId);
  const project = useProject(projectId);
  const base = `/orgs/${orgId}/projects/${projectId}`;
  const groups: SideMenuGroup[] = [
    {
      title: "Project",
      items: [
        { href: base, label: "Overview", exact: true },
        ...(org.isAdmin
          ? [
              { href: `${base}/access`, label: "Access" },
              { href: `${base}/settings`, label: "Settings" },
            ]
          : []),
      ],
    },
    {
      title: "Environments",
      items: (project.data?.environments ?? []).map((e) => ({
        href: `${base}/environments/${e.id}`,
        label: e.name,
        trailing: e.killed ? (
          <span className="size-1.5 shrink-0 rounded-full bg-warning" role="img" aria-label="Suspended" />
        ) : undefined,
      })),
    },
  ];
  return (
    <div className="flex min-h-full flex-1">
      <aside className="sticky top-12 hidden h-[calc(100dvh-3rem)] w-64 shrink-0 border-r border-border lg:block">
        <SideMenu label="Project" title={project.data?.name ?? <Skeleton className="h-4 w-32" />} groups={groups} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
