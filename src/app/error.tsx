"use client";

import { useEffect } from "react";
import { Mascot } from "@/components/brand/mascot";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled route error", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <Mascot species="sloth" mood="smirk" className="h-28 w-auto" />
      <h1 className="font-display text-2xl font-extrabold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        That&apos;s on us, not you. Try again — if it keeps happening, the issue&apos;s already logged.
      </p>
      <Button onClick={() => reset()} className="rounded-full">
        Try again
      </Button>
    </main>
  );
}
