import { GameBoardClient } from "./game-board-client";

interface GameBoardProps {
  params: Promise<{ code: string }>;
}

export default async function GameBoard({ params }: GameBoardProps) {
  const { code } = await params;
  return <GameBoardClient code={code} />;
}
