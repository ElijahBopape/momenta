"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { toast } from "sonner";
import { Bell, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getActivity } from "@/design/activities";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NotificationLinkItem({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <MenuPrimitive.LinkItem
      render={<Link href={href} />}
      closeOnClick
      className={cn(
        "flex items-start gap-2 rounded-md px-1.5 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground",
        className
      )}
    >
      {children}
    </MenuPrimitive.LinkItem>
  );
}

export interface NotificationItem {
  id: string;
  type: "accepted" | "declined";
  createdAt: string;
  readAt: string | null;
  invitationId: string;
  recipientName: string;
  activity: string | null;
  date: string | null;
  time: string | null;
}

function formatMessage(n: NotificationItem): string {
  if (n.type === "declined") {
    return `${n.recipientName} declined your invitation.`;
  }
  const activity = n.activity ? getActivity(n.activity) : undefined;
  if (activity && n.date) {
    const dateLabel = new Date(n.date + "T00:00:00").toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
    return `${n.recipientName} said yes! ${activity.emoji} ${activity.label} on ${dateLabel}.`;
  }
  return `${n.recipientName} said yes! 🎉`;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({
  userId,
  initialNotifications,
  initialUnreadCount,
}: {
  userId: string;
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // @supabase/ssr's browser client stores the session in cookies and does
    // not automatically forward it to the Realtime client — without this,
    // postgres_changes RLS evaluates as unauthenticated and silently
    // delivers nothing, no error either side.
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) supabase.realtime.setAuth(session.access_token);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          async (payload) => {
            const row = payload.new as { id: string; type: "accepted" | "declined"; created_at: string; invitation_id: string };
            const { data: response } = await supabase
              .from("invitation_responses")
              .select("recipient_name, activity, response_date, response_time")
              .eq("invitation_id", row.invitation_id)
              .maybeSingle();

            const item: NotificationItem = {
              id: row.id,
              type: row.type,
              createdAt: row.created_at,
              readAt: null,
              invitationId: row.invitation_id,
              recipientName: response?.recipient_name ?? "Someone",
              activity: response?.activity ?? null,
              date: response?.response_date ?? null,
              time: response?.response_time ?? null,
            };

            setNotifications((prev) => [item, ...prev]);
            setUnreadCount((c) => c + 1);
            toast(formatMessage(item), {
              icon: item.type === "accepted" ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-rose-600" />,
            });
          }
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      authSubscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  async function markAllRead() {
    if (unreadCount === 0) return;
    const supabase = createClient();
    const now = new Date().toISOString();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    await supabase.from("notifications").update({ read_at: now }).eq("user_id", userId).is("read_at", null);
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && markAllRead()}>
      <DropdownMenuTrigger aria-label="Notifications" className="relative flex size-9 items-center justify-center rounded-full hover:bg-muted">
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">Nothing yet — responses show up here live.</p>
        )}
        {notifications.map((n) => (
          <NotificationLinkItem key={n.id} href={`/invitations/${n.invitationId}`} className={cn("whitespace-normal", !n.readAt && "bg-secondary/60")}>
            {n.type === "accepted" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
            )}
            <span className="flex-1 leading-snug">
              {formatMessage(n)}
              <span className="mt-0.5 block text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
            </span>
          </NotificationLinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
