export interface Environment {
  id: string;
  projectId: string;
  orgId: string;
  name: string;
  killed: boolean;
  killedReason: string | null;
  version: number;
  hasAccess: boolean;
}
