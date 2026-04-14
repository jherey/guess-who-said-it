import { NextRequest, NextResponse } from "next/server";
import { RoomManager } from "@/lib/platform";
import { getGameStore } from "@/lib/store";
import { GAMES } from "@/lib/games/registry";

/** POST /api/game/[code]/join — Join a game room */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerName } = await request.json();
    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json(
        { error: "playerName is required" },
        { status: 400 }
      );
    }

    const store = getGameStore();
    const roomManager = new RoomManager(store, GAMES);
    const game = await roomManager.joinRoom(code, playerName.trim());

    const player = game.players.find((p) => p.name === playerName.trim())!;
    return NextResponse.json({
      playerId: player.id,
      code: game.code,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("not found")
      ? 404
      : message.includes("full") || message.includes("taken")
        ? 409
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
