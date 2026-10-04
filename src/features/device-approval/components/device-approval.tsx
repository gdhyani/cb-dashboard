"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { AuthCard } from "@/features/auth/components/auth-card";
import { useMe } from "@/features/auth/hooks/use-auth";
import { FormField } from "@/shared/components/form-field";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useApproveDevice } from "../hooks/use-approve-device";

/** FR-AUTH-002: confirm the code printed by `npx cb login`. */
export function DeviceApproval({ initialCode }: { initialCode: string }) {
  const me = useMe();
  const approve = useApproveDevice();
  const [code, setCode] = useState(initialCode.toUpperCase());
  const [deviceName, setDeviceName] = useState("");

  if (approve.data) {
    return (
      <AuthCard title="Device approved" description="Return to your terminal — the CLI is now logged in.">
        <p className="flex items-center gap-2 font-mono text-sm">
          <Check className="size-4" /> {approve.data.deviceName} · {approve.data.os}
        </p>
      </AuthCard>
    );
  }
  return (
    <AuthCard
      title="Approve CLI login"
      description={me.data ? `Signed in as ${me.data.user.email}. Only approve codes you just requested.` : undefined}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          approve.mutate({ userCode: code.trim(), ...(deviceName.trim() ? { deviceName: deviceName.trim() } : {}) });
        }}
      >
        <FormField id="code" label="Code from your terminal" hint="Looks like ABCD-EFGH.">
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono text-lg tracking-[0.3em]"
            autoComplete="off"
          />
        </FormField>
        <FormField id="device" label="Device name (optional)">
          <Input
            id="device"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g. work laptop"
          />
        </FormField>
        <Button type="submit" disabled={approve.isPending || code.trim().length < 9}>
          Approve
        </Button>
      </form>
    </AuthCard>
  );
}
