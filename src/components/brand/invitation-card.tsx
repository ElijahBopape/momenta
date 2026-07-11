import type { CSSProperties } from "react";
import { Mascot } from "@/components/brand/mascot";
import type { MascotMood } from "@/design/mascots";
import { getBackground } from "@/design/backgrounds";
import { getSticker } from "@/design/stickers";
import { buildCustomGradient, getCustomTextTone, CUSTOM_BACKGROUND_ID, type InvitationDesign } from "@/design/invitation";

export interface InvitationCardProps {
  title: string;
  message: string;
  recipientName?: string | null;
  design: InvitationDesign;
  mood?: MascotMood;
  className?: string;
}

// Fixed corner slots (pinned close to the true edge, not scaled by card
// height) so up to MAX_STICKERS (4) read as scattered decoration baked into
// the card's background rather than a UI row appended below content. Slots
// 2-3 sit in the bottom corners, so the content wrapper reserves extra
// bottom padding once a 3rd sticker is added to keep them clear of text.
const STICKER_SLOTS: CSSProperties[] = [
  { top: 14, left: 14, transform: "rotate(-14deg)", fontSize: "1.6rem" },
  { top: 14, right: 14, transform: "rotate(12deg)", fontSize: "1.9rem" },
  { bottom: 12, left: 16, transform: "rotate(9deg)", fontSize: "1.7rem" },
  { bottom: 12, right: 16, transform: "rotate(-11deg)", fontSize: "2rem" },
];

export function InvitationCard({ title, message, recipientName, design, mood = "happy", className }: InvitationCardProps) {
  const isCustom = design.backgroundId === CUSTOM_BACKGROUND_ID && design.customColors;
  const cardBackground = isCustom ? buildCustomGradient(design.customColors!) : getBackground(design.backgroundId).cardBackground;
  const isLight = isCustom ? getCustomTextTone(design.customColors!) === "light" : getBackground(design.backgroundId).textTone === "light";
  const reserveBottomSpace = design.stickers.length >= 3;

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border p-7 text-center shadow-lg ${
        isLight ? "border-white/10" : "border-black/5"
      } ${className ?? ""}`}
      style={{ background: cardBackground }}
    >
      {design.stickers.slice(0, STICKER_SLOTS.length).map((id, i) => {
        const sticker = getSticker(id);
        if (!sticker) return null;
        return (
          <span
            key={id}
            aria-hidden="true"
            className="pointer-events-none absolute z-0 drop-shadow-sm select-none"
            style={{ ...STICKER_SLOTS[i], opacity: isLight ? 0.85 : 0.9 }}
          >
            {sticker.emoji}
          </span>
        );
      })}

      <div className={`relative z-10 ${reserveBottomSpace ? "pb-6" : ""}`}>
        <Mascot species={design.mascotId} mood={mood} className="mx-auto h-32 w-auto" />

        <h2 className={`mt-2 font-display text-2xl font-extrabold ${isLight ? "text-white" : "text-[#2A1145]"}`}>
          {title?.trim() || (recipientName ? `Hey ${recipientName} 👋` : "Hey there 👋")}
        </h2>

        <p
          className={`mx-auto mt-2 max-w-[15rem] text-[15px] leading-relaxed whitespace-pre-wrap ${
            isLight ? "text-white/85" : "text-[#6b5a86]"
          }`}
        >
          {message?.trim() || "I'd love to take you out — down for it?"}
        </p>
      </div>
    </div>
  );
}
