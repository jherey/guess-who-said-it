import { describe, it, expect, beforeEach } from "vitest";
import { GameController } from "./game-controller";
import { InMemoryGameStore } from "@/lib/store/in-memory-store";
import { RoomManager } from "./room-manager";
import type { Game } from "@/types";

describe("GameController", () => {
  let store: InMemoryGameStore;
  let controller: GameController;
  let game: Game;

  beforeEach(async () => {
    store = new InMemoryGameStore();
    controller = new GameController(store);
    const roomManager = new RoomManager(store);
    game = await roomManager.createRoom("Alice");
    await roomManager.joinRoom(game.code, "Bob");
    await roomManager.joinRoom(game.code, "Carol");
  });

  it("starts the game, transitioning to SUBMITTING with a prompt", async () => {
    const updated = await controller.startGame(game.code);

    expect(updated.phase).toBe("SUBMITTING");
    expect(updated.promptText).toBeTruthy();
    expect(updated.promptText.length).toBeGreaterThan(0);
  });

  it("rejects starting a game that is not in LOBBY phase", async () => {
    await controller.startGame(game.code);
    await expect(controller.startGame(game.code)).rejects.toThrow(
      "LOBBY"
    );
  });

  describe("answer submission", () => {
    let startedGame: Game;

    beforeEach(async () => {
      startedGame = await controller.startGame(game.code);
    });

    it("accepts a player answer during SUBMITTING phase", async () => {
      const playerIds = startedGame.players.map((p) => p.id);
      const updated = await controller.submitAnswer(
        game.code,
        playerIds[0],
        "My secret talent is juggling"
      );

      expect(updated.answers.size).toBe(1);
      expect(updated.answers.get(playerIds[0])).toBe(
        "My secret talent is juggling"
      );
    });

    it("rejects duplicate submission from same player", async () => {
      const playerId = startedGame.players[0].id;
      await controller.submitAnswer(game.code, playerId, "First answer");

      await expect(
        controller.submitAnswer(game.code, playerId, "Second answer")
      ).rejects.toThrow("already submitted");
    });

    it("rejects submission from non-existent player", async () => {
      await expect(
        controller.submitAnswer(game.code, "fake-id", "Answer")
      ).rejects.toThrow("not a player");
    });

    it("auto-transitions to GUESSING when all players have submitted", async () => {
      for (const player of startedGame.players) {
        await controller.submitAnswer(
          game.code,
          player.id,
          `Answer from ${player.name}`
        );
      }

      const final = await store.get(game.code);
      expect(final!.phase).toBe("GUESSING");
      expect(final!.rounds).toHaveLength(startedGame.players.length);
      expect(final!.currentRoundIndex).toBe(0);
    });

    it("creates rounds in shuffled order from submitted answers", async () => {
      for (const player of startedGame.players) {
        await controller.submitAnswer(
          game.code,
          player.id,
          `Answer from ${player.name}`
        );
      }

      const final = await store.get(game.code);
      // Every player's answer should appear in exactly one round
      const authorIds = final!.rounds.map((r) => r.authorId);
      const playerIds = startedGame.players.map((p) => p.id);
      expect(authorIds.sort()).toEqual(playerIds.sort());
    });
  });

  it("allows host to manually advance from SUBMITTING to GUESSING", async () => {
    const started = await controller.startGame(game.code);
    // Only one player submits (not all)
    await controller.submitAnswer(
      game.code,
      started.players[0].id,
      "My answer"
    );

    const advanced = await controller.advanceFromSubmitting(game.code);
    expect(advanced.phase).toBe("GUESSING");
    // Should only have rounds for players who submitted
    expect(advanced.rounds).toHaveLength(1);
  });

  describe("guessing", () => {
    let guessingGame: Game;

    beforeEach(async () => {
      await controller.startGame(game.code);
      const current = await store.get(game.code);
      for (const player of current!.players) {
        await controller.submitAnswer(
          game.code,
          player.id,
          `Answer from ${player.name}`
        );
      }
      guessingGame = (await store.get(game.code))!;
    });

    it("transitions to GUESSING with a timer", async () => {
      expect(guessingGame.phase).toBe("GUESSING");
      expect(guessingGame.timer).not.toBeNull();
      expect(guessingGame.timer!.paused).toBe(false);
    });

    it("accepts a valid guess", async () => {
      const round = guessingGame.rounds[0];
      // Pick a player who is NOT the author to guess
      const guesser = guessingGame.players.find(
        (p) => p.id !== round.authorId
      )!;
      const guessedAuthor = guessingGame.players.find(
        (p) => p.id !== guesser.id && p.id !== round.authorId
      ) || guessingGame.players.find((p) => p.id === round.authorId)!;

      const updated = await controller.submitGuess(
        game.code,
        guesser.id,
        guessedAuthor.id
      );

      const updatedRound = updated.rounds[updated.currentRoundIndex];
      expect(updatedRound.guesses).toHaveLength(1);
      expect(updatedRound.guesses[0].playerId).toBe(guesser.id);
    });

    it("rejects self-guess (guessing yourself as the author)", async () => {
      const round = guessingGame.rounds[0];
      const notAuthor = guessingGame.players.find(
        (p) => p.id !== round.authorId
      )!;

      await expect(
        controller.submitGuess(game.code, notAuthor.id, notAuthor.id)
      ).rejects.toThrow("cannot guess yourself");
    });

    it("rejects duplicate guess from same player", async () => {
      const round = guessingGame.rounds[0];
      const guesser = guessingGame.players.find(
        (p) => p.id !== round.authorId
      )!;
      const target = guessingGame.players.find(
        (p) => p.id !== guesser.id
      )!;

      await controller.submitGuess(game.code, guesser.id, target.id);
      await expect(
        controller.submitGuess(game.code, guesser.id, target.id)
      ).rejects.toThrow("already guessed");
    });

    it("rejects guess when not in GUESSING phase", async () => {
      // Transition away from guessing by going back to lobby (force)
      await store.update(game.code, (g) => ({ ...g, phase: "LOBBY" as const }));
      await expect(
        controller.submitGuess(
          game.code,
          guessingGame.players[0].id,
          guessingGame.players[1].id
        )
      ).rejects.toThrow("GUESSING");
    });

    it("the round author does not guess on their own round", async () => {
      const round = guessingGame.rounds[0];

      await expect(
        controller.submitGuess(game.code, round.authorId, guessingGame.players[0].id)
      ).rejects.toThrow("author cannot guess");
    });

    it("pauses the timer", async () => {
      const updated = await controller.pauseTimer(game.code);
      expect(updated.timer!.paused).toBe(true);
    });

    it("resumes the timer", async () => {
      await controller.pauseTimer(game.code);
      const updated = await controller.resumeTimer(game.code);
      expect(updated.timer!.paused).toBe(false);
    });

    it("extends the timer", async () => {
      const before = guessingGame.timer!;
      const updated = await controller.extendTimer(game.code, 10);
      expect(updated.timer!.endsAt).toBeGreaterThan(before.endsAt);
    });
  });
});
