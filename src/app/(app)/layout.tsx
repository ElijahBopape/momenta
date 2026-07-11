import { AppHeader } from "@/components/brand/app-header";
import { createClient } from "@/lib/supabase/server";
import type { NotificationItem } from "@/components/brand/notification-bell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user = null;
  let notifications: NotificationItem[] = [];
  let unreadCount = 0;

  if (authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_mascot_id")
      .eq("id", authUser.id)
      .single();

    user = {
      id: authUser.id,
      displayName: profile?.display_name ?? authUser.email ?? "You",
      avatarMascotId: profile?.avatar_mascot_id ?? "bear",
    };

    const { data: rows } = await supabase
      .from("notifications")
      .select("id, type, invitation_id, read_at, created_at")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(15);

    const invitationIds = (rows ?? []).map((n) => n.invitation_id);
    const responseMap = new Map<string, { recipient_name: string; activity: string | null; response_date: string | null; response_time: string | null }>();
    if (invitationIds.length > 0) {
      const { data: responses } = await supabase
        .from("invitation_responses")
        .select("invitation_id, recipient_name, activity, response_date, response_time")
        .in("invitation_id", invitationIds);
      for (const r of responses ?? []) responseMap.set(r.invitation_id, r);
    }

    notifications = (rows ?? []).map((n) => {
      const r = responseMap.get(n.invitation_id);
      return {
        id: n.id,
        type: n.type,
        createdAt: n.created_at,
        readAt: n.read_at,
        invitationId: n.invitation_id,
        recipientName: r?.recipient_name ?? "Someone",
        activity: r?.activity ?? null,
        date: r?.response_date ?? null,
        time: r?.response_time ?? null,
      };
    });

    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", authUser.id)
      .is("read_at", null);
    unreadCount = count ?? 0;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} notifications={notifications} unreadCount={unreadCount} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
