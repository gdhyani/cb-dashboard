// zod/mini: the sign-in, sign-up and invite pages are the first app pages a visitor loads, so their schemas use the
// tree-shakable build (a fraction of the full library); @hookform/resolvers handles both.
import * as z from "zod/mini";

const name = z.string().check(z.trim(), z.minLength(1, "Enter your name"));
const email = z.email("Enter a valid email");
const newPassword = z.string().check(z.minLength(8, "At least 8 characters"));

export const LoginSchema = z.object({
  email,
  password: z.string().check(z.minLength(1, "Enter your password")),
});
export const SignupSchema = z.object({
  name,
  email,
  password: newPassword,
  orgName: z.string().check(z.trim(), z.minLength(1, "Name your organization")),
});
export const AcceptInviteSchema = z.object({ name, email, password: newPassword });
