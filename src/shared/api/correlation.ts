/** One id per user flow; pass it through request config to group related calls in server logs. */
export function newCorrelationId(): string {
  return crypto.randomUUID();
}
