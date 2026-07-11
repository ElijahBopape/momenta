import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Mascot } from "@/components/brand/mascot";
import { StatusBadge } from "@/components/brand/status-badge";
import { ComingSoon } from "@/components/brand/coming-soon";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

export default async function InvitationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, title, recipient_name, status, design, created_at, sent_at")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  const sortable = (invitations ?? []).filter((i) => !(i.status === "draft" && !i.title && !i.recipient_name));

  const answeredIds = sortable.filter((i) => i.status !== "draft" && i.status !== "pending").map((i) => i.id);
  const responseNames = new Map<string, string>();
  if (answeredIds.length > 0) {
    const { data: responses } = await supabase
      .from("invitation_responses")
      .select("invitation_id, recipient_name")
      .in("invitation_id", answeredIds);
    for (const r of responses ?? []) responseNames.set(r.invitation_id, r.recipient_name);
  }

  if (sortable.length === 0) {
    return (
      <ComingSoon
        mascot="bear"
        title="No invitations yet"
        description="Once you send one, it'll show up here with its status — pending, accepted, or declined."
        milestone="Head to Create Invitation to send your first one"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Your invitations</h1>
        <p className="text-sm text-muted-foreground">Everything you&apos;ve sent, and what&apos;s still a draft.</p>
      </div>

      <ul className="space-y-3">
        {sortable.map((invitation) => {
          const displayName = responseNames.get(invitation.id) || invitation.recipient_name;
          return (
            <li key={invitation.id}>
              <Link
                href={invitation.status === "draft" ? "/create" : `/invitations/${invitation.id}`}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <Mascot species={invitation.design.mascotId} mood="happy" className="h-14 w-auto shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{displayName || invitation.title || "Untitled invitation"}</p>
                  <p className="text-xs text-muted-foreground">
                    {invitation.sent_at ? `Sent ${formatDate(invitation.sent_at)}` : `Created ${formatDate(invitation.created_at)}`}
                  </p>
                </div>
                <StatusBadge status={invitation.status} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
