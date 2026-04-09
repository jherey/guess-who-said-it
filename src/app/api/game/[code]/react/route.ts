import { NextRequest, NextResponse } from "next/server";
import { GameController } from "@/lib/engine";
import { getGameStore } from "@/lib/store";

/** POST /api/game/[code]/react — Send a reaction */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId, type } = await request.json();

    if (!playerId || !type) {
      return NextResponse.json(
        { error: "playerId and type are required" },
        { status: 400 }
      );
    }

    const store = getGameStore();
    const controller = new GameController(store);
    await controller.submitReaction(code, playerId, type);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
