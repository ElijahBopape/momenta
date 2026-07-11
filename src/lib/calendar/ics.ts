export interface IcsEventInput {
  uid: string;
  summary: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // "HH:MM" (from an <input type="time">) or "HH:MM:SS" (from Postgres) — both accepted
  durationHours?: number;
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Pure — safe to call from server or client code. */
export function buildIcs(event: IcsEventInput): string {
  const normalizedTime = event.time.split(":").length === 2 ? `${event.time}:00` : event.time;
  const start = new Date(`${event.date}T${normalizedTime}`);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`buildIcs: invalid date/time "${event.date}T${event.time}"`);
  }
  const end = new Date(start.getTime() + (event.durationHours ?? 2) * 60 * 60 * 1000);
  const now = new Date();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//momenta//momenta//EN",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
  ];
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/** Browser-only — triggers a file download. */
export function downloadIcs(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
