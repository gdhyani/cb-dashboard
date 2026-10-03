export interface EnvironmentSummary {
  id: string;
  name: string;
  killed: boolean;
  killedReason: string | null;
  hasAccess: boolean;
}

export interface Project {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string;
  environments: EnvironmentSummary[];
  createdAt: string;
}
