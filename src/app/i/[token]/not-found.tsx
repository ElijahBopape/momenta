import Link from "next/link";
import { Mascot } from "@/components/brand/mascot";
import { buttonVariants } from "@/components/ui/button";

export default function InvitationNotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <Mascot species="sloth" mood="smirk" className="h-28 w-auto" />
      <h1 className="font-display text-2xl font-extrabold">This invitation doesn&apos;t exist</h1>
      <p className="text-sm text-muted-foreground">
        The link might be mistyped, or it hasn&apos;t been sent yet. Double-check with whoever sent it.
      </p>
      <Link href="/" className={buttonVariants({ className: "rounded-full" })}>
        Go to momenta
      </Link>
    </div>
  );
}
