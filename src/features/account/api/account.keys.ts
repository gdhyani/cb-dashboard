// Same keys as the devices feature uses, so a revoke here refreshes the Devices & Sessions page too.
export const accountKeys = {
  sessions: (orgId: string) => ["orgs", orgId, "sessions"] as const,
  devices: ["me", "devices"] as const,
  deletion: ["me", "deletion"] as const,
};
