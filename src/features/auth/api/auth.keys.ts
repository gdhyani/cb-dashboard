export const authKeys = {
  me: ["auth", "me"] as const,
  invite: (token: string) => ["auth", "invite", token] as const,
};
