"use client";

import { useState } from "react";
import { useProfileMutations, useProfiles } from "@/features/resources";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { timeAgo } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import type { FieldDef } from "../lib/catalog";
import { FieldInput } from "./field-input";

const NAME = "readonly";

/**
 * J2/D10: a second, read-only login for a service (credential profile "readonly"). People get it from
 * "Who can use it". Saved on its own, tested by the backend like any profile.
 */
export function ReadonlyLogin({
  resourceId,
  valueField,
  label,
}: {
  resourceId: string;
  valueField: FieldDef;
  label: string;
}) {
  const profiles = useProfiles(resourceId);
  const { create, rotate, remove } = useProfileMutations(resourceId);
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  const existing = profiles.data?.find((p) => p.name === NAME);
  const pending = create.isPending || rotate.isPending || remove.isPending;

  async function save() {
    const body = { [valueField.name]: value };
    if (existing) await rotate.mutateAsync({ name: NAME, body });
    else await create.mutateAsync({ ...body, name: NAME });
    setValue("");
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[13px] font-medium">{label}</span>
          <span className="text-xs text-subtle">
            {existing
              ? `Set ${timeAgo(existing.rotatedAt)} · choose who gets it in "Who can use it"`
              : "Optional: a second login with fewer rights for some people."}
          </span>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
              {existing ? "Replace" : "Add"}
            </Button>
            {existing && (
              <ConfirmDialog
                trigger={
                  <Button type="button" size="sm" variant="ghost" disabled={pending}>
                    Remove
                  </Button>
                }
                title={`Remove the ${label.toLowerCase()}?`}
                description="People who use it fall back to the default login; their apps reconnect automatically."
                confirmLabel="Remove login"
                destructive
                onConfirm={() => remove.mutateAsync(NAME)}
              />
            )}
          </div>
        )}
      </div>
      {editing && (
        <>
          <FieldInput
            idPrefix="readonly"
            def={{ ...valueField, label: `${label}: ${valueField.label}` }}
            value={value}
            onChange={setValue}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setValue("");
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!value.trim() || pending}
              onClick={() => save().catch(() => undefined)}
            >
              Save login
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
