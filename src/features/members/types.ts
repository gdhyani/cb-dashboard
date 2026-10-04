import type { Role } from "@/features/auth/types";

export interface Member {
  userId: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export interface Invite {
  id: string;
  role: Role;
  email: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface CreatedInvite extends Invite {
  token: string;
  url: string;
}
