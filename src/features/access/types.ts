import type { Member } from "@/features/members/types";

export type GrantScope = "environment" | "project";

export interface Grant {
  id: string;
  /** "project" grants cover every environment in the project, including ones created later. */
  scope: GrantScope;
  projectId: string;
  /** Null for project grants. */
  environmentId: string | null;
  userId: string;
  expiresAt: string | null;
  /** Resources not listed use the "default" credential profile. */
  resourceProfiles: { resourceId: string; profile: string }[];
  createdAt: string;
  createdBy: string;
}

export interface AccessMatrix {
  members: Member[];
  environments: { id: string; name: string; killed: boolean }[];
  grants: Grant[];
}

/** Body for setting a person's whole access to a project. */
export interface ProjectAccessInput {
  scope: "project" | "environments";
  environmentIds?: string[];
  expiresAt: string | null;
  resourceProfiles: { resourceId: string; profile: string }[];
}

export interface MemberAccess {
  userId: string;
  projects: {
    projectId: string;
    projectName: string;
    grants: (Grant & { environmentName: string | null })[];
  }[];
}
