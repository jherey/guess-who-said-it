import { notFound } from "next/navigation";
import { getGameEntry } from "@/lib/games/registry";
import { HostSetupForm } from "./host-setup-form";

interface PageProps {
  params: Promise<{ gameKey: string }>;
}

export default async function HostSetupPage({ params }: PageProps) {
  const { gameKey } = await params;
  const entry = getGameEntry(gameKey);
  if (!entry || entry.meta.status !== "available") {
    notFound();
  }

  return (
    <HostSetupForm
      gameKey={gameKey}
      gameName={entry.meta.name}
      icon={entry.meta.icon}
    />
  );
}
