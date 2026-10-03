import { apiGet, apiPost } from "@/shared/api/http";
import type { InvitePreview, Me } from "../types";

export const getMe = () => apiGet<Me>("/auth/me");
export const login = (body: { email: string; password: string }) => apiPost<Me>("/auth/login", body);
export const signup = (body: { name: string; email: string; password: string; orgName: string }) =>
  apiPost<Me>("/auth/signup", body);
export const logout = () => apiPost<{ loggedOut: true }>("/auth/logout");
export const previewInvite = (token: string) => apiGet<InvitePreview>(`/invites/${encodeURIComponent(token)}`);
export const acceptInvite = (body: { token: string; name?: string; email?: string; password?: string }) =>
  apiPost<{ orgId: string; me: Me }>("/auth/accept-invite", body);
