import { describe, it, expect, beforeEach } from "vitest";
import { GameController } from "./game-controller";
import { InMemoryGameStore } from "@/lib/store/in-memory-store";
import { RoomManager } from "./room-manager";
import { GAMES } from "@/lib/games/registry";
import type { Game } from "@/types";

describe("GameController", () => {
  let store: InMemoryGameStore;
  let controller: GameController;
  let game: Game;

  beforeEach(async () => {
    store = new InMemoryGameStore();
    controller = new GameController(store, GAMES);
    const roomManager = new RoomManager(store, GAMES);
    game = await roomManager.createRoom("Alice", "guess-who");
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

      expect(Object.keys(updated.answers).length).toBe(1);
      expect(updated.answers[playerIds[0]]).toBe(
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

  describe("nextRound and reveal flow", () => {
    beforeEach(async () => {
      // Set up a game in GUESSING phase
      await controller.startGame(game.code);
      const current = (await store.get(game.code))!;
      for (const player of current.players) {
        await controller.submitAnswer(
          game.code,
          player.id,
          `Answer from ${player.name}`
        );
      }
    });

    it("advances within GUESSING when more rounds remain", async () => {
      const before = (await store.get(game.code))!;
      expect(before.currentRoundIndex).toBe(0);

      const advanced = await controller.nextRound(game.code);
      expect(advanced.phase).toBe("GUESSING");
      expect(advanced.currentRoundIndex).toBe(1);
      expect(advanced.timer).not.toBeNull();
      // Author info must NOT be revealed during inter-round transitions.
      expect(advanced.revealStartedAt).toBeNull();
    });

    it("transitions GUESSING → REVEAL after the final guessing round", async () => {
      const g = (await store.get(game.code))!;
      // Advance through all rounds; last advance should hit REVEAL.
      for (let i = 0; i < g.rounds.length - 1; i++) {
        await controller.nextRound(game.code);
      }
      const revealed = await controller.nextRound(game.code);

      expect(revealed.phase).toBe("REVEAL");
      expect(revealed.revealStartedAt).not.toBeNull();
      expect(revealed.timer).toBeNull();
    });

    it("applies all round scores at the GUESSING → REVEAL transition", async () => {
      const before = (await store.get(game.code))!;
      const round0 = before.rounds[0];
      const nonAuthors = before.players.filter(
        (p) => p.id !== round0.authorId
      );

      // First non-author guesses correctly on round 0; second guesses wrong.
      await controller.submitGuess(
        game.code,
        nonAuthors[0].id,
        round0.authorId
      );
      const wrongTarget = before.players.find(
        (p) => p.id !== round0.authorId && p.id !== nonAuthors[1].id
      )!;
      await controller.submitGuess(
        game.code,
        nonAuthors[1].id,
        wrongTarget.id
      );

      // Walk through to REVEAL without scores applying mid-game.
      const midGuessing = (await store.get(game.code))!;
      for (const player of midGuessing.players) {
        // Scores must NOT have been applied yet during GUESSING.
        expect(player.score).toBe(0);
      }

      for (let i = 0; i < midGuessing.rounds.length; i++) {
        await controller.nextRound(game.code);
      }

      const revealed = (await store.get(game.code))!;
      expect(revealed.phase).toBe("REVEAL");

      // Correct guesser earned +1
      const correctGuesser = revealed.players.find(
        (p) => p.id === nonAuthors[0].id
      )!;
      expect(correctGuesser.score).toBe(1);

      // Author earned +1 for fooling the wrong guesser
      const author = revealed.players.find(
        (p) => p.id === round0.authorId
      )!;
      expect(author.score).toBe(1);
    });

    it("REVEAL → SCOREBOARD via nextRound", async () => {
      const g = (await store.get(game.code))!;
      for (let i = 0; i < g.rounds.length; i++) {
        await controller.nextRound(game.code);
      }

      const finalGame = await controller.nextRound(game.code);
      expect(finalGame.phase).toBe("SCOREBOARD");
    });

    it("rejects nextRound from non-advancing phases", async () => {
      await store.update(game.code, (g) => ({ ...g, phase: "LOBBY" as const }));
      await expect(controller.nextRound(game.code)).rejects.toThrow(
        "Cannot advance"
      );
    });

    it("rejects reactions outside REVEAL", async () => {
      await expect(
        controller.submitReaction(game.code, game.players[0].id, "knew-it")
      ).rejects.toThrow("REVEAL");
    });

    it("submitReaction stores reactions globally on the game", async () => {
      const g = (await store.get(game.code))!;
      // Walk to REVEAL.
      for (let i = 0; i < g.rounds.length; i++) {
        await controller.nextRound(game.code);
      }

      const updated = await controller.submitReaction(
        game.code,
        g.players[0].id,
        "no-way"
      );
      expect(updated.reactions).toHaveLength(1);
      expect(updated.reactions[0].playerId).toBe(g.players[0].id);
      expect(updated.reactions[0].type).toBe("no-way");
      expect(updated.reactions[0].sentAt).toBeGreaterThan(0);
    });

    it("allows multiple reactions from the same player during REVEAL", async () => {
      const g = (await store.get(game.code))!;
      for (let i = 0; i < g.rounds.length; i++) {
        await controller.nextRound(game.code);
      }

      const playerId = g.players[0].id;
      await controller.submitReaction(game.code, playerId, "knew-it");
      await controller.submitReaction(game.code, playerId, "no-way");
      const final = await controller.submitReaction(
        game.code,
        playerId,
        "legend"
      );

      expect(final.reactions).toHaveLength(3);
    });
  });
});
