"use client";

import { addHours, format } from "date-fns";
import { Check, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Member } from "@/features/members/types";
import { useProfiles, useResources } from "@/features/resources/hooks/use-resources";
import { KINDS } from "@/features/resources/lib/kinds";
import type { Resource } from "@/features/resources/types";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { ChoiceCards } from "@/shared/components/choice-cards";
import { notifySuccess } from "@/shared/lib/notify";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { useAccessMutations } from "../hooks/use-access";
import type { AccessMatrix, ProjectAccessInput } from "../types";

const DURATIONS = [
  { value: "none", label: "No expiry", hours: 0 },
  { value: "1h", label: "1 hour", hours: 1 },
  { value: "8h", label: "8 hours", hours: 8 },
  { value: "24h", label: "1 day", hours: 24 },
  { value: "168h", label: "1 week", hours: 168 },
  { value: "custom", label: "Until a date…", hours: 0 },
];

function SectionTitle({ step, title, hint }: { step: number; title: string; hint?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-[11px] text-subtle">{step}</span>
      <h3 className="text-sm font-medium">{title}</h3>
      {hint && <span className="text-xs text-subtle">{hint}</span>}
    </div>
  );
}

/** A selectable row with a check box look (people and environments). */
function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.03] has-[:focus-visible]:bg-white/[0.06]",
        checked && "bg-white/[0.04]",
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={onToggle} />
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
          checked ? "border-foreground bg-foreground text-background" : "border-border-strong",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {children}
    </label>
  );
}

