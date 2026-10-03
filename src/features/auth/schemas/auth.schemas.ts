import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
export const SignupSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  orgName: z.string().trim().min(1, "Name your organization"),
});
export const AcceptInviteSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
