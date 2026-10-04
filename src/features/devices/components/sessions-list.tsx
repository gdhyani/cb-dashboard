"use client";

import { LogOut, Monitor } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeAgo } from "@/shared/lib/format-time";
import { useOrgSessions, useRevokeSession } from "../hooks/use-devices";

/** "Chrome on macOS" from a user agent; good enough to recognise a session. */
export function describeBrowser(ua: string): string {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Firefox\//.test(ua)
      ? "Firefox"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Browser";
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
}

/** Dashboard sign-ins across members; admins can sign any of them out. */
export function SessionsList({ orgId }: { orgId: string }) {
  const sessions = useOrgSessions(orgId);
  const revoke = useRevokeSession(orgId);
  return (
    <QueryState isPending={sessions.isPending} error={sessions.error} skeleton={<SkeletonRows rows={2} />}>
      {sessions.data?.length === 0 ? (
        <EmptyState title="No active sessions" />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {sessions.data?.map((s, i) => (
            <StaggerItem key={s.id} index={i} className="flex items-center gap-3 px-3 py-3 sm:px-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-strong bg-muted text-subtle">
                <Monitor className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="truncate font-medium">{describeBrowser(s.userAgent)}</span>
                  {s.current && <BadgeLabel tone="strong">This browser</BadgeLabel>}
                </span>
                <span className="truncate font-mono text-xs text-subtle">
                  {s.user.email} · active {timeAgo(s.lastSeenAt ?? s.createdAt)}
                </span>
              </div>
              {!s.current && (
                <RowActions
                  label={`Actions for ${s.user.email}'s session`}
                  actions={[
                    {
                      label: "Sign out",
                      icon: LogOut,
                      destructive: true,
                      confirm: {
                        title: `Sign ${s.user.name || s.user.email} out of this browser?`,
                        description: "They have to log in again in that browser. CLI devices are not affected.",
                        confirmLabel: "Sign out",
                        onConfirm: () => revoke.mutateAsync(s.id),
                      },
                    },
                  ]}
                />
              )}
            </StaggerItem>
          ))}
        </ul>
      )}
    </QueryState>
  );
}
