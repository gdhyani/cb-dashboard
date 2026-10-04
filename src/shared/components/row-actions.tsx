"use client";

import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ConfirmDialog } from "./confirm-dialog";

export interface RowAction {
  label: string;
  icon?: LucideIcon;
  /** Plain action, run immediately. */
  onSelect?: () => void;
  /** Destructive actions confirm first. */
  confirm?: {
    title: string;
    description: ReactNode;
    confirmLabel: string;
    requireReason?: boolean;
    onConfirm: (reason: string) => Promise<unknown>;
  };
  destructive?: boolean;
}

/**
 * The "…" menu at the end of a row or page header. Destructive items are separated and open a confirmation.
 * `prominent` gives it an outlined trigger for page headers.
 */
export function RowActions({
  label,
  actions,
  prominent = false,
}: {
  label: string;
  actions: RowAction[];
  prominent?: boolean;
}) {
  const [pending, setPending] = useState<RowAction | null>(null);
  const safe = actions.filter((a) => !a.destructive);
  const danger = actions.filter((a) => a.destructive);
  const item = (a: RowAction) => {
    const Icon = a.icon;
    return (
      <DropdownMenuItem
        key={a.label}
        variant={a.destructive ? "destructive" : "default"}
        onSelect={() => (a.confirm ? setPending(a) : a.onSelect?.())}
      >
        {Icon && <Icon />}
        {a.label}
      </DropdownMenuItem>
    );
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={prominent ? "outline" : "ghost"} size={prominent ? "icon" : "icon-sm"} aria-label={label}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {safe.map(item)}
          {safe.length > 0 && danger.length > 0 && <DropdownMenuSeparator />}
          {danger.map(item)}
        </DropdownMenuContent>
      </DropdownMenu>
      {pending?.confirm && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setPending(null)}
          title={pending.confirm.title}
          description={pending.confirm.description}
          confirmLabel={pending.confirm.confirmLabel}
          requireReason={pending.confirm.requireReason}
          onConfirm={pending.confirm.onConfirm}
        />
      )}
    </>
  );
}
