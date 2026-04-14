import { describe, it, expect } from "vitest";
import { enrichGameView } from "./view-enricher";
import type { GameView } from "@/types";
import { makeMeta } from "@/test-utils/fixtures";

describe("enrichGameView", () => {
  // A minimal engine view — only the fields we need for this test.
  // The full GameView shape comes from the engine; we cast to satisfy the type.
  const engineView = {
    code: "ABCD",
    phase: "LOBBY",
    players: [],
    promptText: "",
    currentRound: null,
    rounds: [],
    timer: null,
    submissionCount: 0,
    totalPlayers: 0,
    isCurrentRoundAuthor: false,
    awards: [],
    revealStartedAt: null,
    reactions: [],
  } as Omit<GameView, "gameKey" | "meta">;

  it("adds gameKey to the returned view", () => {
    const enriched = enrichGameView(engineView, "guess-who", makeMeta());

    expect(enriched.gameKey).toBe("guess-who");
  });

  it("adds meta to the returned view", () => {
    const meta = makeMeta({ name: "Custom" });
    const enriched = enrichGameView(engineView, "guess-who", meta);

    expect(enriched.meta).toEqual(meta);
  });

  it("preserves all engine view fields unchanged", () => {
    const enriched = enrichGameView(engineView, "guess-who", makeMeta());

    expect(enriched.code).toBe("ABCD");
    expect(enriched.phase).toBe("LOBBY");
    expect(enriched.currentRound).toBeNull();
  });
});
