"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { MASCOTS } from "@/design/mascots";
import { BACKGROUNDS } from "@/design/backgrounds";
import { STICKERS, MAX_STICKERS } from "@/design/stickers";
import { MESSAGE_MAX_LENGTH, TITLE_MAX_LENGTH, RECIPIENT_NAME_MAX_LENGTH } from "@/design/invitation";

const mascotIds = MASCOTS.map((m) => m.id) as [string, ...string[]];
const backgroundIds = BACKGROUNDS.map((b) => b.id) as [string, ...string[]];
const stickerIds = STICKERS.map((s) => s.id) as [string, ...string[]];

const patchSchema = z.object({
  title: z.string().trim().max(TITLE_MAX_LENGTH),
  message: z.string().trim().max(MESSAGE_MAX_LENGTH),
  recipientName: z.string().trim().max(RECIPIENT_NAME_MAX_LENGTH),
  design: z.object({
    mascotId: z.enum(mascotIds),
    backgroundId: z.enum(backgroundIds),
    stickers: z.array(z.enum(stickerIds)).max(MAX_STICKERS),
  }),
});

export type InvitationPatch = z.infer<typeof patchSchema>;
export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveDraft(id: string, patch: InvitationPatch): Promise<ActionResult> {
  const parsed = patchSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("invitations")
    .update({
      title: parsed.data.title,
      message: parsed.data.message,
      recipient_name: parsed.data.recipientName || null,
      design: parsed.data.design,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "draft");

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export type SendResult = { ok: true; shareToken: string } | { ok: false; error: string };

export async function sendInvitation(id: string, patch: InvitationPatch): Promise<SendResult> {
  const parsed = patchSchema.safeParse(patch);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  if (!parsed.data.message) {
    return { ok: false, error: "Write a message before sending." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .update({
      title: parsed.data.title,
      message: parsed.data.message,
      recipient_name: parsed.data.recipientName || null,
      design: parsed.data.design,
      status: "pending",
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "draft")
    .select("share_token")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Couldn't send — try again." };
  }
  return { ok: true, shareToken: data.share_token };
}
