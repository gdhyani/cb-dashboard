"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import type { BadgeTone } from "@/shared/lib/badge-tones";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import type { EnvironmentSummary } from "../types";

export interface EnvironmentTableRow {
  environment: EnvironmentSummary;
  project: { id: string; name: string };
}

/** One status per environment: a stop wins over access. */
export function environmentStatus(e: EnvironmentSummary): { tone: BadgeTone; label: string } {
  if (e.killed) return { tone: "warning", label: "Suspended" };
  return e.hasAccess ? { tone: "success", label: "Access granted" } : { tone: "muted", label: "No access" };
}

/**
 * Studio table of environments: name (mono), optionally its project, one status badge. The whole row opens the
 * environment (click or Enter).
 */
export function EnvironmentTable({
  orgId,
  rows,
  showProject = false,
  empty,
}: {
  orgId: string;
  rows: EnvironmentTableRow[];
  showProject?: boolean;
  /** Shown in a single row when there are no environments. */
  empty?: ReactNode;
}) {
  const router = useRouter();
  const open = (r: EnvironmentTableRow) =>
    router.push(`/orgs/${orgId}/projects/${r.project.id}/environments/${r.environment.id}`);
  const columns = showProject ? 4 : 3;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Environment</TableHead>
          {showProject && <TableHead>Project</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead className="w-10">
            <span className="sr-only">Open</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const status = environmentStatus(r.environment);
          return (
            <TableRow
              key={r.environment.id}
              tabIndex={0}
              aria-label={`Open ${showProject ? `${r.project.name} / ` : ""}${r.environment.name}`}
              className="group cursor-pointer focus-inset"
              onClick={() => open(r)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter") open(r);
              }}
            >
              <TableCell className="font-mono whitespace-nowrap text-foreground">{r.environment.name}</TableCell>
              {showProject && (
                <TableCell className="whitespace-nowrap text-foreground-light">{r.project.name}</TableCell>
              )}
              <TableCell>
                <span className="flex min-w-0 flex-col items-start gap-1">
                  <BadgeLabel tone={status.tone}>{status.label}</BadgeLabel>
                  {r.environment.killed && r.environment.killedReason && (
                    <span className="max-w-64 truncate text-xs text-foreground-lighter">
                      {r.environment.killedReason}
                    </span>
                  )}
                </span>
              </TableCell>
              <TableCell className="w-10 text-right">
                <ChevronRight
                  className="inline size-4 text-foreground-muted transition-colors group-hover:text-foreground"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </TableCell>
            </TableRow>
          );
        })}
        {rows.length === 0 && empty && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns} className="text-foreground-lighter">
              {empty}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
