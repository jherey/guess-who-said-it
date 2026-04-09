import { NextResponse } from "next/server";

/** POST /api/game/[code]/submit — Submit an answer */
export async function POST() {
  return NextResponse.json({ message: "submit answer stub" }, { status: 501 });
}
