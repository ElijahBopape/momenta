import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvitationCard } from "@/components/brand/invitation-card";
import { StatusBadge } from "@/components/brand/status-badge";
import { CopyLinkButton } from "./copy-link-button";

export default async function InvitationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user!.id)
    .single();

  if (!invitation) {
    notFound();
  }

  if (invitation.status === "draft") {
    redirect("/create");
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://momenta-web.vercel.app"}/i/${invitation.share_token}`;
  const sentDate = invitation.sent_at
    ? new Date(invitation.sent_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-4 text-center">
      <StatusBadge status={invitation.status} />
      <InvitationCard
        title={invitation.title}
        message={invitation.message}
        recipientName={invitation.recipient_name}
        design={invitation.design}
        className="w-full"
      />
      {sentDate && <p className="text-xs text-muted-foreground">Sent {sentDate}</p>}

      {invitation.status === "pending" && (
        <div className="flex w-full items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm">
          <span className="flex-1 truncate text-left font-mono text-xs">{shareUrl}</span>
          <CopyLinkButton url={shareUrl} />
        </div>
      )}

      {(invitation.status === "accepted" || invitation.status === "declined") && (
        <p className="text-sm text-muted-foreground">
          {invitation.status === "accepted"
            ? "They said yes! Plan details land here once Milestone 4 ships notifications."
            : "They declined this one."}
        </p>
      )}
    </div>
  );
}
