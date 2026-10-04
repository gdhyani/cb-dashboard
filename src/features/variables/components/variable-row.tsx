"use client";

import { AlertTriangle } from "lucide-react";
import { type RowAction, RowActions } from "@/shared/components/row-actions";
import { StaggerItem } from "@/shared/components/stagger";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { describeValue } from "../lib/display";
import type { Variable } from "../types";
import { ServiceLogo } from "./service-logo";

/** One key in the table: key · value · type chip (or "with MAIN_KEY") · "…" menu (admins). */
export function VariableRow({
  variable,
  index,
  isMain,
  parentKey,
  chip,
  actions,
}: {
  variable: Variable;
  index: number;
  isMain: boolean;
  parentKey?: string;
  chip?: { icon: string; label: string };
  actions?: RowAction[];
}) {
  const value = describeValue(variable, isMain);
  return (
    <StaggerItem
      index={index}
      className={`flex items-center gap-3 px-3 py-2.5 sm:px-4 ${parentKey ? "pl-7 sm:pl-9" : ""}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
        <span className="truncate font-mono text-sm sm:w-[38%] sm:shrink-0">
          {parentKey && (
            <span aria-hidden className="text-subtle">
              ↳{" "}
            </span>
          )}
          {variable.key}
        </span>
        <span className={`truncate text-xs ${value.mono ? "font-mono text-foreground" : "text-subtle"}`}>
          {value.text}
        </span>
      </div>
      <span className="flex max-w-[40%] shrink-0 items-center gap-1.5 truncate text-xs text-subtle">
        {variable.type === "visible" && (
          <Tooltip>
            <TooltipTrigger aria-label="Why this is flagged">
              <AlertTriangle className="size-3.5 text-destructive" />
            </TooltipTrigger>
            <TooltipContent>Real value delivered to developers (FR-UI-003).</TooltipContent>
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
