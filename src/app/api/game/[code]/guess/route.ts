import { NextRequest, NextResponse } from "next/server";
import { GameController } from "@/lib/platform";
import { getGameStore } from "@/lib/store";
import { GAMES } from "@/lib/games/registry";

/** POST /api/game/[code]/guess — Submit a guess */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId, guessedAuthorId } = await request.json();

    if (!playerId || !guessedAuthorId) {
      return NextResponse.json(
        { error: "playerId and guessedAuthorId are required" },
        { status: 400 }
      );
    }

    const store = getGameStore();
    const controller = new GameController(store, GAMES);
    const game = await controller.submitGuess(code, playerId, guessedAuthorId);

    const round = game.rounds[game.currentRoundIndex];
    return NextResponse.json({
      guessCount: round.guesses.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("already guessed") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
