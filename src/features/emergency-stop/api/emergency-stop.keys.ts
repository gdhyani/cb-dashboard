export const stopKeys = {
  list: (orgId: string) => ["orgs", orgId, "killswitches"] as const,
};
