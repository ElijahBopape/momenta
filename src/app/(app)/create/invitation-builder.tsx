"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { InvitationCard } from "@/components/brand/invitation-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MASCOTS } from "@/design/mascots";
import {
  MESSAGE_MAX_LENGTH,
  RECIPIENT_NAME_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  DEFAULT_CUSTOM_COLORS,
  type CustomColors,
} from "@/design/invitation";
import { saveDraft, sendInvitation, type InvitationPatch } from "./actions";
import { MascotPicker } from "./mascot-picker";
import { BackgroundPicker } from "./background-picker";
import { StickerPicker } from "./sticker-picker";

interface InvitationRow {
  id: string;
  title: string;
  message: string;
  recipient_name: string | null;
  share_token: string;
  design: { mascotId: string; backgroundId: string; customColors?: CustomColors; stickers: string[] };
}

const SAVE_DEBOUNCE_MS = 800;

export function InvitationBuilder({ invitation }: { invitation: InvitationRow }) {
  const [title, setTitle] = useState(invitation.title);
  const [message, setMessage] = useState(invitation.message);
  const [recipientName, setRecipientName] = useState(invitation.recipient_name ?? "");
  const [mascotId, setMascotId] = useState(invitation.design.mascotId ?? MASCOTS[0].id);
  const [backgroundId, setBackgroundId] = useState(invitation.design.backgroundId);
  const [customColors, setCustomColors] = useState<CustomColors>(invitation.design.customColors ?? DEFAULT_CUSTOM_COLORS);
  const [stickers, setStickers] = useState<string[]>(invitation.design.stickers ?? []);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [sendState, setSendState] = useState<"idle" | "sending" | "error">("idle");
  const [sentToken, setSentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isFirstRender = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const patch: InvitationPatch = {
    title,
    message,
    recipientName,
    design: { mascotId, backgroundId, customColors, stickers },
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (sentToken) return; // already sent, stop autosaving this row

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaveState("saving");
      const result = await saveDraft(invitation.id, patch);
      setSaveState(result.ok ? "saved" : "error");
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, message, recipientName, mascotId, backgroundId, customColors, stickers]);

  async function handleSend() {
    setSendState("sending");
    const result = await sendInvitation(invitation.id, patch);
    if (result.ok) {
      setSentToken(result.shareToken);
      setSendState("idle");
    } else {
      setSendState("error");
    }
  }

  const shareUrl = sentToken
    ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://momenta-web.vercel.app"}/i/${sentToken}`
    : null;

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (sentToken) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-5 py-8 text-center">
        <InvitationCard
          title={title}
          message={message}
          recipientName={recipientName}
          design={{ mascotId, backgroundId, customColors, stickers }}
          className="w-full"
        />
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-extrabold">It&apos;s sent 🎉</h1>
          <p className="text-sm text-muted-foreground">
            Share this link however you&apos;d reach them — text, DM, however.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm">
          <span className="flex-1 truncate text-left font-mono text-xs">{shareUrl}</span>
          <button type="button" onClick={copyLink} aria-label="Copy link" className="text-muted-foreground hover:text-foreground">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          The recipient page goes live in Milestone 3 — for now this link is a placeholder.
        </p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            window.location.href = "/create";
          }}
        >
          Create another invitation
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="order-2 space-y-6 lg:order-1">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Create an invitation</h1>
          <p className="text-sm text-muted-foreground">Fill this in — the preview updates as you go.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recipientName">Who&apos;s this for? (optional)</Label>
          <Input
            id="recipientName"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            maxLength={RECIPIENT_NAME_MAX_LENGTH}
            placeholder="Their name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={TITLE_MAX_LENGTH}
            placeholder="Hey there 👋"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">Your message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MESSAGE_MAX_LENGTH}
            rows={4}
            placeholder="I'd love to take you out this weekend — down for it?"
          />
          <p className="text-right text-xs text-muted-foreground">
            {message.length}/{MESSAGE_MAX_LENGTH}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Companion</Label>
          <MascotPicker value={mascotId} onChange={setMascotId} />
        </div>

        <div className="space-y-1.5">
          <Label>Background</Label>
          <BackgroundPicker
            value={backgroundId}
            customColors={customColors}
            onChange={setBackgroundId}
            onCustomColorsChange={setCustomColors}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Stickers</Label>
          <StickerPicker value={stickers} onChange={setStickers} />
        </div>

        {sendState === "error" && <p className="text-sm text-destructive">Couldn&apos;t send — try again.</p>}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSend} disabled={sendState === "sending" || !message.trim()} className="rounded-full px-8">
            {sendState === "sending" ? "Sending…" : "Send invitation"}
          </Button>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {saveState === "saving" && (
              <>
                <Loader2 className="size-3 animate-spin" /> Saving…
              </>
            )}
            {saveState === "saved" && "Draft saved"}
            {saveState === "error" && "Couldn't save — check your connection"}
          </span>
        </div>
      </div>

      <div className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
        <InvitationCard
          title={title}
          message={message}
          recipientName={recipientName}
          design={{ mascotId, backgroundId, customColors, stickers }}
        />
      </div>
    </div>
  );
}
