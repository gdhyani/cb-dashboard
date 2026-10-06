"use client";

import { AlertTriangle } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { type RowAction, RowActions } from "@/shared/components/row-actions";
import { ServiceLogo } from "@/shared/components/service-logo";
import { StaggerItem } from "@/shared/components/stagger";
import { StatusDot } from "@/shared/components/status-dot";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { describeValue } from "../lib/display";
import type { Variable } from "../types";

/** One key in the table: key · value · type chip (or "with MAIN_KEY") · "…" menu (admins). */
export function VariableRow({
  variable,
  index,
  isMain,
  parentKey,
  chip,
  actions,
  onOpen,
  health,
}: {
  variable: Variable;
  index: number;
  isMain: boolean;
  parentKey?: string;
  chip?: { icon: string; label: string };
  actions?: RowAction[];
  /** Admins: clicking the key opens Edit. */
  onOpen?: () => void;
  /** B11: a service's main key shows whether the provider still accepts the key (never the key). */
  health?: { status: "ok" | "rejected" | "unknown"; reason: string | null; checkedAt: string | null };
}) {
  const value = describeValue(variable, isMain);
  const status =
    health && isMain && !parentKey
      ? {
          ok: { tone: "ok" as const, label: "Working — the provider accepts this key" },
          rejected: {
            tone: "rejected" as const,
            label: `Expired — ${health.reason ?? "the provider refused this key"}`,
          },
          unknown: { tone: "unknown" as const, label: "Not checked yet — Test connection checks it" },
        }[health.status]
      : undefined;
  return (
    <StaggerItem
      index={index}
      className={`flex items-center gap-3 px-3 py-2.5 sm:px-4 ${parentKey ? "pl-7 sm:pl-9" : ""}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="flex min-w-0 items-center gap-2 truncate font-mono text-sm sm:w-[38%] sm:shrink-0">
          {status && <StatusDot tone={status.tone} label={status.label} />}
          {parentKey && (
            <span aria-hidden className="text-subtle">
              ↳{" "}
            </span>
          )}
          {onOpen ? (
            <button
              type="button"
              aria-label={`Open ${variable.key}`}
              onClick={onOpen}
              className="underline-offset-4 hover:underline"
            >
              {variable.key}
            </button>
          ) : (
            variable.key
          )}
        </span>
        <span className={`truncate text-xs ${value.mono ? "font-mono text-foreground" : "text-subtle"}`}>
          {value.text}
        </span>
      </div>
      <span
        className={`max-w-[40%] shrink-0 items-center gap-1.5 truncate text-xs text-subtle ${
          // On phones the ↳ indent already links an extra key to its main key; keep its name visible.
          parentKey ? "hidden sm:flex" : "flex"
        }`}
      >
        {variable.type === "visible" && (
          <Tooltip>
            <TooltipTrigger aria-label="Why this is flagged">
              <AlertTriangle className="size-3.5 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>Real value delivered to developers (FR-UI-003).</TooltipContent>
          </Tooltip>
        )}
        {status?.tone === "rejected" && (
          <Tooltip>
            <TooltipTrigger aria-label={status.label}>
              <BadgeLabel tone="danger" dot>
                Expired
              </BadgeLabel>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{status.label}</TooltipContent>
          </Tooltip>
        )}
        {parentKey ? (
          <span>with {parentKey}</span>
        ) : (
          chip && (
            <>
              <ServiceLogo icon={chip.icon} />
              {chip.label}
            </>
          )
        )}
      </span>
      {actions && <RowActions label={`Actions for ${variable.key}`} actions={actions} />}
    </StaggerItem>
  );
}
