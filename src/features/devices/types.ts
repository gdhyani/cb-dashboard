export interface Device {
  id: string;
  name: string;
  os: string;
  user: { id: string; name: string; email: string };
  lastSeenAt: string | null;
  createdAt: string;
  revoked: boolean;
}
