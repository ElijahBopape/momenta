"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site-url";

export type ActionState = { error: string } | null;

const emailSchema = z.email("Enter a valid email address.");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters.");

const signUpSchema = z.object({
  displayName: z.string().trim().min(1, "Tell us what to call you.").max(60),
  email: emailSchema,
  password: passwordSchema,
});

export async function signUp(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${getSiteURL()}/auth/confirm?next=/create`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/signup/success");
}

const logInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export async function logIn(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = logInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "That email and password don't match." };
  }

  const next = (formData.get("next") as string) || "/create";
  redirect(next);
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

const requestResetSchema = z.object({ email: emailSchema });

export async function requestPasswordReset(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = requestResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteURL()}/auth/confirm?next=/update-password`,
  });

  // Always redirect to the same "check your email" screen, whether or not
  // the address has an account — confirming account existence to an
  // anonymous requester is an enumeration risk we don't need to take.
  redirect("/reset-password/sent");
}

const updatePasswordSchema = z.object({ password: passwordSchema });

export async function updatePassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }

  redirect("/create");
}
