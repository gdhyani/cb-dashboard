"use client";

import { CheckCircle2, ChevronDown, ExternalLink, Link2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { type Resource, useResources } from "@/features/resources";
import { ChoiceCards } from "@/shared/components/choice-cards";
import { CopyCommand } from "@/shared/components/copy-command";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import type { StripePayload } from "../api/webhooks.api";
import { useConnectWebhook, useRegenerateWebhookSecret } from "../hooks/use-webhook-setup";
import { providerCanReach } from "../lib/endpoint";
import { WebhookEndpoint } from "./webhook-endpoint";

const str = (v: unknown) => (typeof v === "string" ? v : undefined);
const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

type Mode = "full" | "thin" | "both";
const MODES = [
  { value: "full", title: "Full events", hint: "stripe.webhooks.constructEvent — most apps" },
  { value: "thin", title: "Thin events", hint: "stripe.parseEventNotification" },
  { value: "both", title: "Both", hint: "Your code reads full and thin events" },
] as const;
const payloadsOf = (m: Mode): StripePayload[] => (m === "both" ? ["full", "thin"] : [m]);
const modeOf = (p: string[]): Mode =>
  p.includes("full") && p.includes("thin") ? "both" : p.includes("thin") ? "thin" : "full";

/** Where to change a destination's events (the dashboard opens it directly). */
export const stripeDashboardLink = (id: string, livemode: boolean) =>
  `https://dashboard.stripe.com/${livemode ? "" : "test/"}workbench/webhooks/${id}`;
export const RAZORPAY_WEBHOOKS_LINK = "https://dashboard.razorpay.com/app/webhooks";

function ProviderLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-foreground underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLink aria-hidden className="size-3" />
    </a>
  );
}

/** One connected destination: what it receives and where to change that. */
function ConnectedRow({
  title,
  events,
  allEvents,
  href,
  where,
}: {
  title: string;
  events: string[];
  allEvents?: boolean;
  href: string;
  where: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border px-3 py-2.5">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <CheckCircle2 aria-hidden className="size-4 text-emerald-300" />
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-xs text-subtle">
          {allEvents ? "all events, including ones Stripe adds later" : `${events.length} events`}
        </span>
      </p>
      {!allEvents && events.length > 0 && (
        <>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 self-start text-xs text-subtle hover:text-foreground"
          >
            Show events
            <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
          </button>
          {open && <p className="font-mono text-[11px] leading-5 text-muted-foreground">{events.join(", ")}</p>}
        </>
      )}
      <p className="flex flex-wrap items-center gap-x-2 text-xs text-subtle">
        To add or remove events, change them in {where}:<ProviderLink href={href}>Open in {where}</ProviderLink>
      </p>
    </div>
  );
}

function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="self-start"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </Button>
      {open && children}
    </>
  );
}

/** The one secret cb made for Razorpay, shown while this panel is open and never again. */
function GeneratedSecret({ secret }: { secret: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[13px] font-medium">Signing secret · paste into Razorpay</span>
      <CopyCommand command={secret} prompt={false} label="Copy signing secret" toastLabel="Signing secret copied" />
      <p className="text-xs text-subtle">
        Shown only now. In Razorpay, open Account &amp; Settings → Webhooks → Add new webhook, paste the URL and this
        secret, pick your events and save.
      </p>
    </div>
  );
}

const hasKey = (resources: Resource[] | undefined, provider: string) =>
  (resources ?? []).some((r) => r.kind === "http" && r.config.provider === provider && !r.disabled);

function StaleWarning({ name }: { name: string }) {
  return (
    <p role="alert" className="text-sm text-amber-300">
      {name} still sends to an old address of this cb server. Reconnect to point it here.
    </p>
  );
}

function UnreachableWarning({ name }: { name: string }) {
  return (
    <p role="alert" className="text-xs text-destructive">
      {name} can't reach this address. Set PUBLIC_URL on the backend to its public https address first.
    </p>
  );
}

