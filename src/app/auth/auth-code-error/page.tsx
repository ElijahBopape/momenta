import Link from "next/link";
import { Mascot } from "@/components/brand/mascot";
import { buttonVariants } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <Mascot species="sloth" mood="smirk" className="h-28 w-auto" />
      <h1 className="font-display text-2xl font-extrabold">That link didn&apos;t work</h1>
      <p className="text-sm text-muted-foreground">
        It may have expired or already been used. Request a fresh one and try again.
      </p>
      <Link href="/login" className={buttonVariants({ className: "rounded-full" })}>
        Back to log in
      </Link>
    </div>
  );
}
