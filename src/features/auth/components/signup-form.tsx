"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { DOCS_PATH } from "@/constants";
import { DocsLink } from "@/shared/components/docs-link";
import { FormError } from "@/shared/components/form-error";
import { FormField } from "@/shared/components/form-field";
import { PasswordInput } from "@/shared/components/password-input";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useSignup } from "../hooks/use-auth";
import { safeNext } from "../lib/next-path";
import { SignupSchema } from "../schemas/auth.schemas";
import { AuthCard } from "./auth-card";

export function SignupForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const signup = useSignup();
  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { name: "", email: "", password: "", orgName: "" },
  });
  const errors = form.formState.errors;
  return (
    <AuthCard
      title="Get started"
      description="Create your account and organization. You are its owner and can invite your team after"
      footer={
        <div className="flex flex-col items-center gap-4">
          <span>
            Have an account?{" "}
            <Link
              className="text-foreground underline underline-offset-4 hover:text-foreground-light"
              href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            >
              Sign in
            </Link>
          </span>
          <DocsLink href={DOCS_PATH}>Read the docs</DocsLink>
        </div>
      }
    >
      <form
        method="post"
        className="flex flex-col gap-5"
        noValidate
        onSubmit={form.handleSubmit((values) => signup.mutate(values, { onSuccess: () => router.replace(next) }))}
      >
        <FormField id="name" label="Your name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={Boolean(errors.name)} {...form.register("name")} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password?.message} hint="At least 8 characters">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
        </FormField>
        <FormField
          id="orgName"
          label="Organization"
          error={errors.orgName?.message}
          hint="Usually your company or team"
        >
          <Input
            id="orgName"
            autoComplete="organization"
            aria-invalid={Boolean(errors.orgName)}
            {...form.register("orgName")}
          />
        </FormField>
        <FormError error={signup.error} />
        <Button type="submit" size="lg" block loading={signup.isPending}>
          Sign up
        </Button>
      </form>
    </AuthCard>
  );
}
