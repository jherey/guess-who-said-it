import { NextRequest, NextResponse } from "next/server";
import { RoomManager } from "@/lib/engine";
import { getGameStore } from "@/lib/store";

/** POST /api/game — Create a new game room */
export async function POST(request: NextRequest) {
  try {
    const { hostName } = await request.json();
    if (!hostName || typeof hostName !== "string") {
      return NextResponse.json(
        { error: "hostName is required" },
        { status: 400 }
      );
    }

    const store = getGameStore();
    const roomManager = new RoomManager(store);
    const game = await roomManager.createRoom(hostName.trim());

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
