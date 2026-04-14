import { NextRequest, NextResponse } from "next/server";
import { GameController } from "@/lib/platform";
import { getGameStore } from "@/lib/store";
import { GAMES } from "@/lib/games/registry";

type ControlAction =
  | "start"
  | "advance-from-submitting"
  | "pause-timer"
  | "resume-timer"
  | "extend-timer"
  | "next-round"
  | "play-again";

/** POST /api/game/[code]/control — Host actions */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const action = body.action as ControlAction;

    const store = getGameStore();
    const controller = new GameController(store, GAMES);

    let game;
    switch (action) {
      case "start":
        game = await controller.startGame(code);
        break;
      case "advance-from-submitting":
        game = await controller.advanceFromSubmitting(code);
        break;
      case "pause-timer":
        game = await controller.pauseTimer(code);
        break;
      case "resume-timer":
        game = await controller.resumeTimer(code);
        break;
      case "extend-timer":
        game = await controller.extendTimer(code, body.seconds ?? 10);
        break;
      case "next-round":
        game = await controller.nextRound(code);
        break;
      case "play-again":
        game = await controller.playAgain(code);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ phase: game.phase });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
