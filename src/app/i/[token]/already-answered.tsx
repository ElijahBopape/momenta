import { InvitationCard } from "@/components/brand/invitation-card";
import { getActivity } from "@/design/activities";
import type { PublicInvitation } from "./data";

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function AlreadyAnswered({ invitation }: { invitation: PublicInvitation }) {
  const accepted = invitation.status === "accepted";
  const activity = invitation.response?.activity ? getActivity(invitation.response.activity) : undefined;

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <InvitationCard
        title={invitation.title}
        message={invitation.message}
        recipientName={invitation.response?.recipientName ?? invitation.recipientName}
        design={invitation.design}
        className="w-full"
      />
      <h1 className="font-display text-2xl font-extrabold">
        {accepted ? "This one's already a yes 🎉" : "This one's already been answered"}
      </h1>
      {accepted && activity && invitation.response?.date && invitation.response?.time && (
        <div className="w-full rounded-2xl border border-border bg-card p-4 text-left text-sm">
          <p className="font-semibold">
            {activity.emoji} {activity.label}
          </p>
          <p className="text-muted-foreground">{formatDate(invitation.response.date)}</p>
          <p className="text-muted-foreground">{formatTime(invitation.response.time)}</p>
        </div>
      )}
      {!accepted && <p className="text-sm text-muted-foreground">Maybe next time.</p>}
    </main>
  );
}
