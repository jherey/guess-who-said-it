import { PlayerDispatcher } from "./player-dispatcher";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PlayPage({ params }: PageProps) {
  const { code } = await params;
  return <PlayerDispatcher code={code} />;
}
