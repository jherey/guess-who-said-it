import { NextRequest, NextResponse } from "next/server";
import { GameController } from "@/lib/engine";
import { getGameStore } from "@/lib/store";

type ControlAction = "start" | "advance-from-submitting";

/** POST /api/game/[code]/control — Host actions */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { action } = (await request.json()) as { action: ControlAction };

    const store = getGameStore();
    const controller = new GameController(store);

    let game;
    switch (action) {
      case "start":
        game = await controller.startGame(code);
        break;
      case "advance-from-submitting":
        game = await controller.advanceFromSubmitting(code);
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
