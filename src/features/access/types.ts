import type { Member } from "@/features/members/types";

export interface Grant {
  id: string;
  environmentId: string;
  userId: string;
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
}

export interface AccessMatrix {
  members: Member[];
  environments: { id: string; name: string; killed: boolean }[];
  grants: Grant[];
}
