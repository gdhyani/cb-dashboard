import type { Member } from "@/features/members/types";

export interface Grant {
  id: string;
  environmentId: string;
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
