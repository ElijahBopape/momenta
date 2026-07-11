"use client";

import { STICKERS, MAX_STICKERS } from "@/design/stickers";
import { cn } from "@/lib/utils";

export function StickerPicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((s) => s !== id));
    } else if (value.length < MAX_STICKERS) {
      onChange([...value, id]);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STICKERS.map((s) => {
          const selected = value.includes(s.id);
          const disabled = !selected && value.length >= MAX_STICKERS;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              disabled={disabled}
              aria-pressed={selected}
              aria-label={s.label}
              className={cn(
                "flex size-10 items-center justify-center rounded-full border-2 text-lg transition-colors",
                selected ? "border-primary bg-secondary" : "border-border hover:border-muted-foreground",
                disabled && "opacity-40"
              )}
            >
              {s.emoji}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {value.length}/{MAX_STICKERS} selected
      </p>
    </div>
  );
}
