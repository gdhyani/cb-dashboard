"use client";

import { CheckCircle2, ChevronDown, Link2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { type Resource, useResources } from "@/features/resources";
import { CopyCommand } from "@/shared/components/copy-command";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { useConnectStripe, useRegenerateWebhookSecret } from "../hooks/use-webhook-setup";
import { providerCanReach } from "../lib/endpoint";
import { WebhookEndpoint } from "./webhook-endpoint";

const str = (v: unknown) => (typeof v === "string" ? v : undefined);

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

function RazorpaySetup({
  envId,
  resource,
  url,
  initialSecret,
}: {
  envId: string;
  resource: Resource;
  url: string;
  initialSecret?: string;
}) {
  const regenerate = useRegenerateWebhookSecret(envId);
  const [secret, setSecret] = useState(initialSecret);
  return (
    <div className="flex flex-col gap-3">
      <WebhookEndpoint url={url} provider="razorpay" showSteps={!secret} />
      {secret ? (
        <GeneratedSecret secret={secret} />
      ) : resource.config.secretOrigin !== "generated" ? null : (
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
}

function StripeSetup({ envId, resource, url }: { envId: string; resource: Resource; url: string }) {
  const resources = useResources(envId);
  const connect = useConnectStripe(envId);
  const [manual, setManual] = useState(false);
  // The connect answer is newer than the resource this panel was opened with.
  const config = (connect.data ?? resource).config;
  // Services saved before secretsSet existed always had a pasted secret.
  const secretsSet = (config.secretsSet ?? { snapshot: true }) as { snapshot?: boolean; thin?: boolean };
  const connectedUrl = str(config.connectedUrl);
  const hasKey = (resources.data ?? []).some((r) => r.kind === "http" && r.config.provider === "stripe" && !r.disabled);
  const reachable = providerCanReach(url);
  const run = () => connect.mutate(resource.id);

  if (str(config.stripeEndpointId) && connectedUrl === url)
    return (
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 aria-hidden className="size-4 text-emerald-300" />
          Connected to Stripe — every event goes to cb, then only to the developer who caused it.
        </p>
        <WebhookEndpoint url={url} provider="stripe" showSteps={false} />
      </div>
    );

  if (str(config.stripeEndpointId))
    return (
      <div className="flex flex-col gap-2">
        <p role="alert" className="text-sm text-amber-300">
          Stripe still sends to an old address of this cb server. Reconnect to point it here.
        </p>
        <WebhookEndpoint url={url} provider="stripe" showSteps={false} />
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
      </div>
    );

  // A secret pasted by hand: the admin manages the endpoint in Stripe themselves.
  if (secretsSet.snapshot || !hasKey)
    return (
      <div className="flex flex-col gap-2">
        <WebhookEndpoint url={url} provider="stripe" />
        {!secretsSet.snapshot && !resources.isPending && (
          <p className="text-xs text-subtle">
            Add your Stripe secret key in this environment and cb can create the webhook in Stripe for you.
          </p>
        )}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-subtle">
        cb creates the webhook in your Stripe account with the Stripe key saved here, for every event. Nothing to copy.
      </p>
      {!reachable && (
        <p role="alert" className="text-xs text-destructive">
          Stripe can't reach this address. Set PUBLIC_URL on the backend to its public https address first.
        </p>
      )}
      <Button type="button" className="self-start" disabled={!reachable} loading={connect.isPending} onClick={run}>
        <Link2 className="size-4" />
        Connect Stripe
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="self-start"
        aria-expanded={manual}
        onClick={() => setManual((m) => !m)}
      >
        Set it up yourself
        <ChevronDown className={cn("size-3.5 transition-transform", manual && "rotate-180")} />
      </Button>
      {manual && <WebhookEndpoint url={url} provider="stripe" />}
    </div>
  );
}

/**
 * FR-WH-001: how a webhook gets its provider side set up, with the least copying — Stripe: Connect (cb creates the
 * endpoint with the stored Stripe key); Razorpay: the URL and the secret cb made, pasted once. Used after adding the
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
  const url = resource.webhookUrl ?? "";
  return resource.config.provider === "razorpay" ? (
    <RazorpaySetup envId={envId} resource={resource} url={url} initialSecret={generatedSecret} />
  ) : (
    <StripeSetup envId={envId} resource={resource} url={url} />
  );
}
