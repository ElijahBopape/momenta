import { Mascot } from "@/components/brand/mascot";
import { Card, CardContent } from "@/components/ui/card";
import type { MascotId } from "@/design/mascots";

export function ComingSoon({
  mascot,
  title,
  description,
  milestone,
}: {
  mascot: MascotId;
  title: string;
  description: string;
  milestone: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <Mascot species={mascot} mood="happy" className="h-32 w-auto" />
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl font-extrabold">{title}</h1>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs tracking-wide text-secondary-foreground uppercase">
          {milestone}
        </span>
      </CardContent>
    </Card>
  );
}
