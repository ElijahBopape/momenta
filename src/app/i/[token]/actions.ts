"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACTIVITIES } from "@/design/activities";
import { RECIPIENT_NAME_MAX_LENGTH } from "@/design/invitation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const activityIds = ACTIVITIES.map((a) => a.id) as [string, ...string[]];
const nameSchema = z.string().trim().min(1, "Tell us your name.").max(RECIPIENT_NAME_MAX_LENGTH);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

const RATE_LIMIT_ERROR = "Too many attempts — wait a few minutes and try again.";
const RESPOND_WINDOW_MS = 10 * 60 * 1000;

export type RespondResult = { ok: true } | { ok: false; error: string };

async function checkRespondRateLimit(token: string): Promise<boolean> {
  const ip = await getClientIp();
  const [byToken, byIp] = await Promise.all([
    checkRateLimit(`respond:token:${token}`, 10, RESPOND_WINDOW_MS),
    checkRateLimit(`respond:ip:${ip}`, 30, RESPOND_WINDOW_MS),
  ]);
  return byToken && byIp;
}

export async function declineInvitation(token: string, recipientName: string, declineCount: number): Promise<RespondResult> {
  if (!(await checkRespondRateLimit(token))) {
    return { ok: false, error: RATE_LIMIT_ERROR };
  }

  const parsedName = nameSchema.safeParse(recipientName);
  if (!parsedName.success) {
    return { ok: false, error: parsedName.error.issues[0].message };
  }

  const admin = createAdminClient();
  const { data: updated, error: updateError } = await admin
    .from("invitations")
    .update({ status: "declined", recipient_name: parsedName.data, updated_at: new Date().toISOString() })
    .eq("share_token", token)
    .eq("status", "pending")
    .select("id, owner_id")
    .maybeSingle();

  if (updateError) {
    return { ok: false, error: "Something went wrong — try again." };
  }
  if (!updated) {
    return { ok: false, error: "This invitation has already been answered." };
  }

  const { error: insertError } = await admin.from("invitation_responses").insert({
    invitation_id: updated.id,
    recipient_name: parsedName.data,
    decline_count: Math.max(declineCount, 1),
  });
  if (insertError) {
    console.error("invitation_responses insert failed after decline", insertError);
  }

  const { error: notifyError } = await admin.from("notifications").insert({
    user_id: updated.owner_id,
    invitation_id: updated.id,
    type: "declined",
  });
  if (notifyError) {
    console.error("notification insert failed after decline", notifyError);
  }

  return { ok: true };
}

const acceptSchema = z.object({
  recipientName: nameSchema,
  activity: z.enum(activityIds),
  date: z.string().regex(DATE_PATTERN, "Pick a valid date."),
  time: z.string().regex(TIME_PATTERN, "Pick a valid time."),
  declineCount: z.number().int().min(0),
});

export async function acceptInvitation(token: string, input: z.infer<typeof acceptSchema>): Promise<RespondResult> {
  if (!(await checkRespondRateLimit(token))) {
    return { ok: false, error: RATE_LIMIT_ERROR };
  }

  const parsed = acceptSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  if (parsed.data.date < todayISO) {
    return { ok: false, error: "Pick a date that hasn't passed." };
  }

  const admin = createAdminClient();
  const { data: updated, error: updateError } = await admin
    .from("invitations")
    .update({ status: "accepted", recipient_name: parsed.data.recipientName, updated_at: new Date().toISOString() })
    .eq("share_token", token)
    .eq("status", "pending")
    .select("id, owner_id")
    .maybeSingle();

  if (updateError) {
    return { ok: false, error: "Something went wrong — try again." };
  }
  if (!updated) {
    return { ok: false, error: "This invitation has already been answered." };
  }

  const { error: insertError } = await admin.from("invitation_responses").insert({
    invitation_id: updated.id,
    recipient_name: parsed.data.recipientName,
    activity: parsed.data.activity,
    response_date: parsed.data.date,
    response_time: parsed.data.time,
    decline_count: parsed.data.declineCount,
  });
  if (insertError) {
    console.error("invitation_responses insert failed after accept", insertError);
  }

  const { error: notifyError } = await admin.from("notifications").insert({
    user_id: updated.owner_id,
    invitation_id: updated.id,
    type: "accepted",
  });
  if (notifyError) {
    console.error("notification insert failed after accept", notifyError);
  }

  return { ok: true };
}
