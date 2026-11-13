import { ServiceLogo } from "@/shared/components/service-logo";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export interface MapService {
  id: string;
  label: string;
  detail: string;
  icon: string;
}

function Node({ title, detail, strong = false }: { title: string; detail: string; strong?: boolean }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-0.5 rounded-md border px-3 py-2",
        strong ? "border-border-stronger bg-surface-300" : "border-border bg-surface-200",
      )}
    >
      <span className="truncate text-sm font-medium text-foreground">{title}</span>
      <span className="truncate font-mono text-[11px] text-foreground-lighter">{detail}</span>
    </div>
  );
}

/** Dashed on the laptop side (fake values), solid past the gateway (real credentials). */
function Link({ solid = false }: { solid?: boolean }) {
  return (
    <div aria-hidden className="flex items-center justify-center">
      <span
        className={cn(
          "h-5 w-px md:h-px md:w-full md:min-w-6",
          solid ? "bg-foreground-lighter" : "border-l border-dashed border-border-stronger md:border-t md:border-l-0",
        )}
      />
    </div>
  );
}

/** How an app in this environment reaches each service: fake values locally, real credentials only server-side. */
export function ConnectionMap({ services }: { services: MapService[] }) {
  if (services.length === 0) return null;
  return (
    <Card>
      <CardHeader className="gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Connection map</CardTitle>
          <CardDescription>How apps in this environment reach each service</CardDescription>
        </div>
        <span className="flex shrink-0 items-center gap-4 text-xs text-foreground-lighter">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="w-4 border-t border-dashed border-border-stronger" /> fake values
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-px w-4 bg-foreground-lighter" /> real credentials
          </span>
        </span>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 items-center md:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)_2rem_minmax(0,1fr)_2rem_minmax(0,1.3fr)]">
          <Node title="Your app" detail="process.env: fake only" />
          <Link />
          <Node title="cb agent" detail="127.0.0.1 · byte pipe" />
          <Link />
          <Node title="Gateway" detail="verifies, injects secrets" strong />
          <Link solid />
          <ul className="flex flex-col gap-1.5 border-l border-foreground-lighter pl-3">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-surface-75 px-3 py-1.5"
              >
                <ServiceLogo icon={s.icon} />
                <span className="min-w-[40%] flex-1 truncate font-mono text-sm text-foreground">{s.label}</span>
                <span className="max-w-[55%] truncate text-right font-mono text-[11px] text-foreground-lighter">
                  {s.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
