/** FR-WH-001: where each provider takes the URL and shows (or takes) the signing secret. */
export const WEBHOOK_SETUP: Record<string, string> = {
  stripe:
    "In the Stripe Dashboard, open Developers → Webhooks, add a destination with this URL, then copy its signing secret.",
  razorpay:
    "In the Razorpay Dashboard, open Account & Settings → Webhooks, add this URL and the same secret you saved here.",
};

export const providerName = (provider: string | undefined) =>
  provider === "razorpay" ? "Razorpay" : provider === "stripe" ? "Stripe" : "the provider";

const PRIVATE_HOST = [
  /^localhost$/,
  /\.local(host)?$/,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^\[(::1?|f[cd][0-9a-f]*:.*|fe80:.*)\]$/i,
];

/** False when a provider on the internet can't call this URL (PUBLIC_URL unset, or a local/private address). */
export function providerCanReach(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return !PRIVATE_HOST.some((re) => re.test(host));
}
