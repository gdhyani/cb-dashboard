export type Role = "owner" | "admin" | "developer";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Me {
  user: User;
  memberships: { orgId: string; orgName: string; role: Role }[];
}

export interface InvitePreview {
  orgName: string;
  role: Role;
  email: string | null;
  expiresAt: string;
}
