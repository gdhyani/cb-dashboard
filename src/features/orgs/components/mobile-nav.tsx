"use client";

import { KeyRound, Layers, LayoutGrid, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PRODUCT_NAME } from "@/constants";
import { useProject } from "@/features/projects/hooks/use-projects";
import { cn } from "@/shared/lib/utils";
import { SheetClose } from "@/shared/ui/sheet";
import { useOrg } from "../hooks/use-orgs";
import { isActive, orgNavGroups } from "./org-sidebar";

/** Group titles for the phone menu (the rail shows the same groups split by hairlines). */
const GROUP_TITLES = [undefined, "Organization", "Security & account"] as const;

function GroupTitle({ children }: { children: ReactNode }) {
  return <p className="heading-meta px-3 pt-4 pb-1.5 text-foreground-muted">{children}</p>;
}

function Item({
  href,
  active,
  icon,
  children,
  trailing,
}: {
  href: string;
  active: boolean;
  icon?: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 min-w-0 items-center gap-3 rounded-md px-3 text-sm transition-colors",
        active
          ? "bg-selection font-medium text-foreground"
          : "text-foreground-light hover:bg-accent hover:text-foreground",
      )}
    >
      {icon && <span className="shrink-0 text-foreground-lighter [&_svg]:size-4">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </Link>
  );
}

/**
 * Phone menu (Studio mobile): org header, the current project's pages and environments when inside one, and the org
 * navigation in titled groups. Account, theme, Docs and Sign out live in the profile menu (top bar).
 */
export function MobileNav({ orgId, projectId }: { orgId: string; projectId?: string }) {
  const pathname = usePathname();
  const org = useOrg(orgId);
  const groups = orgNavGroups(orgId, org.isAdmin);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <span className="flex size-7 items-center justify-center rounded-md bg-brand font-mono text-[11px] font-semibold text-[#0b1f15]">
          {PRODUCT_NAME.slice(0, 2)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{org.data?.name}</span>
          <span className="text-xs text-foreground-lighter">Organization</span>
        </div>
        <SheetClose
          aria-label="Close menu"
          className="flex size-8 items-center justify-center rounded-md border border-border-strong text-foreground-lighter hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </SheetClose>
      </div>

      <nav aria-label="Menu" className="flex-1 overflow-y-auto px-2 pb-4">
        {projectId && <ProjectGroup orgId={orgId} projectId={projectId} pathname={pathname} isAdmin={org.isAdmin} />}
        {groups.map((group, gi) => (
          <div key={group[0]?.href ?? gi}>
            {GROUP_TITLES[gi] ? <GroupTitle>{GROUP_TITLES[gi]}</GroupTitle> : <div className="pt-3" />}
            <div className="flex flex-col gap-0.5">
              {group.map(({ href, label, icon: Icon, exact }) => (
                <Item key={href} href={href} active={isActive(pathname, href, exact)} icon={<Icon strokeWidth={1.5} />}>
                  {label}
                </Item>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}

/** The current project's pages and environments, on top while you're inside it. */
function ProjectGroup({
  orgId,
  projectId,
  pathname,
  isAdmin,
}: {
  orgId: string;
  projectId: string;
  pathname: string;
  isAdmin: boolean;
}) {
  const project = useProject(projectId);
  const base = `/orgs/${orgId}/projects/${projectId}`;
  return (
    <div>
      <GroupTitle>{project.data?.name ?? "Project"}</GroupTitle>
      <div className="flex flex-col gap-0.5">
        <Item href={base} active={pathname === base} icon={<LayoutGrid strokeWidth={1.5} />}>
          Overview
        </Item>
        {isAdmin && (
          <>
            <Item
              href={`${base}/access`}
              active={isActive(pathname, `${base}/access`)}
              icon={<KeyRound strokeWidth={1.5} />}
            >
              Access
            </Item>
            <Item
              href={`${base}/settings`}
              active={isActive(pathname, `${base}/settings`)}
              icon={<Settings strokeWidth={1.5} />}
            >
              Settings
            </Item>
          </>
        )}
        {project.data?.environments.map((e) => {
          const href = `${base}/environments/${e.id}`;
          return (
            <Item
              key={e.id}
              href={href}
              active={isActive(pathname, href)}
              icon={<Layers strokeWidth={1.5} />}
              trailing={
                e.killed ? (
                  <span className="size-1.5 rounded-full bg-warning" role="img" aria-label="Suspended" />
                ) : undefined
              }
            >
              <span className="font-mono text-[13px]">{e.name}</span>
            </Item>
          );
        })}
      </div>
      <div className="mx-3 mt-3 h-px bg-border" />
    </div>
  );
}
