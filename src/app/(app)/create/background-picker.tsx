"use client";

import { BACKGROUNDS } from "@/design/backgrounds";
import { cn } from "@/lib/utils";

export function BackgroundPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
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
    </div>
  );
}
