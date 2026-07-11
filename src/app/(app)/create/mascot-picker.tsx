"use client";

import { Mascot } from "@/components/brand/mascot";
import { MASCOTS } from "@/design/mascots";
import { cn } from "@/lib/utils";

export function MascotPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {MASCOTS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          aria-pressed={value === m.id}
          aria-label={m.name}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition-colors",
            value === m.id ? "border-primary bg-secondary" : "border-transparent hover:bg-muted"
          )}
        >
          <Mascot species={m.id} mood="happy" className="h-14 w-auto" />
        </button>
      ))}
    </div>
  );
}
