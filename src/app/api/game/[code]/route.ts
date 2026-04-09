import { NextRequest, NextResponse } from "next/server";
import { GuessWhoGame } from "@/lib/engine";
import { getGameStore } from "@/lib/store";

/** GET /api/game/[code] — Get game state (phase-aware) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const playerId = request.nextUrl.searchParams.get("playerId") ?? "";

    const store = getGameStore();
    const game = await store.get(code);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const gameType = new GuessWhoGame();
    const view = gameType.buildGameView(game, playerId);

    return NextResponse.json(view);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
