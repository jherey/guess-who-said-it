import { NextRequest, NextResponse } from "next/server";
import { enrichGameView } from "@/lib/platform";
import { getGameStore } from "@/lib/store";
import { getGameEntry } from "@/lib/games/registry";

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

    const entry = getGameEntry(game.gameKey);
    if (!entry || !entry.engine) {
      return NextResponse.json(
        { error: `Unknown game: "${game.gameKey}"` },
        { status: 500 }
      );
    }

    const engineView = entry.engine.buildGameView(game, playerId);
    const view = enrichGameView(engineView, game.gameKey, entry.meta);

    return NextResponse.json(view);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
