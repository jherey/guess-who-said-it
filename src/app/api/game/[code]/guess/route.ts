import { NextResponse } from "next/server";

/** POST /api/game/[code]/guess — Submit a guess */
export async function POST() {
  return NextResponse.json({ message: "submit guess stub" }, { status: 501 });
}
