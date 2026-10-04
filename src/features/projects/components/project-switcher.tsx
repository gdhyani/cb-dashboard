"use client";

import { Check, ChevronsUpDown, FolderKanban, Plus, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { cn } from "@/shared/lib/utils";
import { Command, CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { Kbd } from "@/shared/ui/kbd";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Skeleton } from "@/shared/ui/skeleton";
import { useProjects } from "../hooks/use-projects";
import type { Project } from "../types";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectMark } from "./project-mark";

const CREATE_HINT = "Starts with development and staging environments.";

/**
 * Navbar project switcher. Desktop: a dropdown anchored under the trigger. Phones: the same list in a
 * panel from the top. Both: search, a check on the current project, and "Create project" for admins.
 */
export function ProjectSwitcher({ orgId, canCreate }: { orgId: string; canCreate: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const projects = useProjects(orgId);
  const desktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const currentId = pathname.match(/\/projects\/([^/]+)/)?.[1];
  const current = projects.data?.find((p) => p.id === currentId);
  // biome-ignore lint/correctness/useExhaustiveDependencies: close on every route change
  useEffect(() => setOpen(false), [pathname]);

  const select = (projectId: string) => {
    setOpen(false);
    router.push(`/orgs/${orgId}/projects/${projectId}`);
  };
  const startCreate = () => {
    setOpen(false);
    setCreating(true);
  };

  const body = (trailing: React.ReactNode) => (
    <SwitcherBody
      projects={projects.data}
      currentId={currentId}
      onSelect={select}
      onCreate={canCreate ? startCreate : undefined}
      showHint={!desktop}
      trailing={trailing}
    />
  );

  return (
    <>
      <Popover open={desktop && open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Switch project"
            className="flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-white/[0.06]"
          >
            {current && <ProjectMark name={current.name} />}
            <span className="truncate">
              {current?.name ?? (currentId ? <Skeleton className="h-4 w-24" /> : "All projects")}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-subtle" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]">
          <Command loop>{body(<Kbd>Esc</Kbd>)}</Command>
        </PopoverContent>
      </Popover>
      <CommandDialog open={!desktop && open} onOpenChange={setOpen} title="Switch project">
        {body(
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="-mr-1.5 rounded-md p-1.5 text-subtle transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            <X className="size-4" />
          </button>,
        )}
      </CommandDialog>
      {canCreate && (
        <CreateProjectDialog
          orgId={orgId}
          open={creating}
          onOpenChange={setCreating}
          onCreated={(p) => router.push(`/orgs/${orgId}/projects/${p.id}`)}
        />
      )}
    </>
  );
}

function SwitcherBody({
  projects,
  currentId,
  onSelect,
  onCreate,
  showHint,
  trailing,
}: {
  projects: Project[] | undefined;
  currentId: string | undefined;
  onSelect: (projectId: string) => void;
  onCreate?: () => void;
  showHint: boolean;
  trailing: React.ReactNode;
}) {
  return (
    <>
      <CommandInput placeholder="Find project…" trailing={trailing} />
      <CommandList>
        {!projects && [0, 1, 2].map((i) => <Skeleton key={i} className="mx-2.5 my-2.5 h-5 w-40" />)}
        {projects?.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-lg border border-border-strong">
              <FolderKanban className="size-4 text-muted-foreground" />
            </span>
            <p className="max-w-60 text-sm text-muted-foreground">
              Projects you create appear here for quick switching.
            </p>
          </div>
        ) : (
          <CommandEmpty>No projects match.</CommandEmpty>
        )}
        {projects?.map((p) => (
          <CommandItem
            key={p.id}
            value={`${p.name} ${p.slug} ${p.id}`}
            onSelect={() => onSelect(p.id)}
            className={cn(p.id === currentId && "text-foreground")}
          >
            <ProjectMark name={p.name} />
            <span className="min-w-0 flex-1 truncate">{p.name}</span>
            {p.environments.some((e) => e.killed) && (
              <span
                className="size-1.5 shrink-0 rounded-full bg-muted-foreground"
                title="Has a suspended environment"
              />
            )}
            {p.id === currentId && <Check className="!text-foreground" aria-label="Current project" />}
          </CommandItem>
        ))}
      </CommandList>
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-left text-sm transition-colors hover:bg-white/[0.04]"
        >
          <Plus className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">Create project</span>
            {showHint && <span className="text-xs text-subtle">{CREATE_HINT}</span>}
          </span>
        </button>
      )}
    </>
  );
}
