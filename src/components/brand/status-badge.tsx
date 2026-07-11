import { CheckCircle2, Clock, PenLine, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS = {
  draft: { label: "Draft", icon: PenLine, className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", icon: Clock, className: "bg-secondary text-secondary-foreground" },
  accepted: { label: "Accepted", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  declined: { label: "Declined", icon: XCircle, className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  const { label, icon: Icon, className } = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
