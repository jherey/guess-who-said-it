import { NextResponse } from "next/server";

/** GET /api/game/[code] — Get game state (phase-aware) */
export async function GET() {
  return NextResponse.json({ message: "get game state stub" }, { status: 501 });
}
