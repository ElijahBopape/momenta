import { Mascot } from "@/components/brand/mascot";

export default function SignupSuccessPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <Mascot species="bunny" mood="party" className="h-28 w-auto" />
      <h1 className="font-display text-2xl font-extrabold">Check your email</h1>
      <p className="text-sm text-muted-foreground">
        We sent a confirmation link to finish setting up your account. Click it and you&apos;ll land right
        back here, signed in.
      </p>
    </div>
  );
}
