"use client";

import { CornerDownRight, TriangleAlert } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { type RowAction, RowActions } from "@/shared/components/row-actions";
import { ServiceLogo } from "@/shared/components/service-logo";
import { StatusDot } from "@/shared/components/status-dot";
import { cn } from "@/shared/lib/utils";
import { TableCell, TableRow } from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { describeValue } from "../lib/display";
import type { Variable } from "../types";

export type KeyHealth = { status: "ok" | "rejected" | "unknown"; reason: string | null; checkedAt: string | null };

/** B11: what a main key's status dot and label say (never the key itself). */
export function healthStatus(health: KeyHealth) {
  return {
    ok: { tone: "ok" as const, short: "Working", label: "Working — the provider accepts this key" },
    rejected: {
      tone: "rejected" as const,
      short: "Expired",
      label: `Expired — ${health.reason ?? "the provider refused this key"}`,
    },
    unknown: { tone: "unknown" as const, short: "Not checked", label: "Not checked yet — Test connection checks it" },
  }[health.status];
}

/**
 * One key in the Studio table: Key · Value · Type · Status · "…" menu (admins). Extra keys of a service sit under
 * their main key with a tree hint and say which key they come with.
 */
export function VariableRow({
  variable,
  isMain,
  parentKey,
  chip,
  actions,
  onOpen,
  health,
}: {
  variable: Variable;
  isMain: boolean;
  parentKey?: string;
  chip?: { icon: string; label: string };
  actions?: RowAction[];
  /** Admins: clicking the key opens it read-only. */
  onOpen?: () => void;
  /** B11: a service's main key shows whether the provider still accepts the key (never the key). */
  health?: KeyHealth;
}) {
  const value = describeValue(variable, isMain);
  const status = health && isMain && !parentKey ? healthStatus(health) : undefined;
  const valueText = (
    <span
      className={cn(
        "block truncate text-xs",
        value.mono ? "font-mono text-foreground-light" : "text-foreground-lighter",
      )}
    >
      {value.text}
    </span>
  );
  return (
    <TableRow>
      <TableCell className={cn("max-w-[14rem] py-2.5 sm:max-w-[18rem]", parentKey && "pl-8")}>
        <div className="flex min-w-0 items-center gap-2">
          {parentKey && (
            <CornerDownRight aria-hidden className="size-3.5 shrink-0 text-foreground-muted" strokeWidth={1.5} />
          )}
          {onOpen ? (
            <button
              type="button"
              aria-label={`Open ${variable.key}`}
              onClick={onOpen}
              className="min-w-0 truncate font-mono text-sm text-foreground underline-offset-4 hover:underline"
            >
              {variable.key}
            </button>
          ) : (
            <span className="min-w-0 truncate font-mono text-sm text-foreground">{variable.key}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-[16rem] min-w-[8rem] py-2.5">{valueText}</TableCell>
      <TableCell className="max-w-[9rem] py-2.5 sm:max-w-[14rem]">
        {parentKey ? (
          <span className="block truncate text-xs text-foreground-lighter">with {parentKey}</span>
        ) : variable.type === "visible" ? (
          // FR-UI-003: a persistent warning — the real value reaches developers.
          <Tooltip>
            <TooltipTrigger className="inline-flex items-center gap-1.5">
              <TriangleAlert aria-hidden className="size-3.5 text-warning" strokeWidth={1.5} />
              <BadgeLabel tone="warning">Shown as-is</BadgeLabel>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              The real value is delivered to every developer with access. Use a protected type when the app only passes
              the key on.
            </TooltipContent>
          </Tooltip>
        ) : (
          chip && (
            <span className="flex min-w-0 items-center gap-2 text-xs text-foreground-light">
              <ServiceLogo icon={chip.icon} />
              <span className="truncate">{chip.label}</span>
            </span>
          )
        )}
      </TableCell>
      <TableCell className="py-2.5">
        {status && (
          <span className="flex items-center gap-2 text-xs">
            <StatusDot tone={status.tone} label={status.label} className="text-foreground-lighter" />
            {status.tone === "rejected" ? (
              <Tooltip>
                <TooltipTrigger aria-label={status.label} className="hidden text-destructive sm:inline">
                  Expired
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{status.label}</TooltipContent>
              </Tooltip>
            ) : (
              <span
                className={cn(
                  "hidden whitespace-nowrap sm:inline",
                  status.tone === "ok" ? "text-foreground-light" : "text-foreground-lighter",
                )}
              >
                {status.short}
              </span>
            )}
          </span>
        )}
      </TableCell>
      {actions && (
        <TableCell className="w-10 py-1.5 pr-2 pl-0 text-right">
          <RowActions label={`Actions for ${variable.key}`} actions={actions} />
        </TableCell>
      )}
    </TableRow>
  );
}
