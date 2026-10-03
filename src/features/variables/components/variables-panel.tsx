"use client";

import { AlertTriangle } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useVariableMutations, useVariables } from "../hooks/use-variables";
import type { Variable } from "../types";
import { VariableFormDialog } from "./variable-form-dialog";

function source(v: Variable) {
  switch (v.type) {
    case "plain":
      return <span className="font-mono text-foreground">{v.value}</span>;
    case "generated":
      return <span className="font-mono text-subtle">personal · {v.format}</span>;
    case "visible":
      return <span className="font-mono text-subtle">•••• set</span>;
    default:
      return (
        <span className="font-mono text-subtle">
          {v.resourceName} → {v.field}
        </span>
      );
  }
}

export function VariablesPanel({ envId, isAdmin }: { envId: string; isAdmin: boolean }) {
  const variables = useVariables(envId);
  const { remove } = useVariableMutations(envId);
  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex justify-end">
          <VariableFormDialog envId={envId} />
        </div>
      )}
      <QueryState isPending={variables.isPending} error={variables.error}>
        {variables.data?.length === 0 ? (
          <EmptyState title="No variables" description="Every key your app reads from process.env lives here." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                {isAdmin && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.data?.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono">{v.key}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <BadgeLabel
                        tone={v.type === "visible" ? "warning" : v.type === "brokered" ? "strong" : "default"}
                      >
                        {v.type}
                      </BadgeLabel>
                      {v.type === "visible" && (
                        <Tooltip>
                          <TooltipTrigger aria-label="Why this is flagged">
                            <AlertTriangle className="size-3.5 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>Real value delivered to developers (FR-UI-003).</TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{source(v)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <ConfirmDialog
                        trigger={
                          <Button size="sm" variant="ghost">
                            Delete
                          </Button>
                        }
                        title={`Delete ${v.key}?`}
                        description="Running apps restart without it."
                        confirmLabel="Delete"
                        onConfirm={() => remove.mutateAsync(v.id)}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </QueryState>
    </div>
  );
}
