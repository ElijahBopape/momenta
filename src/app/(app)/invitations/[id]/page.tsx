import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvitationCard } from "@/components/brand/invitation-card";
import { StatusBadge } from "@/components/brand/status-badge";
import { AddToCalendarButton } from "@/components/brand/add-to-calendar-button";
import { WeatherWidget } from "@/components/brand/weather-widget";
import { getActivity } from "@/design/activities";
import { CopyLinkButton } from "./copy-link-button";

function formatResponseDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatResponseTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

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

  let response: { recipient_name: string; activity: string | null; response_date: string | null; response_time: string | null } | null = null;
  if (invitation.status !== "pending") {
    const { data } = await supabase
      .from("invitation_responses")
      .select("recipient_name, activity, response_date, response_time")
      .eq("invitation_id", invitation.id)
      .maybeSingle();
    response = data;
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://momenta-web.vercel.app"}/i/${invitation.share_token}`;
  const sentDate = invitation.sent_at
    ? new Date(invitation.sent_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const activity = response?.activity ? getActivity(response.activity) : undefined;

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-4 text-center">
      <StatusBadge status={invitation.status} />
      <InvitationCard
        title={invitation.title}
        message={invitation.message}
        recipientName={response?.recipient_name ?? invitation.recipient_name}
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

      {invitation.status === "accepted" && activity && response?.response_date && response?.response_time && (
        <>
          <div className="w-full rounded-2xl border border-border bg-card p-4 text-left text-sm">
            <p className="font-semibold">
              {activity.emoji} {activity.label}
            </p>
            <p className="text-muted-foreground">{formatResponseDate(response.response_date)}</p>
            <p className="text-muted-foreground">{formatResponseTime(response.response_time)}</p>
          </div>

          <WeatherWidget date={response.response_date} />

          <AddToCalendarButton
            className="w-full rounded-full"
            event={{
              uid: `${invitation.id}@momenta-web.vercel.app`,
              summary: `${activity.emoji} ${activity.label} with ${response.recipient_name}`,
              description: "Planned via momenta",
              date: response.response_date,
              time: response.response_time,
            }}
          />
        </>
      )}

      {invitation.status === "declined" && <p className="text-sm text-muted-foreground">They declined this one.</p>}
    </div>
  );
}
