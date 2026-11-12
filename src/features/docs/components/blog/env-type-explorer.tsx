"use client";

import { useId, useState } from "react";
import { StaggerBlock } from "@/shared/components/stagger";
import { ENV_TYPE_GROUPS, ENV_TYPES, type EnvKind, MODE_LABEL } from "../../lib/env-types";
import { HopStrip } from "./hop-strip";

const KIND_STYLE: Record<EnvKind, { label: string; className: string }> = {
  plain: { label: "plain", className: "bg-white/[0.06] text-subtle" },
  generated: { label: "per developer", className: "bg-sky-400/15 text-sky-300" },
  "stand-in": { label: "stand-in", className: "bg-emerald-400/15 text-emerald-300" },
  real: { label: "real value", className: "bg-amber-400/15 text-amber-300" },
};

/**
 * FR-DOC-010: every env type cb supports. Pick one to see the .env lines the app gets, how the connection travels
 * (hop by hop, with protocols and ports) and where the real value is used.
 */
export function EnvTypeExplorer({ initial }: { initial?: string }) {
  const [id, setId] = useState(initial ?? ENV_TYPES[0].id);
  const t = ENV_TYPES.find((x) => x.id === id) ?? ENV_TYPES[0];
  const base = useId();
  return (
    <div className="not-prose my-8 grid gap-4 rounded-xl border border-border p-3 sm:p-4 lg:grid-cols-[15rem_1fr]">
      <div role="tablist" aria-label="Env types" aria-orientation="vertical" className="flex flex-col gap-3">
        {ENV_TYPE_GROUPS.map((g) => (
          <div key={g}>
            <p className="px-2 text-[11px] font-medium text-subtle">{g}</p>
            <div className="mt-1 flex flex-wrap gap-1 lg:flex-col">
              {ENV_TYPES.filter((x) => x.group === g).map((x) => (
                <button
                  key={x.id}
                  type="button"
                  role="tab"
                  id={`${base}-${x.id}`}
                  aria-selected={x.id === id}
                  aria-controls={`${base}-panel`}
                  onClick={() => setId(x.id)}
                  className={`rounded-md px-2 py-1 text-left text-[13px] transition-colors ${
                    x.id === id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {x.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-${t.id}`}
        className="min-w-0 rounded-lg bg-[#060606] p-4 sm:p-5"
      >
        <StaggerBlock key={t.id} className="flex flex-col gap-5">
          <div>
            <p className="text-lg font-semibold text-foreground">{t.name}</p>
            <p className="mt-1 text-xs text-subtle">{MODE_LABEL[t.mode]}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">What your app gets in process.env</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {t.lines.map((l) => (
                <li key={l.key} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[12.5px]">
                  <span className="text-foreground">{l.key}</span>
                  <span className="min-w-0 break-all text-[#bdbdbd]">= {l.value}</span>
                  <span className={`rounded-md px-1.5 py-0.5 font-sans text-[10.5px] ${KIND_STYLE[l.kind].className}`}>
                    {KIND_STYLE[l.kind].label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">How the connection travels</p>
            <div className="mt-2">
              {t.hops.length > 0 ? (
                <HopStrip hops={t.hops} />
              ) : (
                <p className="rounded-lg border border-dashed border-[#2a2a2a] px-3 py-2.5 text-[13px] text-muted-foreground">
                  No connection goes through cb. The value is used inside your app.
                </p>
              )}
            </div>
          </div>
          <p className="text-[14px] leading-relaxed text-[#c8c8c8]">{t.how}</p>
          <dl className="grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-subtle">The real value lives</dt>
              <dd className="mt-0.5 text-foreground">{t.realLives}</dd>
            </div>
            <div>
              <dt className="text-subtle">Verified with a real account</dt>
              <dd className="mt-0.5 text-foreground">
                {t.verified.length ? t.verified.join(", ") : "Not applicable or Beta"}
              </dd>
            </div>
          </dl>
        </StaggerBlock>
      </div>
    </div>
  );
}
