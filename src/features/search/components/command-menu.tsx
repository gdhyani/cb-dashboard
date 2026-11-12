"use client";

import { BookOpen, Copy, FolderKanban, Layers, LogOut, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CLI_COMMANDS, DOCS_PATH } from "@/constants";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { useMembers } from "@/features/members/hooks/use-members";
import { orgNav } from "@/features/orgs/components/org-sidebar";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { notifySuccess } from "@/shared/lib/notify";
import { cn } from "@/shared/lib/utils";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/ui/command";
import { Kbd } from "@/shared/ui/kbd";

/** ⌘K / Ctrl+K anywhere opens the palette. */
export function useCommandShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}

/** Studio's search pill in the top bar; an icon button on phones. */
export function SearchButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search"
      className={cn(
        "flex h-8 w-8 items-center justify-center gap-2 rounded-full text-foreground-lighter transition-colors hover:bg-accent hover:text-foreground sm:h-[30px] sm:w-56 sm:justify-start sm:border sm:border-border-strong sm:bg-surface-75 sm:px-3 sm:hover:border-border-stronger sm:hover:bg-surface-75",
        className,
      )}
    >
      <Search className="size-4 shrink-0" strokeWidth={1.5} />
      <span className="hidden flex-1 text-left text-xs sm:inline">Search...</span>
      <span className="hidden items-center gap-0.5 sm:flex">
        <Kbd className="h-[18px] min-w-[18px] text-[10px]">⌘</Kbd>
        <Kbd className="h-[18px] min-w-[18px] text-[10px]">K</Kbd>
      </span>
    </button>
  );
}

/** Jump to any page, project, environment or member. */
export function CommandMenu({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const org = useOrg(orgId);
  const projects = useProjects(orgId);
  const members = useMembers(orgId);
  const logout = useLogout();
  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };
  const envs = projects.data?.flatMap((p) => p.environments.map((e) => ({ ...e, project: p }))) ?? [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search">
      <CommandInput placeholder="Search projects, environments, people…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Go to">
          {orgNav(orgId, org.isAdmin).map(({ href, label, icon: Icon }) => (
            <CommandItem key={href} value={`page ${label}`} onSelect={() => go(href)}>
              <Icon />
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        {projects.data && projects.data.length > 0 && (
          <CommandGroup heading="Projects">
            {projects.data.map((p) => (
              <CommandItem
                key={p.id}
                value={`project ${p.name} ${p.slug}`}
                onSelect={() => go(`/orgs/${orgId}/projects/${p.id}`)}
              >
                <FolderKanban />
                <span className="truncate">{p.name}</span>
                <span className="ml-auto font-mono text-xs text-subtle">{p.environments.length} env</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {envs.length > 0 && (
          <CommandGroup heading="Environments">
            {envs.map((e) => (
              <CommandItem
                key={e.id}
                value={`env ${e.project.name} ${e.name}`}
                onSelect={() => go(`/orgs/${orgId}/projects/${e.project.id}/environments/${e.id}`)}
              >
                <Layers />
                <span className="truncate">
                  {e.project.name} <span className="text-subtle">/</span> <span className="font-mono">{e.name}</span>
                </span>
                {e.killed && <span className="ml-auto font-mono text-xs text-subtle">suspended</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {members.data && members.data.length > 0 && (
          <CommandGroup heading="People">
            {members.data.map((m) => (
              <CommandItem
                key={m.userId}
                value={`person ${m.name} ${m.email}`}
                onSelect={() => go(`/orgs/${orgId}/members`)}
              >
                <User />
                <span className="truncate">{m.name}</span>
                <span className="ml-auto truncate font-mono text-xs text-subtle">{m.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        <CommandGroup heading="Actions">
          <CommandItem
            value="copy login command cli"
            onSelect={() => {
              void navigator.clipboard.writeText(CLI_COMMANDS.login);
              notifySuccess("Copied npx cb login");
              onOpenChange(false);
            }}
          >
            <Copy />
            Copy CLI login command
          </CommandItem>
          {/* FR-DOC-003 */}
          <CommandItem value="documentation docs help guides" onSelect={() => go(DOCS_PATH)}>
            <BookOpen />
            Documentation
          </CommandItem>
          <CommandItem
            value="log out sign out"
            onSelect={() => logout.mutate(undefined, { onSettled: () => router.replace("/login") })}
          >
            <LogOut />
            Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
