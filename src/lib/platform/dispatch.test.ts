import { describe, it, expect } from "vitest";
import { resolveDispatchState } from "./dispatch";
import type { GameRegistry } from "@/lib/games/registry";
import type { GameView } from "@/types";
import { makeMeta } from "@/test-utils/fixtures";

const testRegistry: GameRegistry = {
  "guess-who": { meta: makeMeta() },
};

function makeGameView(gameKey: string): GameView {
  return {
    code: "ABCD",
    gameKey,
    meta: makeMeta(),
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
  };
}

describe("resolveDispatchState", () => {
  it("returns loading when no gameView and no error", () => {
    const state = resolveDispatchState({
      gameView: null,
      error: null,
      registry: testRegistry,
    });

    expect(state).toEqual({ kind: "loading" });
  });

  it("returns error when an error string is present", () => {
    const state = resolveDispatchState({
      gameView: null,
      error: "Game not found",
      registry: testRegistry,
    });

    expect(state).toEqual({ kind: "error", message: "Game not found" });
  });

  it("returns unknown-game when the gameView's gameKey is not in the registry", () => {
    const state = resolveDispatchState({
      gameView: makeGameView("never-shipped"),
      error: null,
      registry: testRegistry,
    });

    expect(state).toEqual({ kind: "unknown-game", gameKey: "never-shipped" });
  });

  it("returns ready with the matching registry entry when gameKey is known", () => {
    const state = resolveDispatchState({
      gameView: makeGameView("guess-who"),
      error: null,
      registry: testRegistry,
    });

    expect(state).toEqual({
      kind: "ready",
      entry: testRegistry["guess-who"],
    });
  });

  it("prefers error over a stale gameView (error tie-breaks)", () => {
    const state = resolveDispatchState({
      gameView: makeGameView("guess-who"),
      error: "Connection lost",
      registry: testRegistry,
    });

    expect(state).toEqual({ kind: "error", message: "Connection lost" });
  });
});
