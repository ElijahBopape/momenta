"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Inbox, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/brand/user-menu";

const TABS = [
  { href: "/create", label: "Create Invitation", icon: Heart },
  { href: "/invitations", label: "Invitations", icon: Inbox },
  { href: "/find-a-spot", label: "Find a Spot", icon: MapPin },
];

export interface AppHeaderUser {
  displayName: string;
  avatarMascotId: string;
}

export function AppHeader({ user }: { user: AppHeaderUser | null }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4">
        <Link href="/create" aria-label="Momenta home" className="shrink-0">
          <Logo iconClassName="h-6 w-6 sm:h-7 sm:w-7" />
        </Link>
        <nav aria-label="Primary" className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0">
          {user && <UserMenu displayName={user.displayName} avatarMascotId={user.avatarMascotId} />}
        </div>
      </div>
    </header>
  );
}
