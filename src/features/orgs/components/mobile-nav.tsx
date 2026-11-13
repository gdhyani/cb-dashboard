"use client";

import { BookOpen, ChevronRight, KeyRound, Layers, LayoutGrid, LogOut, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DOCS_PATH, LOGIN_PATH, PRODUCT_NAME } from "@/constants";
import { useLogout, useMe } from "@/features/auth/hooks/use-auth";
import { useProject } from "@/features/projects/hooks/use-projects";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { THEME_ICONS } from "@/shared/components/theme-toggle";
import { cn } from "@/shared/lib/utils";
import { THEME_CHOICES } from "@/shared/theme/theme";
import { useTheme } from "@/shared/theme/use-theme";
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
 * Phone menu (Studio mobile): org header, the current project's pages and environments when inside one, the org
 * navigation in titled groups, and the account (theme, docs, sign out) pinned at the bottom.
 */
export function MobileNav({ orgId, projectId }: { orgId: string; projectId?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const org = useOrg(orgId);
  const me = useMe();
  const logout = useLogout();
  const { choice, setChoice } = useTheme();
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

      <div className="shrink-0 border-t border-border bg-surface-75 p-3">
        <div className="flex items-center gap-3 px-1 pb-3">
          <AvatarInitials name={me.data?.user.name ?? ""} />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm text-foreground">{me.data?.user.name}</span>
              {org.data && <BadgeLabel tone={org.isAdmin ? "strong" : "default"}>{org.data.role}</BadgeLabel>}
            </span>
            <span className="truncate text-xs text-foreground-lighter">{me.data?.user.email}</span>
          </div>
        </div>
        {/* Theme as a segmented control, like Studio's appearance switch. */}
        <fieldset className="mb-2 grid grid-cols-3 gap-1 rounded-md border border-border bg-background p-0.5">
          <legend className="sr-only">Theme</legend>
          {THEME_CHOICES.map((t) => {
            const Icon = THEME_ICONS[t.value];
            const selected = choice === t.value;
            return (
              <label
                key={t.value}
                className={cn(
                  "flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                  selected ? "bg-selection text-foreground" : "text-foreground-lighter hover:text-foreground",
                )}
              >
                <input
                  type="radio"
                  name="mobile-theme"
                  value={t.value}
                  checked={selected}
                  onChange={() => setChoice(t.value)}
                  className="sr-only"
                />
                <Icon className="size-3.5" strokeWidth={1.5} />
                {t.label}
              </label>
            );
          })}
        </fieldset>
        <div className="flex flex-col gap-0.5">
          <Item
            href={DOCS_PATH}
            active={false}
            icon={<BookOpen strokeWidth={1.5} />}
            trailing={<ChevronRight className="size-3.5 text-foreground-muted" />}
          >
            Docs
          </Item>
          <button
            type="button"
            onClick={() => logout.mutate(undefined, { onSettled: () => router.replace(LOGIN_PATH) })}
            className="flex h-9 items-center gap-3 rounded-md px-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4 shrink-0" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </div>
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
