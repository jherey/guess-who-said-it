import { NextResponse } from "next/server";

/** POST /api/game — Create a new game room */
export async function POST() {
  return NextResponse.json({ message: "create game stub" }, { status: 501 });
}
