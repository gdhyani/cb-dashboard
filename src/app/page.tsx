import { CLI_COMMANDS, PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants";
import { HealthStatus } from "@/features/health";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-6 py-24">
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">dashboard</p>
        <h1 className="text-5xl font-semibold tracking-tight">{PRODUCT_NAME}</h1>
        <p className="text-lg text-muted">{PRODUCT_TAGLINE}</p>
      </header>
      <HealthStatus />
      <footer className="flex flex-col gap-1 border-t border-border pt-6 font-mono text-sm text-muted">
        <span>{CLI_COMMANDS.login}</span>
        <span>{CLI_COMMANDS.init}</span>
      </footer>
    </main>
  );
}
