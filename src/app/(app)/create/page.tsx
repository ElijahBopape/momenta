import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_INVITATION_DESIGN } from "@/design/invitation";
import { InvitationBuilder } from "./invitation-builder";

export default async function CreateInvitationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existingDraft } = await supabase
    .from("invitations")
    .select("*")
    .eq("owner_id", user!.id)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let draft = existingDraft;

  if (!draft) {
    const { data: created, error } = await supabase
      .from("invitations")
      .insert({
        owner_id: user!.id,
        share_token: nanoid(24),
        design: DEFAULT_INVITATION_DESIGN,
      })
      .select("*")
      .single();

    if (error || !created) {
      throw new Error("Couldn't start a new invitation draft. Try refreshing the page.");
    }
    draft = created;
  }

  return <InvitationBuilder invitation={draft} />;
}
