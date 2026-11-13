import Link from "next/link";
import type { ReactNode } from "react";
import { CLI_COMMANDS, PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants";
import { CopyCommand } from "@/shared/components/copy-command";

/**
 * Supabase-style sign-in shell. Desktop: the form column on the left (product mark, heading, description, form,
 * footer) and a quiet panel on the right with a short product statement and the CLI commands. Phones: the form only.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-background">
      <main className="flex min-w-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:max-w-[50%] xl:max-w-[44%]">
        {/* The product mark: brand teal with its own ink (as in the org shell). */}
        <Link
          href="/"
          aria-label={`${PRODUCT_NAME} home`}
          className="flex size-8 items-center justify-center rounded-md bg-brand font-mono text-xs font-semibold text-brand-foreground"
        >
          {PRODUCT_NAME}
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 py-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-medium text-foreground">{title}</h1>
            {description && <div className="text-sm text-foreground-light">{description}</div>}
          </div>
          {children}
          {footer && <div className="text-center text-sm text-foreground-light">{footer}</div>}
        </div>
      </main>
      <aside className="hidden flex-1 flex-col justify-center border-l border-border bg-alternative px-12 lg:flex xl:px-20">
        <div className="flex max-w-lg flex-col gap-8">
          <blockquote className="flex flex-col gap-4">
            <p className="text-2xl leading-snug text-foreground">
              Run your app with every key it needs, without a single real secret on your laptop.
            </p>
            <footer className="heading-meta text-foreground-lighter">{PRODUCT_TAGLINE}</footer>
          </blockquote>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-foreground-light">Set up a project in three commands</p>
            <CopyCommand command={CLI_COMMANDS.install} />
            <CopyCommand command={CLI_COMMANDS.login} />
            <CopyCommand command={CLI_COMMANDS.init} />
          </div>
        </div>
      </aside>
    </div>
  );
}
