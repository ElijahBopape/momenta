import { AppHeader } from "@/components/brand/app-header";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let user = null;
  if (authUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_mascot_id")
      .eq("id", authUser.id)
      .single();

    user = {
      displayName: profile?.display_name ?? authUser.email ?? "You",
      avatarMascotId: profile?.avatar_mascot_id ?? "bear",
    };
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
