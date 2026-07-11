"use client";

import { useState } from "react";
import { Mascot } from "@/components/brand/mascot";
import { InvitationCard } from "@/components/brand/invitation-card";
import { Confetti } from "@/components/brand/confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACTIVITIES, getActivity } from "@/design/activities";
import { RECIPIENT_NAME_MAX_LENGTH } from "@/design/invitation";
import { cn } from "@/lib/utils";
import { AddToCalendarButton } from "@/components/brand/add-to-calendar-button";
import { WeatherWidget } from "@/components/brand/weather-widget";
import { declineInvitation, acceptInvitation } from "./actions";
import type { PublicInvitation } from "./data";

const REJECT_LINES = [
  "Wait... are you absolutely sure? 🥺",
  "Maybe give it another thought 😉",
  "Hmm, wrong button — try the other one 😌",
  "The universe requires a yes to continue ✨",
  "That button's just for decoration, try yes 😏",
  "Bold move. Try again 👀",
];

type Screen = "name" | "ask" | "reject" | "activity" | "datetime" | "celebrate" | "declined";

function pickRejectLine(exclude: string | null) {
  const options = REJECT_LINES.filter((l) => l !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PublicInvitationFlow({ token, invitation }: { token: string; invitation: PublicInvitation }) {
  const [screen, setScreen] = useState<Screen>("name");
  const [recipientName, setRecipientName] = useState(invitation.recipientName ?? "");
  const [noCount, setNoCount] = useState(0);
  const [rejectLine, setRejectLine] = useState<string | null>(null);
  const [activity, setActivity] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const design = invitation.design;
  const mood = screen === "reject" ? "smirk" : screen === "celebrate" ? "party" : "happy";

  function handleNo() {
    if (screen === "ask") {
      setNoCount((n) => n + 1);
      setRejectLine(pickRejectLine(null));
      setScreen("reject");
      return;
    }
    // second, confirmed decline
    setNoCount((n) => n + 1);
    setSubmitting(true);
    setError(null);
    declineInvitation(token, recipientName, noCount + 1).then((result) => {
      setSubmitting(false);
      if (result.ok) {
        setScreen("declined");
      } else {
        setError(result.error);
      }
    });
  }

  async function handleConfirmAccept() {
    if (!activity || !date || !time) return;
    setSubmitting(true);
    setError(null);
    const result = await acceptInvitation(token, { recipientName, activity, date, time, declineCount: noCount });
    setSubmitting(false);
    if (result.ok) {
      setScreen("celebrate");
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      {screen === "celebrate" && <Confetti />}

      {screen === "name" && (
        <div className="w-full space-y-5 text-center">
          <Mascot species={design.mascotId} mood="happy" className="mx-auto h-28 w-auto" />
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-extrabold">What should we call you?</h1>
            <p className="text-sm text-muted-foreground">So the invite gets your name right.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (recipientName.trim()) setScreen("ask");
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5 text-left">
              <Label htmlFor="recipientName">Your name</Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                maxLength={RECIPIENT_NAME_MAX_LENGTH}
                placeholder="Your name"
              />
            </div>
            <Button type="submit" disabled={!recipientName.trim()} className="w-full rounded-full">
              Continue
            </Button>
          </form>
        </div>
      )}

      {(screen === "ask" || screen === "reject") && (
        <div className="w-full space-y-5 text-center">
          <InvitationCard
            title={invitation.title || `Hey ${recipientName} 👋`}
            message={screen === "reject" ? (rejectLine ?? "") : invitation.message}
            recipientName={recipientName}
            design={design}
            mood={mood}
            className="w-full"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={() => setScreen("activity")} className="flex-1 rounded-full">
              Yes 🥰
            </Button>
            <Button
              onClick={handleNo}
              disabled={submitting}
              variant="outline"
              className="flex-1 rounded-full"
            >
              {screen === "reject" ? (submitting ? "…" : "No, I'm sure") : "No"}
            </Button>
          </div>
        </div>
      )}

      {screen === "activity" && (
        <div className="w-full space-y-5">
          <div className="text-center">
            <Mascot species={design.mascotId} mood="happy" className="mx-auto h-24 w-auto" />
            <h1 className="mt-2 font-display text-2xl font-extrabold">What sounds good?</h1>
            <p className="text-sm text-muted-foreground">Pick an activity.</p>
          </div>
          <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1">
            {ACTIVITIES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setActivity(a.id)}
                aria-pressed={activity === a.id}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition-colors",
                  activity === a.id ? "border-primary bg-secondary" : "border-border hover:border-muted-foreground"
                )}
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-xs font-medium">{a.label}</span>
              </button>
            ))}
          </div>
          <Button onClick={() => setScreen("datetime")} disabled={!activity} className="w-full rounded-full">
            Next →
          </Button>
        </div>
      )}

      {screen === "datetime" && (
        <div className="w-full space-y-5">
          <div className="text-center">
            <Mascot species={design.mascotId} mood="happy" className="mx-auto h-24 w-auto" />
            <h1 className="mt-2 font-display text-2xl font-extrabold">When works?</h1>
            <p className="text-sm text-muted-foreground">Pick a day and time.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleConfirmAccept} disabled={!date || !time || submitting} className="w-full rounded-full">
            {submitting ? "Confirming…" : "It's a date! 🎉"}
          </Button>
        </div>
      )}

      {screen === "celebrate" && (
        <div className="w-full space-y-5 text-center">
          <Mascot species={design.mascotId} mood="party" className="mx-auto h-32 w-auto" />
          <h1 className="font-display text-3xl font-extrabold">IT&apos;S A DATE! 🎉</h1>
          <div className="w-full rounded-2xl border border-border bg-card p-4 text-left text-sm">
            <p className="font-semibold">
              {getActivity(activity ?? "")?.emoji} {getActivity(activity ?? "")?.label}
            </p>
            <p className="text-muted-foreground">
              {new Date(date + "T00:00:00").toLocaleDateString("en-ZA", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="text-muted-foreground">{time}</p>
          </div>

          <div className="flex justify-center">
            <WeatherWidget date={date} />
          </div>

          <AddToCalendarButton
            className="w-full rounded-full"
            event={{
              uid: `${token}@momenta-web.vercel.app`,
              summary: `${getActivity(activity ?? "")?.emoji ?? ""} ${getActivity(activity ?? "")?.label ?? "Date"}`.trim(),
              description: "Planned via momenta",
              date,
              time,
            }}
          />
          <p className="text-xs text-muted-foreground">
            Finding a spot for it is in a different tab — message them to lock in exactly where.
          </p>
        </div>
      )}

      {screen === "declined" && (
        <div className="w-full space-y-4 text-center">
          <Mascot species={design.mascotId} mood="smirk" className="mx-auto h-28 w-auto" />
          <h1 className="font-display text-2xl font-extrabold">No worries</h1>
          <p className="text-sm text-muted-foreground">Maybe next time. Thanks for letting them know.</p>
        </div>
      )}
    </div>
  );
}
