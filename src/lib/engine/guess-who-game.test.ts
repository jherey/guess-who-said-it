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

  describe("calculateAwards", () => {
    it("returns Most Mysterious for the player who fooled the most people", () => {
      const game = createTestGame({
        phase: "SCOREBOARD",
        rounds: [
          {
            index: 0,
            authorId: "p1",
            answer: "Answer 1",
            guesses: [
              { playerId: "p2", guessedAuthorId: "p3" }, // wrong → p1 gets +1
              { playerId: "p3", guessedAuthorId: "p2" }, // wrong → p1 gets +1
            ],
            reactions: [],
            revealed: true,
          },
          {
            index: 1,
            authorId: "p2",
            answer: "Answer 2",
            guesses: [
              { playerId: "p1", guessedAuthorId: "p2" }, // correct
              { playerId: "p3", guessedAuthorId: "p1" }, // wrong → p2 gets +1
            ],
            reactions: [],
            revealed: true,
          },
        ],
      });

      const awards = gameType.calculateAwards(game);
      const mysterious = awards.find((a) => a.title === "Most Mysterious");
      expect(mysterious).toBeDefined();
      expect(mysterious!.playerId).toBe("p1"); // fooled 2 people
    });

    it("returns Detective for the player with the most correct guesses", () => {
      const game = createTestGame({
        phase: "SCOREBOARD",
        rounds: [
          {
            index: 0,
            authorId: "p1",
            answer: "Answer 1",
            guesses: [
              { playerId: "p2", guessedAuthorId: "p1" }, // correct
              { playerId: "p3", guessedAuthorId: "p2" }, // wrong
            ],
            reactions: [],
            revealed: true,
          },
          {
            index: 1,
            authorId: "p2",
            answer: "Answer 2",
            guesses: [
              { playerId: "p1", guessedAuthorId: "p3" }, // wrong
              { playerId: "p3", guessedAuthorId: "p2" }, // correct
            ],
            reactions: [],
            revealed: true,
          },
          {
            index: 2,
            authorId: "p3",
            answer: "Answer 3",
            guesses: [
              { playerId: "p1", guessedAuthorId: "p3" }, // correct
              { playerId: "p2", guessedAuthorId: "p3" }, // correct
            ],
            reactions: [],
            revealed: true,
          },
        ],
      });

      const awards = gameType.calculateAwards(game);
      const detective = awards.find((a) => a.title === "Detective");
      expect(detective).toBeDefined();
      // p2 got 2 correct (round 0 + round 2), p1 got 1, p3 got 1
      expect(detective!.playerId).toBe("p2");
    });

    it("returns Social Butterfly for the player who received the most reactions", () => {
      const game = createTestGame({
        phase: "SCOREBOARD",
        rounds: [
          {
            index: 0,
            authorId: "p1",
            answer: "Answer 1",
            guesses: [],
            reactions: [
              { playerId: "p2", type: "no-way" },
              { playerId: "p3", type: "legend" },
            ],
            revealed: true,
          },
          {
            index: 1,
            authorId: "p2",
            answer: "Answer 2",
            guesses: [],
            reactions: [
              { playerId: "p1", type: "knew-it" },
            ],
            revealed: true,
          },
        ],
      });

      const awards = gameType.calculateAwards(game);
      const social = awards.find((a) => a.title === "Social Butterfly");
      expect(social).toBeDefined();
      expect(social!.playerId).toBe("p1"); // got 2 reactions on their answer
    });

    it("returns at least 3 awards for a completed game", () => {
      const game = createTestGame({
        phase: "SCOREBOARD",
        rounds: [
          {
            index: 0,
            authorId: "p1",
            answer: "Answer 1",
            guesses: [
              { playerId: "p2", guessedAuthorId: "p1" },
              { playerId: "p3", guessedAuthorId: "p2" },
            ],
            reactions: [{ playerId: "p2", type: "no-way" }],
            revealed: true,
          },
        ],
      });

      const awards = gameType.calculateAwards(game);
      expect(awards.length).toBeGreaterThanOrEqual(3);
    });
  });
});
