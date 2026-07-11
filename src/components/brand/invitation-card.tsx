import { Mascot } from "@/components/brand/mascot";
import { getBackground } from "@/design/backgrounds";
import { getSticker } from "@/design/stickers";
import type { InvitationDesign } from "@/design/invitation";

export interface InvitationCardProps {
  title: string;
  message: string;
  recipientName?: string | null;
  design: InvitationDesign;
  className?: string;
}

export function InvitationCard({ title, message, recipientName, design, className }: InvitationCardProps) {
  const background = getBackground(design.backgroundId);
  const isLight = background.textTone === "light";

  return (
    <div
      className={`rounded-[28px] border p-7 text-center shadow-lg ${
        isLight ? "border-white/10" : "border-black/5"
      } ${className ?? ""}`}
      style={{ background: background.cardBackground }}
    >
      <Mascot species={design.mascotId} mood="happy" className="mx-auto h-32 w-auto" />

      <h2
        className={`mt-2 font-display text-2xl font-extrabold ${isLight ? "text-white" : "text-[#2A1145]"}`}
      >
        {title?.trim() || (recipientName ? `Hey ${recipientName} 👋` : "Hey there 👋")}
      </h2>

      <p
        className={`mx-auto mt-2 max-w-xs text-[15px] leading-relaxed whitespace-pre-wrap ${
          isLight ? "text-white/85" : "text-[#6b5a86]"
        }`}
      >
        {message?.trim() || "I'd love to take you out — down for it?"}
      </p>

      {design.stickers.length > 0 && (
        <div className="mt-4 flex justify-center gap-2 text-2xl">
          {design.stickers.map((id) => {
            const sticker = getSticker(id);
            return sticker ? <span key={id}>{sticker.emoji}</span> : null;
          })}
        </div>
      )}
    </div>
  );
}
