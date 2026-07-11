import { Mascot } from "@/components/brand/mascot";

export default function ResetPasswordSentPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <Mascot species="panda" mood="happy" className="h-28 w-auto" />
      <h1 className="font-display text-2xl font-extrabold">Check your email</h1>
      <p className="text-sm text-muted-foreground">
        If that address has a momenta account, a reset link is on its way.
      </p>
    </div>
  );
}