function StripeSetup({ envId, resource }: { envId: string; resource: Resource }) {
  const resources = useResources(envId);
  const connect = useConnectWebhook(envId);
  // The connect answer is newer than the resource this panel was opened with.
  const current = connect.data ?? resource;
  const config = current.config;
  const url = current.webhookUrl ?? "";
  const fullId = str(config.stripeEndpointId);
  const thinId = str(config.stripeThinDestinationId);
  const connectedPayloads = list(config.connectedPayloads);
  const connected = Boolean(fullId || thinId);
  const live = config.livemode === true;
  const [mode, setMode] = useState<Mode>(
    connected ? modeOf(connectedPayloads.length ? connectedPayloads : ["full"]) : "full",
  );
  const reachable = providerCanReach(url);
  const run = (m: Mode) => connect.mutate({ id: resource.id, payloads: payloadsOf(m) });
  // Services saved before secretsSet existed always had a pasted secret.
  const secretsSet = (config.secretsSet ?? { snapshot: true }) as { snapshot?: boolean; thin?: boolean };

  if (connected) {
    const currentMode = modeOf(connectedPayloads.length ? connectedPayloads : ["full"]);
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-foreground">
          Connected to Stripe — events go to cb, then only to the developer who caused them.
        </p>
        {str(config.connectedUrl) !== url && <StaleWarning name="Stripe" />}
        {fullId && (
          <ConnectedRow
            title="Full events"
            events={[]}
            allEvents
            href={stripeDashboardLink(fullId, live)}
            where="Stripe"
          />
        )}
        {thinId && (
          <ConnectedRow
            title="Thin events"
            events={list(config.thinEvents)}
            href={stripeDashboardLink(thinId, live)}
            where="Stripe"
          />
        )}
        <WebhookEndpoint url={url} provider="stripe" showSteps={false} />
        <Disclosure label="Change what your app receives">
          <div className="flex flex-col gap-2">
            <ChoiceCards
              name={`stripe-mode-${resource.id}`}
              legend="Your app's webhook code uses"
              choices={MODES}
              value={mode}
              onChange={setMode}
              columns={3}
            />
            <p className="text-xs text-subtle">
              A type you turn off is removed in Stripe too. Both arrive at the same URL and the same key.
            </p>
            <Button
              type="button"
              size="sm"
              className="self-start"
              disabled={!reachable || mode === currentMode}
              loading={connect.isPending}
              onClick={() => run(mode)}
            >
              Apply in Stripe
            </Button>
          </div>
        </Disclosure>
        {str(config.connectedUrl) !== url && (
          <Button
            type="button"
            size="sm"
            className="self-start"
            disabled={!reachable}
            loading={connect.isPending}
            onClick={() => run(currentMode)}
          >
            <RefreshCw className="size-3.5" />
            Reconnect
          </Button>
        )}
      </div>
    );
  }

  // A secret pasted by hand (or no Stripe key here): the admin manages the destination in Stripe themselves.
  if (secretsSet.snapshot || secretsSet.thin || !hasKey(resources.data, "stripe"))
    return (
      <div className="flex flex-col gap-2">
        <WebhookEndpoint url={url} provider="stripe" />
        {!secretsSet.snapshot && !secretsSet.thin && !resources.isPending && (
          <p className="text-xs text-subtle">
            Add your Stripe secret key in this environment and cb can create the webhook in Stripe for you.
          </p>
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[13px] font-medium">Your app's webhook code uses</span>
      <ChoiceCards
        name={`stripe-mode-${resource.id}`}
        legend="Your app's webhook code uses"
        choices={MODES}
        value={mode}
        onChange={setMode}
        columns={3}
      />
      <p className="text-xs text-subtle">
        {mode === "thin"
          ? "cb subscribes the thin destination to 12 payment, checkout, subscription and invoice events."
          : mode === "both"
            ? "Full events: every event. Thin events: 12 payment, checkout, subscription and invoice events."
            : "cb subscribes to every Stripe event."}{" "}
        You can add or remove events in Stripe any time; cb shows the link after connecting.
      </p>
      {!reachable && <UnreachableWarning name="Stripe" />}
      <Button
        type="button"
        className="self-start"
        disabled={!reachable}
        loading={connect.isPending}
        onClick={() => run(mode)}
      >
        <Link2 className="size-4" />
        Connect Stripe
      </Button>
      <Disclosure label="Set it up yourself">
        <WebhookEndpoint url={url} provider="stripe" />
      </Disclosure>
    </div>
  );
}

function RazorpaySetup({
  envId,
  resource,
  initialSecret,
}: {
  envId: string;
  resource: Resource;
  initialSecret?: string;
}) {
  const resources = useResources(envId);
  const connect = useConnectWebhook(envId);
  const regenerate = useRegenerateWebhookSecret(envId);
  const [secret, setSecret] = useState(initialSecret);
  const current = connect.data ?? resource;
  const config = current.config;
  const url = current.webhookUrl ?? "";
  const reachable = providerCanReach(url);
  const run = () => connect.mutate({ id: resource.id });

  if (str(config.razorpayWebhookId))
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-foreground">
          Connected to Razorpay — events go to cb, then only to the developer who caused them.
        </p>
        {str(config.connectedUrl) !== url && <StaleWarning name="Razorpay" />}
        <ConnectedRow
          title="Webhook"
          events={list(config.razorpayEvents)}
          href={RAZORPAY_WEBHOOKS_LINK}
          where="Razorpay"
        />
        <WebhookEndpoint url={url} provider="razorpay" showSteps={false} />
        {str(config.connectedUrl) !== url && (
          <Button
            type="button"
            size="sm"
            className="self-start"
            disabled={!reachable}
            loading={connect.isPending}
            onClick={run}
          >
            <RefreshCw className="size-3.5" />
            Reconnect
          </Button>
        )}
      </div>
    );

  const manual = (
    <div className="flex flex-col gap-3">
      <WebhookEndpoint url={url} provider="razorpay" showSteps={!secret} />
      {secret ? (
        <GeneratedSecret secret={secret} />
      ) : config.secretOrigin !== "generated" ? null : (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-subtle">
          <span>The signing secret was shown once when this key was added.</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            loading={regenerate.isPending}
            onClick={() =>
              regenerate.mutate(resource.id, { onSuccess: (r) => r.generatedSecret && setSecret(r.generatedSecret) })
            }
          >
            <RefreshCw className="size-3.5" />
            New secret
          </Button>
        </div>
      )}
    </div>
  );

  if (!hasKey(resources.data, "razorpay"))
    return (
      <div className="flex flex-col gap-2">
        {manual}
        {!resources.isPending && (
          <p className="text-xs text-subtle">
            Add your Razorpay key in this environment and cb can create the webhook in Razorpay for you.
          </p>
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-subtle">
        cb creates the webhook in your Razorpay account with the Razorpay key saved here, for payment, order and refund
        events, and keeps its secret. Nothing to copy. You can add or remove events in Razorpay any time.
      </p>
      {!reachable && <UnreachableWarning name="Razorpay" />}
      <Button type="button" className="self-start" disabled={!reachable} loading={connect.isPending} onClick={run}>
        <Link2 className="size-4" />
        Connect Razorpay
      </Button>
      <Disclosure label="Set it up yourself">{manual}</Disclosure>
    </div>
  );
}

/**
 * FR-WH-001: how a webhook gets its provider side set up, with the least copying — Connect (cb creates the webhook
 * with the stored API key: Stripe full / thin / both, Razorpay), or the URL and secret to paste. Used after adding the
 * key, in its Edit dialog and on the Webhooks tab.
 */
export function WebhookSetup({
  envId,
  resource,
  generatedSecret,
}: {
  envId: string;
  resource: Resource;
  /** Razorpay: the secret from the create answer, shown once. */
  generatedSecret?: string;
}) {
  return resource.config.provider === "razorpay" ? (
    <RazorpaySetup envId={envId} resource={resource} initialSecret={generatedSecret} />
  ) : (
    <StripeSetup envId={envId} resource={resource} />
  );
}
