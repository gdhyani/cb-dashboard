"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { FormError } from "@/shared/components/form-error";
import { FormField } from "@/shared/components/form-field";
import { PasswordInput } from "@/shared/components/password-input";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useLogin, useMe } from "../hooks/use-auth";
import { safeNext } from "../lib/next-path";
import { LoginSchema } from "../schemas/auth.schemas";
import { AuthCard } from "./auth-card";

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const me = useMe({ allowSignedOut: true });
  const login = useLogin();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });
  const errors = form.formState.errors;

  // Already signed in (e.g. a bookmarked /login): skip the form.
  const signedIn = Boolean(me.data);
  useEffect(() => {
    if (signedIn) router.replace(next);
  }, [signedIn, next, router]);

  // A stale error should not linger once the user starts fixing the form.
  const { reset: resetLogin, isError } = login;
  useEffect(() => {
    if (!isError) return;
    const sub = form.watch(() => resetLogin());
    return () => sub.unsubscribe();
  }, [form, isError, resetLogin]);

  const submit = form.handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: () => router.replace(next),
      onError: (error) => {
        if (error.code === "INVALID_CREDENTIALS") {
          form.resetField("password");
          form.setFocus("password");
        }
      },
    }),
  );

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
      <form className="flex flex-col gap-4" noValidate onSubmit={submit}>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
        </FormField>
        <FormError error={login.error} />
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}
