import { NextResponse } from "next/server";

/** POST /api/game/[code]/join — Join a game room */
export async function POST() {
  return NextResponse.json({ message: "join game stub" }, { status: 501 });
}
