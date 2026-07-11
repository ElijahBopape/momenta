import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href="/">
        <Logo />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">{children}</div>
    </main>
  );
}
