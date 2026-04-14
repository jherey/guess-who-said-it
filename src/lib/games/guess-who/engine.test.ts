import { describe, it, expect, beforeEach } from "vitest";
import { GuessWhoGame } from "./engine";
import type { Game } from "@/types";

function createTestGame(overrides: Partial<Game> = {}): Game {
  return {
    code: "ABCD",
    gameKey: "guess-who",
    phase: "LOBBY",
    players: [
      { id: "p1", name: "Alice", avatar: "🦊", color: "var(--color-player-1)", score: 0, isHost: true },
      { id: "p2", name: "Bob", avatar: "🐙", color: "var(--color-player-2)", score: 0, isHost: false },
      { id: "p3", name: "Carol", avatar: "🦄", color: "var(--color-player-3)", score: 0, isHost: false },
    ],
    promptText: "",
    answers: {},
    rounds: [],
    currentRoundIndex: 0,
    config: { maxPlayers: 10, guessTimerSeconds: 20 },
    createdAt: Date.now(),
    timer: null,
    revealStartedAt: null,
    reactions: [],
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

  it("allows GUESSING to chain into another GUESSING (next round)", () => {
    const transitions = gameType.validTransitions("GUESSING");
    expect(transitions).toContain("GUESSING");
    expect(transitions).toContain("REVEAL");
  });

  it("only allows REVEAL to transition to SCOREBOARD", () => {
    const transitions = gameType.validTransitions("REVEAL");
    expect(transitions).toEqual(["SCOREBOARD"]);
  });

  it("builds a game view for LOBBY phase that includes all players", () => {
    const game = createTestGame();
    const view = gameType.buildGameView(game, "p1");

    expect(view.phase).toBe("LOBBY");
    expect(view.players).toHaveLength(3);
    expect(view.code).toBe("ABCD");
    expect(view.currentRound).toBeNull();
  });

  describe("view shaping", () => {
    const baseRounds = [
      {
        index: 0,
        authorId: "p1",
        answer: "Answer 1",
        guesses: [],
      },
      {
        index: 1,
        authorId: "p2",
        answer: "Answer 2",
        guesses: [],
      },
    ];

    it("hides authorId AND non-current answers during GUESSING", () => {
      const game = createTestGame({
        phase: "GUESSING",
        rounds: baseRounds,
        currentRoundIndex: 0,
      });
      const view = gameType.buildGameView(game, "p2");

      expect(view.currentRound!.answer).toBe("Answer 1");
      expect(view.currentRound!.authorId).toBeNull();
      // Other rounds in the array should not leak their answers either.
      expect(view.rounds[1].answer).toBe("");
      expect(view.rounds[1].authorId).toBeNull();
    });

    it("exposes all answers and authors during REVEAL", () => {
      const game = createTestGame({
        phase: "REVEAL",
        rounds: baseRounds,
        currentRoundIndex: 1,
        revealStartedAt: 1000,
      });
      const view = gameType.buildGameView(game, "p3");

      expect(view.rounds[0].answer).toBe("Answer 1");
      expect(view.rounds[0].authorId).toBe("p1");
      expect(view.rounds[1].answer).toBe("Answer 2");
      expect(view.rounds[1].authorId).toBe("p2");
      expect(view.revealStartedAt).toBe(1000);
    });

    it("exposes reactions only during REVEAL/SCOREBOARD", () => {
      const reactions = [
        { playerId: "p2", type: "no-way" as const, sentAt: 1234 },
      ];
      const guessing = createTestGame({
        phase: "GUESSING",
        rounds: baseRounds,
        reactions,
      });
      const reveal = createTestGame({
        phase: "REVEAL",
        rounds: baseRounds,
        reactions,
      });

      expect(gameType.buildGameView(guessing, "p1").reactions).toHaveLength(0);
      expect(gameType.buildGameView(reveal, "p1").reactions).toHaveLength(1);
    });
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
          },
          {
            index: 1,
            authorId: "p2",
            answer: "Answer 2",
            guesses: [
              { playerId: "p1", guessedAuthorId: "p2" }, // correct
              { playerId: "p3", guessedAuthorId: "p1" }, // wrong → p2 gets +1
            ],
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
          },
          {
            index: 1,
            authorId: "p2",
            answer: "Answer 2",
            guesses: [
              { playerId: "p1", guessedAuthorId: "p3" }, // wrong
              { playerId: "p3", guessedAuthorId: "p2" }, // correct
            ],
          },
          {
            index: 2,
            authorId: "p3",
            answer: "Answer 3",
            guesses: [
              { playerId: "p1", guessedAuthorId: "p3" }, // correct
              { playerId: "p2", guessedAuthorId: "p3" }, // correct
            ],
          },
        ],
      });

      const awards = gameType.calculateAwards(game);
      const detective = awards.find((a) => a.title === "Detective");
      expect(detective).toBeDefined();
      // p2 got 2 correct (round 0 + round 2), p1 got 1, p3 got 1
      expect(detective!.playerId).toBe("p2");
    });

    it("returns Hype Person for the player who sent the most reactions", () => {
      const game = createTestGame({
        phase: "SCOREBOARD",
        reactions: [
          { playerId: "p1", type: "no-way", sentAt: 1 },
          { playerId: "p1", type: "legend", sentAt: 2 },
          { playerId: "p1", type: "knew-it", sentAt: 3 },
          { playerId: "p2", type: "knew-it", sentAt: 4 },
        ],
      });

      const awards = gameType.calculateAwards(game);
      const hype = awards.find((a) => a.title === "Hype Person");
      expect(hype).toBeDefined();
      expect(hype!.playerId).toBe("p1");
    });

    it("omits Hype Person when nobody reacted", () => {
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
          },
        ],
        reactions: [],
      });

      const awards = gameType.calculateAwards(game);
      expect(awards.find((a) => a.title === "Hype Person")).toBeUndefined();
    });
  });
});
