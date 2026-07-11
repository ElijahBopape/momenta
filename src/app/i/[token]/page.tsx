import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicInvitation } from "./data";
import { PublicInvitationFlow } from "./public-invitation-flow";
import { AlreadyAnswered } from "./already-answered";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const invitation = await getPublicInvitation(token);

  if (!invitation) {
    return { title: "Invitation not found — momenta" };
  }

  return {
    title: "You've been invited 💌 — momenta",
    description: "Someone has something to ask you. Open to find out 👀",
  };
}

export default async function PublicInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await getPublicInvitation(token);

  if (!invitation) {
    notFound();
  }

  if (invitation.status !== "pending") {
    return <AlreadyAnswered invitation={invitation} />;
  }

  return <PublicInvitationFlow token={token} invitation={invitation} />;
}
