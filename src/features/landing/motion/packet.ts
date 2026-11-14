/**
 * What the how-it-works packet carries, as a pure function of where the packet IS (a fractional node index:
 * 0 = .env, 1 = Preload, 2 = Agent, 3 = Tunnel, 4 = Gateway, 5 = api.stripe.com). Owner rule: the real key only at
 * the .env and on the last two stops; the placeholder in between. It switches when the packet crosses halfway.
 */
export type PacketState = "real" | "standin" | "upstream";

export const PACKET: Record<PacketState, { text: string; note: string }> = {
  real: { text: "sk_live_••••••••", note: "real key, in your .env" },
  standin: { text: "sk_test_cb_amber-otter-falls", note: "placeholder key" },
  upstream: { text: "sk_live_••••••••", note: "real key, added by cb" },
};

export function packetStateAt(f: number): PacketState {
  if (f < 0.5) return "real";
  if (f < 3.5) return "standin";
  return "upstream";
}
