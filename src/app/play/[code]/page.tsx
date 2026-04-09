import { PlayerScreenClient } from "./player-screen-client";

interface PlayerScreenProps {
  params: Promise<{ code: string }>;
}

export default async function PlayerScreen({ params }: PlayerScreenProps) {
  const { code } = await params;
  return <PlayerScreenClient code={code} />;
}
