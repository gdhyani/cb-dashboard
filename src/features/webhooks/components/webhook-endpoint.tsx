import { CopyCommand } from "@/shared/components/copy-command";
import { providerCanReach, providerName, WEBHOOK_SETUP } from "../lib/endpoint";

/**
 * FR-WH-001: the cb URL the admin pastes into Stripe/Razorpay (not the app's own route), its setup steps,
 * and a warning when the provider can't reach it. Shown wherever a webhook service is, so it is never lost.
 */
export function WebhookEndpoint({ url, provider }: { url: string; provider?: string }) {
  const name = providerName(provider);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[13px] font-medium">Webhook URL · paste into {name}</span>
      <CopyCommand command={url} prompt={false} label="Copy webhook URL" toastLabel="Webhook URL copied" wrap />
      {!providerCanReach(url) && (
        <p role="alert" className="text-xs text-destructive">
          {name === "the provider" ? "The provider" : name} can't reach this address. Set PUBLIC_URL on the backend to
          its public https address (for example a tunnel), then paste the new URL into {name}.
        </p>
      )}
      {provider && WEBHOOK_SETUP[provider] && <p className="text-xs text-subtle">{WEBHOOK_SETUP[provider]}</p>}
    </div>
  );
}
