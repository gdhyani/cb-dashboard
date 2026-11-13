"use client";

import { useState } from "react";
import { useOrgDevices } from "@/features/devices/hooks/use-devices";
import { useMembers } from "@/features/members/hooks/use-members";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { KINDS, useResources } from "@/features/resources";
import { ChoiceCards } from "@/shared/components/choice-cards";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { useStopMutations } from "../hooks/use-emergency-stop";
import type { StopScope } from "../types";

export const SCOPES: readonly { value: StopScope; label: string; hint: string }[] = [
  { value: "user", label: "A person", hint: "Every device of one member" },
  { value: "device", label: "A device", hint: "One laptop, for example lost or stolen" },
  { value: "resource", label: "A service", hint: "One database or API" },
  { value: "environment", label: "An environment", hint: "Everything in it" },
  { value: "org", label: "Everyone", hint: "The whole organization, admins too" },
];

function TargetPicker({
  orgId,
  scope,
  value,
  onChange,
}: {
  orgId: string;
  scope: StopScope;
  value: string;
  onChange: (id: string) => void;
}) {
  const projects = useProjects(orgId);
  const members = useMembers(orgId);
  const devices = useOrgDevices(orgId, scope === "device");
  const [envForResource, setEnvForResource] = useState("");
  const resources = useResources(envForResource);
  const envs =
    projects.data?.flatMap((p) => p.environments.map((e) => ({ id: e.id, label: `${p.name} / ${e.name}` }))) ?? [];
  const select = (
    items: { id: string; label: string }[],
    placeholder: string,
    v = value,
    set = onChange,
    id = "stop-target",
  ) => (
    <Select value={v} onValueChange={set}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.id} value={i.id}>
            {i.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  if (scope === "org") return null;
  if (scope === "environment")
    return (
      <FormField id="stop-target" label="Environment">
        {select(envs, "Choose an environment")}
      </FormField>
    );
  if (scope === "user")
    return (
      <FormField id="stop-target" label="Person">
        {select(
          (members.data ?? []).map((m) => ({ id: m.userId, label: `${m.name} · ${m.email}` })),
          "Choose a member",
        )}
      </FormField>
    );
  if (scope === "device")
    return (
      <FormField id="stop-target" label="Device">
        {select(
          (devices.data ?? []).map((d) => ({ id: d.id, label: `${d.name} · ${d.user.email}` })),
          "Choose a device",
        )}
      </FormField>
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField id="stop-env" label="In environment">
        {select(
          envs,
          "Environment",
          envForResource,
          (id) => {
            setEnvForResource(id);
            onChange("");
          },
          "stop-env",
        )}
      </FormField>
      <FormField id="stop-target" label="Service">
        {select(
          (resources.data ?? []).map((r) => ({ id: r.id, label: `${r.name} (${KINDS[r.kind]?.label ?? r.kind})` })),
          envForResource ? "Choose a service" : "Pick an environment first",
        )}
      </FormField>
    </div>
  );
}

/**
 * J7 / FR-UI-002: stop access at a scope with a typed reason; live connections close within seconds.
 * `scope` preselects what to stop (the Stop access card has one trigger per scope); it can still be changed inside.
 */
export function StopAccessDialog({ orgId, scope: initialScope = "user" }: { orgId: string; scope?: StopScope }) {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<StopScope>(initialScope);
  const initialLabel = SCOPES.find((s) => s.value === initialScope)?.label.toLowerCase() ?? "access";
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const { activate } = useStopMutations(orgId);
  const valid = reason.trim().length >= 3 && (scope === "org" || Boolean(targetId));
  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setScope(initialScope);
      setTargetId("");
      setReason("");
    }
  };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        {/* Opens the form only; the destructive step is the confirm button inside (repo guide rule). */}
        <Button variant="secondary" size="sm" aria-label={`Stop access for ${initialLabel}`}>
          Stop access
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Stop access</DialogTitle>
          <DialogDescription>
            Live database and API connections close within seconds and new ones are refused until you restore access
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <span className="text-sm text-foreground">What to stop</span>
          <ChoiceCards
            name="stop-scope"
            legend="What to stop"
            choices={SCOPES.map((c) => ({ value: c.value, title: c.label, hint: c.hint }))}
            value={scope}
            onChange={(next) => {
              setScope(next);
              setTargetId("");
            }}
          />
        </div>
        <TargetPicker orgId={orgId} scope={scope} value={targetId} onChange={setTargetId} />
        <FormField id="stop-reason" label="Reason" hint="Shown to admins and recorded in Activity">
          <Textarea
            id="stop-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Laptop reported stolen"
            rows={2}
          />
        </FormField>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={!valid}
            loading={activate.isPending}
            onClick={() =>
              activate.mutate(
                { scope, targetId: scope === "org" ? undefined : targetId, reason: reason.trim() },
                { onSuccess: () => close(false) },
              )
            }
          >
            {scope === "org" ? "Stop access for everyone" : "Stop access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
