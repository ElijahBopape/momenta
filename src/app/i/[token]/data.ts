import { createAdminClient } from "@/lib/supabase/admin";
import type { InvitationDesign } from "@/design/invitation";

export interface PublicInvitation {
  title: string;
  message: string;
  recipientName: string | null;
  design: InvitationDesign;
  status: "pending" | "accepted" | "declined";
  response: {
    recipientName: string;
    activity: string | null;
    date: string | null;
    time: string | null;
  } | null;
}

/**
 * The only place `invitations`/`invitation_responses` are read by an
 * unauthenticated visitor — narrow, hardcoded field list, exact
 * share_token match only, never exposes id/owner_id to the caller.
 */
export async function getPublicInvitation(token: string): Promise<PublicInvitation | null> {
  const admin = createAdminClient();

  const { data: invitation } = await admin
    .from("invitations")
    .select("id, title, message, recipient_name, design, status")
    .eq("share_token", token)
    .maybeSingle();

  if (!invitation || invitation.status === "draft") {
    return null;
  }

  let response: PublicInvitation["response"] = null;
  if (invitation.status !== "pending") {
    const { data } = await admin
      .from("invitation_responses")
      .select("recipient_name, activity, response_date, response_time")
      .eq("invitation_id", invitation.id)
      .maybeSingle();
    if (data) {
      response = {
        recipientName: data.recipient_name,
        activity: data.activity,
        date: data.response_date,
        time: data.response_time,
      };
    }
  }

  return {
    title: invitation.title,
    message: invitation.message,
    recipientName: invitation.recipient_name,
    design: invitation.design,
    status: invitation.status as "pending" | "accepted" | "declined",
    response,
  };
}
