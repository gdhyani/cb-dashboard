export const orgKeys = {
  all: ["orgs"] as const,
  detail: (orgId: string) => ["orgs", orgId] as const,
};
