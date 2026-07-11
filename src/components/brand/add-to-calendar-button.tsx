"use client";

import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildIcs, downloadIcs, type IcsEventInput } from "@/lib/calendar/ics";

export function AddToCalendarButton({ event, className }: { event: IcsEventInput; className?: string }) {
  function handleClick() {
    try {
      const ics = buildIcs(event);
      downloadIcs("momenta-date.ics", ics);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't build the calendar file — try again.");
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} className={className}>
      <CalendarPlus className="size-4" />
      Add to calendar
    </Button>
  );
}
