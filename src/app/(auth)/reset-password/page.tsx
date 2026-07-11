"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ActionState } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState<ActionState, FormData>(requestPasswordReset, null);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-2xl font-extrabold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">We&apos;ll email you a link to set a new one.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <SubmitButton>Send reset link</SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
