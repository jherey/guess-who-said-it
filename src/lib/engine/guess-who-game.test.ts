import { describe, it, expect, beforeEach } from "vitest";
import { GuessWhoGame } from "./guess-who-game";
import type { Game } from "@/types";

function createTestGame(overrides: Partial<Game> = {}): Game {
  return {
    code: "ABCD",
    phase: "LOBBY",
    players: [
      { id: "p1", name: "Alice", avatar: "🦊", color: "var(--color-player-1)", score: 0, isHost: true },
      { id: "p2", name: "Bob", avatar: "🐙", color: "var(--color-player-2)", score: 0, isHost: false },
      { id: "p3", name: "Carol", avatar: "🦄", color: "var(--color-player-3)", score: 0, isHost: false },
    ],
    promptText: "",
    answers: new Map(),
    rounds: [],
    currentRoundIndex: 0,
    config: { maxPlayers: 10, guessTimerSeconds: 20 },
    createdAt: Date.now(),
    timer: null,
    ...overrides,
  };
}

describe("GuessWhoGame", () => {
  let gameType: GuessWhoGame;

  beforeEach(() => {
    gameType = new GuessWhoGame();
  });

  it("has SUBMITTING as the first phase after lobby", () => {
    expect(gameType.firstPhase).toBe("SUBMITTING");
  });

  it("allows LOBBY to transition to SUBMITTING", () => {
    const transitions = gameType.validTransitions("LOBBY");
    expect(transitions).toContain("SUBMITTING");
  });

  it("does not allow LOBBY to transition to GUESSING directly", () => {
    const transitions = gameType.validTransitions("LOBBY");
    expect(transitions).not.toContain("GUESSING");
  });

  it("builds a game view for LOBBY phase that includes all players", () => {
    const game = createTestGame();
    const view = gameType.buildGameView(game, "p1");

    expect(view.phase).toBe("LOBBY");
    expect(view.players).toHaveLength(3);
    expect(view.code).toBe("ABCD");
    expect(view.currentRound).toBeNull();
  });
});
