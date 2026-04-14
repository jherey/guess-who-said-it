import { NextRequest, NextResponse } from "next/server";
import { RoomManager } from "@/lib/platform";
import { getGameStore } from "@/lib/store";
import { GAMES } from "@/lib/games/registry";

/** POST /api/game — Create a new game room */
export async function POST(request: NextRequest) {
  try {
    const { hostName, gameKey } = await request.json();
    if (!hostName || typeof hostName !== "string") {
      return NextResponse.json(
        { error: "hostName is required" },
        { status: 400 }
      );
    }
    if (!gameKey || typeof gameKey !== "string") {
      return NextResponse.json(
        { error: "gameKey is required" },
        { status: 400 }
      );
    }

    const store = getGameStore();
    const roomManager = new RoomManager(store, GAMES);
    const game = await roomManager.createRoom(hostName.trim(), gameKey);

    const hostPlayer = game.players[0];
    return NextResponse.json({
      code: game.code,
      playerId: hostPlayer.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
