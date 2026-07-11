import Link from "next/link";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";
import { buttonVariants } from "@/components/ui/button";
import type { MascotId } from "@/design/mascots";

const SHOWCASE: MascotId[] = ["bear", "bunny", "unicorn", "fox", "panda", "cat", "penguin", "sloth"];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-6">
        <Logo />
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants({ size: "sm" })}>
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-10 px-4 py-12 text-center">
        <LogoMark className="h-16 w-16" />
        <div className="space-y-4">
          <h1 className="text-balance font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            Every great date starts with{" "}
            <span className="bg-gradient-to-br from-primary to-brand-pink bg-clip-text text-transparent">
              one good moment
            </span>
            .
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Build a personalized invitation card, pick a plush companion, and send a link instead of an
            awkward text. Momenta makes asking someone out feel exciting.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className={buttonVariants({ size: "lg", className: "rounded-full px-8" })}>
            Create your first invitation
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-full px-8" })}
          >
            I already have an account
          </Link>
        </div>

        <section aria-label="Companion preview" className="w-full pt-8">
          <p className="mb-4 font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Choose your companion
          </p>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
            {SHOWCASE.map((id) => (
              <div key={id} className="flex justify-center">
                <Mascot species={id} mood="happy" className="h-16 w-auto sm:h-20" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-4xl px-4 py-8 text-center text-xs text-muted-foreground">
        momenta — built with 0 capital, on free-tier everything.
      </footer>
    </div>
  );
}
