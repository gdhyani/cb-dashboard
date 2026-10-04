"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useLogin } from "../hooks/use-auth";
import { safeNext } from "../lib/next-path";
import { LoginSchema } from "../schemas/auth.schemas";
import { AuthCard } from "./auth-card";

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const login = useLogin();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  const errors = form.formState.errors;
  return (
    <AuthCard
      title="Log in"
      description="Manage projects, environments and who can reach them."
      footer={
        <>
          No account?{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          >
            Create one
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => login.mutate(values, { onSuccess: () => router.replace(next) }))}
      >
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        </FormField>
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}
