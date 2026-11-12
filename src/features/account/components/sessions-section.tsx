"use client";

import { Laptop, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { CLI_COMMANDS, LOGIN_PATH } from "@/constants";
import { useLogout, useMe } from "@/features/auth";
import { describeBrowser } from "@/features/devices";
import { useOrg } from "@/features/orgs";
import { BadgeLabel } from "@/shared/components/badge-label";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { CopyCommand } from "@/shared/components/copy-command";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { timeAgo } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useMyDevices, useMySessions, useRevokeMyDevice, useRevokeMySession } from "../hooks/use-account";

function Row({
  icon,
  title,
  badge,
  meta,
  action,
}: {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  meta: string;
  action?: ReactNode;
}) {
  return (
    <CardContent className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-200 text-foreground-lighter [&_svg]:size-4">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-foreground">
          <span className="truncate">{title}</span>
          {badge}
        </span>
        <span className="truncate text-xs text-foreground-lighter">{meta}</span>
      </div>
      {action}
    </CardContent>
  );
}

/** Dashboard sessions (admins can list them) and CLI devices of the signed-in user, with revoke and Sign out. */
export function SessionsSection({ orgId }: { orgId: string }) {
  const router = useRouter();
  const me = useMe();
  const org = useOrg(orgId);
  const logout = useLogout();
  const signOut = () => logout.mutate(undefined, { onSettled: () => router.replace(LOGIN_PATH) });
  return (
    <Section
      title="Sessions"
      description="Browsers and CLI logins signed in as you"
      actions={
        <Button variant="secondary" size="sm" loading={logout.isPending} onClick={signOut}>
          Sign out
        </Button>
      }
    >
      <DashboardSessions orgId={orgId} userId={me.data?.user.id} canList={org.isAdmin} orgLoaded={!org.isPending} />
      <CliDevices />
    </Section>
  );
}

function DashboardSessions({
  orgId,
  userId,
  canList,
  orgLoaded,
}: {
  orgId: string;
  userId: string | undefined;
  canList: boolean;
  orgLoaded: boolean;
}) {
  const sessions = useMySessions(orgId, userId, canList);
  const revoke = useRevokeMySession(orgId);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Browsers signed in to this dashboard</CardDescription>
      </CardHeader>
      {!orgLoaded ? (
        <CardContent>
          <SkeletonRows rows={1} />
        </CardContent>
      ) : !canList ? (
        <CardContent>
          <p className="text-sm text-foreground-lighter">
            Only owners and admins can list dashboard sessions. Sign out ends the session in this browser
          </p>
        </CardContent>
      ) : (
        <QueryState
          isPending={sessions.isPending}
          error={sessions.error}
          skeleton={
            <CardContent>
              <SkeletonRows rows={1} />
            </CardContent>
          }
        >
          {sessions.data?.length === 0 ? (
            <CardContent>
              <p className="text-sm text-foreground-lighter">No active sessions</p>
            </CardContent>
          ) : (
            sessions.data?.map((s) => (
              <Row
                key={s.id}
                icon={<Monitor strokeWidth={1.5} />}
                title={describeBrowser(s.userAgent)}
                badge={s.current && <BadgeLabel tone="success">This browser</BadgeLabel>}
                meta={`Active ${timeAgo(s.lastSeenAt ?? s.createdAt)} · signed in ${timeAgo(s.createdAt)}`}
                action={
                  !s.current && (
                    <ConfirmDialog
                      trigger={
                        <Button variant="secondary" size="sm">
                          Revoke
                        </Button>
                      }
                      title="Sign out this browser?"
                      description={`${describeBrowser(s.userAgent)} has to sign in again. CLI devices are not affected.`}
                      confirmLabel="Revoke session"
                      onConfirm={() => revoke.mutateAsync(s.id)}
                    />
                  )
                }
              />
            ))
          )}
        </QueryState>
      )}
    </Card>
  );
}

function CliDevices() {
  const devices = useMyDevices();
  const revoke = useRevokeMyDevice();
  return (
    <Card>
      <CardHeader>
        <CardTitle>CLI devices</CardTitle>
        <CardDescription>Laptops signed in with {CLI_COMMANDS.login}</CardDescription>
      </CardHeader>
      <QueryState
        isPending={devices.isPending}
        error={devices.error}
        skeleton={
          <CardContent>
            <SkeletonRows rows={1} />
          </CardContent>
        }
      >
        {devices.data?.length === 0 ? (
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-foreground-lighter">No CLI logins yet. Run this in your project to add one</p>
            <CopyCommand command={CLI_COMMANDS.login} />
          </CardContent>
        ) : (
          devices.data?.map((d) => (
            <Row
              key={d.id}
              icon={<Laptop strokeWidth={1.5} />}
              title={d.name}
              badge={
                <BadgeLabel tone={d.agent.online ? "success" : "muted"} dot>
                  {d.agent.online ? "Agent online" : "Agent offline"}
                </BadgeLabel>
              }
              meta={`${d.os} · last seen ${timeAgo(d.lastSeenAt)}`}
              action={
                <ConfirmDialog
                  trigger={
                    <Button variant="secondary" size="sm">
                      Revoke
                    </Button>
                  }
                  title={`Revoke ${d.name}?`}
                  description="Its connections close within seconds and it has to run npx cb login again."
                  confirmLabel="Revoke device"
                  onConfirm={() => revoke.mutateAsync(d.id)}
                />
              }
            />
          ))
        )}
      </QueryState>
    </Card>
  );
}
