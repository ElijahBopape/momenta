"use client";

import { BACKGROUNDS } from "@/design/backgrounds";
import { CUSTOM_BACKGROUND_ID, DEFAULT_CUSTOM_COLORS, type CustomColors } from "@/design/invitation";
import { cn } from "@/lib/utils";

export function BackgroundPicker({
  value,
  customColors,
  onChange,
  onCustomColorsChange,
}: {
  value: string;
  customColors: CustomColors;
  onChange: (id: string) => void;
  onCustomColorsChange: (colors: CustomColors) => void;
}) {
  const isCustom = value === CUSTOM_BACKGROUND_ID;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {BACKGROUNDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onChange(b.id)}
            aria-pressed={value === b.id}
            className={cn(
              "flex items-center gap-2 rounded-full border-2 py-1 pr-3 pl-1 text-xs font-medium transition-colors",
              value === b.id ? "border-primary" : "border-border hover:border-muted-foreground"
            )}
          >
            <span className="size-6 rounded-full" style={{ background: b.cardBackground }} />
            {b.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(CUSTOM_BACKGROUND_ID)}
          aria-pressed={isCustom}
          className={cn(
            "flex items-center gap-2 rounded-full border-2 py-1 pr-3 pl-1 text-xs font-medium transition-colors",
            isCustom ? "border-primary" : "border-border hover:border-muted-foreground"
          )}
        >
          <span
            className="size-6 rounded-full"
            style={{ background: `linear-gradient(135deg, ${customColors.from}, ${customColors.to})` }}
          />
          Custom
        </button>
      </div>

      {isCustom && (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            From
            <input
              type="color"
              value={customColors.from}
              onChange={(e) => onCustomColorsChange({ ...customColors, from: e.target.value })}
              className="size-7 cursor-pointer rounded-md border border-border bg-transparent p-0"
              aria-label="Gradient start color"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            To
            <input
              type="color"
              value={customColors.to}
              onChange={(e) => onCustomColorsChange({ ...customColors, to: e.target.value })}
              className="size-7 cursor-pointer rounded-md border border-border bg-transparent p-0"
              aria-label="Gradient end color"
            />
          </label>
          <button
            type="button"
            onClick={() => onCustomColorsChange(DEFAULT_CUSTOM_COLORS)}
            className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
