import { NextResponse } from "next/server";

/** POST /api/game/[code]/control — Host actions (start, pause, extend, advance, end) */
export async function POST() {
  return NextResponse.json({ message: "host control stub" }, { status: 501 });
}
