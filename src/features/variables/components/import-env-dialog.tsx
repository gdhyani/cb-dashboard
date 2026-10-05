"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError } from "@/shared/api/api-error";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import * as api from "../api/variables.api";
import { variableKeys } from "../api/variables.keys";
import { buildCreateRequest, KEY_PATTERN } from "../lib/catalog";
import { type DotenvEntry, guessType, IMPORTABLE, parseDotenv } from "../lib/dotenv";
import type { CreateVariableInput } from "../types";

interface Row extends DotenvEntry {
  choice: string;
  exists: boolean;
  result?: { ok: boolean; message?: string };
}

const choiceOf = (g: { type: string; provider?: string }) => (g.provider ? `${g.type}:${g.provider}` : g.type);

/** OQ10: paste a whole .env; each line gets its own "What is this?" and goes through the normal Save & test. */
export function ImportEnvDialog({
  envId,
  open,
  onOpenChange,
  existingKeys,
}: {
  envId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingKeys: string[];
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [skippedLines, setSkippedLines] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  // Each opening starts clean; pasted values never outlive the dialog (FR-UI-001).
  useEffect(() => {
    if (open) {
      setText("");
      setRows(null);
      setDone(false);
      setSkippedLines(0);
    }
  }, [open]);

  function review() {
    const parsed = parseDotenv(text);
    setText("");
    setSkippedLines(parsed.skipped.length);
    setRows(
      parsed.entries
        .filter((e) => KEY_PATTERN.test(e.key))
        .map((e) => ({
          ...e,
          choice: choiceOf(guessType(e.key, e.value)),
          exists: existingKeys.includes(e.key),
        })),
    );
  }

  const toImport = rows?.filter((r) => !r.exists) ?? [];

  async function importAll() {
    if (!rows) return;
    setRunning(true);
    const next = [...rows];
    for (const [i, r] of next.entries()) {
      if (r.exists) continue;
      const [type, provider] = r.choice.split(":");
      try {
        if (type === "plain") await api.createVariable(envId, { type: "plain", key: r.key, value: r.value });
        else if (type === "gen")
          await api.createVariable(envId, {
            type: "generated",
            key: r.key,
            format: "base64:32",
          } as CreateVariableInput);
        else {
          const req = buildCreateRequest({
            key: r.key,
            type: type as never,
            provider,
            value: r.value,
            fields: {},
            extras: [],
          });
          await api.createService(envId, req.body);
        }
        next[i] = { ...r, value: "", result: { ok: true } };
      } catch (err) {
        next[i] = {
          ...r,
          value: "",
          result: { ok: false, message: err instanceof ApiError ? err.message : "Not added" },
        };
      }
      setRows([...next]);
    }
    setRunning(false);
    setDone(true);
    await qc.invalidateQueries({ queryKey: variableKeys.list(envId) });
  }

  const added = rows?.filter((r) => r.result?.ok).length ?? 0;
  const failed = rows?.filter((r) => r.result && !r.result.ok).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import .env</DialogTitle>
          <DialogDescription>
            Paste the file once. Pick what each key is; protected values are tested, encrypted on cb's server and never
            shown again.
          </DialogDescription>
        </DialogHeader>
        {rows === null ? (
          <FormField id="import-env" label="Your .env" hint="KEY=value per line; comments and export are fine.">
            <Textarea
              id="import-env"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              spellCheck={false}
              className="font-mono text-xs"
              placeholder={"DATABASE_URL=postgres://…\nSTRIPE_SECRET_KEY=sk_live_…"}
            />
          </FormField>
        ) : (
          <div className="flex flex-col gap-2">
            {skippedLines > 0 && (
              <p className="text-xs text-subtle">
                {skippedLines} line{skippedLines > 1 ? "s" : ""} weren't KEY=value and are left out.
              </p>
            )}
            <ul className="divide-y divide-border rounded-lg border border-border">
              {rows.map((r, i) => (
                <li
                  key={r.key}
                  className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-mono text-sm">{r.key}</span>
                  {r.exists ? (
                    <span className="text-xs text-subtle">already exists — left as is</span>
                  ) : r.result ? (
                    <span className="flex items-center gap-1.5 text-xs">
                      {r.result.ok ? <Check className="size-3.5" /> : <X className="size-3.5 text-destructive" />}
                      {r.result.ok ? "Added" : r.result.message}
                    </span>
                  ) : (
                    <select
                      aria-label={`What is ${r.key}?`}
                      value={r.choice}
                      disabled={running}
                      onChange={(e) =>
                        setRows((all) => all?.map((x, j) => (j === i ? { ...x, choice: e.target.value } : x)) ?? null)
                      }
                      className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                    >
                      {IMPORTABLE.map((o) => (
                        <option key={choiceOf(o)} value={choiceOf(o)}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                </li>
              ))}
            </ul>
            {done && (
              <p role="status" className="text-sm">
                {added} added{failed > 0 ? `, ${failed} not added — fix those with Add variable` : ""}.
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {done ? "Done" : "Cancel"}
          </Button>
          {rows === null ? (
            <Button type="button" disabled={!text.trim()} onClick={review}>
              Review
            </Button>
          ) : (
            !done && (
              <Button type="button" disabled={toImport.length === 0} loading={running} onClick={() => void importAll()}>
                Import {toImport.length} variable{toImport.length === 1 ? "" : "s"}
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
