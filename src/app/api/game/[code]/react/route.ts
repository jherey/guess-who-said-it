import { NextResponse } from "next/server";

/** POST /api/game/[code]/react — Send a reaction */
export async function POST() {
  return NextResponse.json({ message: "send reaction stub" }, { status: 501 });
}
