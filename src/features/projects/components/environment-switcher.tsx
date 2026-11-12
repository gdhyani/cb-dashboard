"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeLabel } from "@/shared/components/badge-label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import { useProject } from "../hooks/use-projects";

/**
 * Top-bar environment switcher (Supabase's branch switcher position). Keeps the current sub-page when switching:
 * from …/env-a/access you land on …/env-b/access.
 */
export function EnvironmentSwitcher({ orgId, projectId, envId }: { orgId: string; projectId: string; envId: string }) {
  const pathname = usePathname();
  const project = useProject(projectId);
  const envs = project.data?.environments ?? [];
  const current = envs.find((e) => e.id === envId);
  const base = `/orgs/${orgId}/projects/${projectId}/environments`;
  const subPage = pathname.split(`/environments/${envId}`)[1] ?? "";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Switch environment"
        className="flex h-7 min-w-0 items-center gap-2 rounded-md px-1.5 text-sm text-foreground transition-colors hover:bg-accent data-[state=open]:bg-accent"
      >
        {current ? <span className="truncate">{current.name}</span> : <Skeleton className="h-4 w-20" />}
        {current?.killed && <BadgeLabel tone="warning">Suspended</BadgeLabel>}
        <ChevronsUpDown className="size-3.5 shrink-0 text-foreground-lighter" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Environments</DropdownMenuLabel>
        {envs.map((e) => (
          <DropdownMenuItem key={e.id} asChild>
            <Link href={`${base}/${e.id}${subPage}`}>
              <span className="min-w-0 flex-1 truncate">{e.name}</span>
              {e.killed && <span className="size-1.5 rounded-full bg-warning" title="Suspended" />}
              {e.id === envId && <Check className="!text-foreground" aria-label="Current environment" />}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