function ResourceProfileRow({
  resource,
  value,
  onChange,
}: {
  resource: Resource;
  value: string;
  onChange: (profile: string) => void;
}) {
  const profiles = useProfiles(resource.id);
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{resource.name}</span>
        <span className="block truncate text-[11px] text-subtle">{KINDS[resource.kind]?.label ?? resource.kind}</span>
      </span>
      {profiles.isPending ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <Select value={value} onValueChange={onChange} disabled={(profiles.data?.length ?? 0) < 2}>
          <SelectTrigger className="h-8 w-32 font-mono text-xs" aria-label={`Credential profile for ${resource.name}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {profiles.data?.map((p) => (
              <SelectItem key={p.name} value={p.name} className="font-mono">
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </li>
  );
}

/** Resources of one environment, each with a profile picker. */
function EnvironmentResources({
  envId,
  envName,
  choice,
  onChange,
}: {
  envId: string;
  envName: string;
  choice: Record<string, string>;
  onChange: (resourceId: string, profile: string) => void;
}) {
  const resources = useResources(envId);
  if (resources.isPending) return <Skeleton className="h-10 w-full" />;
  if (!resources.data?.length) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="px-1 font-mono text-[11px] text-subtle">{envName}</p>
      <ul className="divide-y divide-border rounded-md border border-border">
        {resources.data.map((r) => (
          <ResourceProfileRow
            key={r.id}
            resource={r}
            value={choice[r.id] ?? "default"}
            onChange={(profile) => onChange(r.id, profile)}
          />
        ))}
      </ul>
    </div>
  );
}

/**
 * J4: grant or edit access to a project in one place — who, where (whole project or chosen environments),
 * how long, and optional credential profiles. Saving sets each person's access exactly.
 */
export function AccessDialog({
  projectId,
  projectName,
  matrix,
  open,
  onOpenChange,
  person,
  candidates = [],
  initial,
  existingEnvironments,
}: {
  projectId: string;
  projectName: string;
  matrix: AccessMatrix;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode: the person whose access is being changed. */
  person?: Member;
  /** Add mode: developers that can be picked. */
  candidates?: Member[];
  initial: ProjectAccessInput;
  /** Add mode from an environment: keep each person's other environments (adds instead of replacing). */
  existingEnvironments?: (userId: string) => string[];
}) {
  const { setAccess } = useAccessMutations(projectId);
  const [picked, setPicked] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState(initial.scope);
  const [envIds, setEnvIds] = useState<string[]>(initial.environmentIds ?? []);
  const [duration, setDuration] = useState(initial.expiresAt ? "custom" : "none");
  const [customDate, setCustomDate] = useState(
    initial.expiresAt ? format(new Date(initial.expiresAt), "yyyy-MM-dd'T'HH:mm") : "",
  );
  const [showProfiles, setShowProfiles] = useState(initial.resourceProfiles.length > 0);
  const [choice, setChoice] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.resourceProfiles.map((p) => [p.resourceId, p.profile])),
  );
  const [saving, setSaving] = useState(false);

  const editing = Boolean(person);
  const people = editing && person ? [person.userId] : picked;
  const filtered = useMemo(
    () => candidates.filter((c) => `${c.name} ${c.email}`.toLowerCase().includes(query.trim().toLowerCase())),
    [candidates, query],
  );
  const shownEnvs =
    scope === "project" ? matrix.environments : matrix.environments.filter((e) => envIds.includes(e.id));
  const expiresAt = (() => {
    if (duration === "custom") return customDate ? new Date(customDate).toISOString() : null;
    const hours = DURATIONS.find((d) => d.value === duration)?.hours ?? 0;
    return hours ? addHours(new Date(), hours).toISOString() : null;
  })();
  const customInvalid = duration === "custom" && (!customDate || new Date(customDate).getTime() <= Date.now());
  const valid = people.length > 0 && (scope === "project" || envIds.length > 0) && !customInvalid;

  const whereText =
    scope === "project" ? "all environments" : shownEnvs.map((e) => e.name).join(", ") || "no environments yet";
  const whoText = editing
    ? person?.name
    : picked.length === 1
      ? candidates.find((c) => c.userId === picked[0])?.name
      : `${picked.length} people`;
  const howLongText =
    duration === "none"
      ? "no expiry"
      : duration === "custom"
        ? `until ${customDate.replace("T", " ")}`
        : DURATIONS.find((d) => d.value === duration)?.label;

  const submit = async () => {
    const body: ProjectAccessInput = {
      scope,
      environmentIds: scope === "environments" ? envIds : undefined,
      expiresAt,
      resourceProfiles: Object.entries(choice)
        .filter(([, profile]) => profile !== "default")
        .map(([resourceId, profile]) => ({ resourceId, profile })),
    };
    setSaving(true);
    try {
      for (const userId of people) {
        const merged =
          scope === "environments" && existingEnvironments
            ? { ...body, environmentIds: [...new Set([...(existingEnvironments(userId) ?? []), ...envIds])] }
            : body;
        await setAccess.mutateAsync({ userId, body: merged });
      }
      notifySuccess(editing ? "Access updated" : `Access granted to ${whoText}`);
      onOpenChange(false);
    } catch {
      // The mutation already showed the error toast; keep the dialog open to fix it.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${person?.name}'s access` : `Add people to ${projectName}`}</DialogTitle>
          <DialogDescription>
            Access lets someone run this project locally. Real credentials never reach their machine.
          </DialogDescription>
        </DialogHeader>

        {!editing && (
          <section className="flex flex-col gap-2.5">
            <SectionTitle step={1} title="Who" hint={picked.length ? `${picked.length} selected` : undefined} />
            {candidates.length === 0 ? (
              <p className="rounded-md border border-dashed border-border-strong px-3 py-3 text-sm text-subtle">
                Every developer already has access. Invite more people from Members.
              </p>
            ) : (
              <div className="overflow-hidden rounded-md border border-border">
                <div className="flex items-center gap-2 border-b border-border px-3">
                  <Search className="size-4 text-subtle" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search developers"
                    aria-label="Search developers"
                    className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
                  />
                </div>
                <div className="max-h-44 divide-y divide-border overflow-y-auto">
                  {filtered.map((c) => (
                    <CheckRow
                      key={c.userId}
                      checked={picked.includes(c.userId)}
                      onToggle={() =>
                        setPicked((p) => (p.includes(c.userId) ? p.filter((x) => x !== c.userId) : [...p, c.userId]))
                      }
                    >
                      <AvatarInitials name={c.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{c.name}</span>
                        <span className="block truncate font-mono text-xs text-subtle">{c.email}</span>
                      </span>
                    </CheckRow>
                  ))}
                  {filtered.length === 0 && <p className="px-3 py-2 text-sm text-subtle">No match.</p>}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="flex flex-col gap-2.5">
          <SectionTitle step={editing ? 1 : 2} title="Where" />
          <ChoiceCards
            name="access-scope"
            legend="Where"
            value={scope}
            onChange={setScope}
            choices={[
              { value: "project", title: "All environments", hint: "Including environments added later" },
              { value: "environments", title: "Specific environments", hint: "Only the ones you choose" },
            ]}
          />
          {scope === "environments" && (
            <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {matrix.environments.map((e) => (
                <CheckRow
                  key={e.id}
                  checked={envIds.includes(e.id)}
                  onToggle={() =>
                    setEnvIds((ids) => (ids.includes(e.id) ? ids.filter((x) => x !== e.id) : [...ids, e.id]))
                  }
                >
                  <span className="flex-1 font-mono">{e.name}</span>
                  {e.killed && <span className="text-xs text-subtle">suspended</span>}
                </CheckRow>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-2.5">
          <SectionTitle step={editing ? 2 : 3} title="How long" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="sm:w-48" aria-label="Duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {duration === "custom" && (
              <Input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                aria-label="Expires at"
                className="sm:flex-1"
              />
            )}
          </div>
          {customInvalid && customDate && <p className="text-xs text-destructive">Pick a time in the future.</p>}
        </section>

        <section className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setShowProfiles((v) => !v)}
            aria-expanded={showProfiles}
            className="flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className={cn("size-4 transition-transform", showProfiles && "rotate-90")} />
            Credential profiles
            <span className="text-xs text-subtle">optional</span>
          </button>
          {showProfiles && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-subtle">
                Pick which real login each resource uses, e.g. a read-only database user. Unchanged ones use default.
              </p>
              {shownEnvs.map((e) => (
                <EnvironmentResources
                  key={e.id}
                  envId={e.id}
                  envName={e.name}
                  choice={choice}
                  onChange={(resourceId, profile) => setChoice((c) => ({ ...c, [resourceId]: profile }))}
                />
              ))}
            </div>
          )}
        </section>

        <DialogFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {valid ? (
              <>
                <span className="text-foreground">{whoText}</span> → {whereText}, {howLongText}
              </>
            ) : (
              "Choose who and where to continue."
            )}
          </p>
          <Button onClick={() => void submit()} disabled={!valid} loading={saving}>
            {editing ? "Save access" : "Grant access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
