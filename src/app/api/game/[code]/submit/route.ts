import { NextRequest, NextResponse } from "next/server";
import { GameController } from "@/lib/platform";
import { getGameStore } from "@/lib/store";
import { GAMES } from "@/lib/games/registry";

/** POST /api/game/[code]/submit — Submit an answer */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId, answer } = await request.json();

    if (!playerId || !answer || typeof answer !== "string") {
      return NextResponse.json(
        { error: "playerId and answer are required" },
        { status: 400 }
      );
    }

    const store = getGameStore();
    const controller = new GameController(store, GAMES);
    const game = await controller.submitAnswer(code, playerId, answer.trim());

    return NextResponse.json({
      phase: game.phase,
      submissionCount: Object.keys(game.answers).length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("already submitted") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
