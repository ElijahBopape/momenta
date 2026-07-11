import Link from "next/link";
import { Mascot } from "@/components/brand/mascot";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <Mascot species="panda" mood="smirk" className="h-28 w-auto" />
      <h1 className="font-display text-2xl font-extrabold">Page not found</h1>
      <p className="text-sm text-muted-foreground">That page doesn&apos;t exist, or it moved.</p>
      <Link href="/" className={buttonVariants({ className: "rounded-full" })}>
        Go to momenta
      </Link>
    </main>
  );
}
