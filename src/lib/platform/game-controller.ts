import type { Game, ReactionType, Round } from "@/types";
import type { GameStore } from "@/lib/store/game-store";
import type { GameRegistry } from "@/lib/games/registry";
import { GameTimer } from "@/lib/timer";
import { pickRandomPrompt } from "@/lib/prompts";

export class GameController {
  constructor(
    private store: GameStore,
    private registry: GameRegistry
  ) {}

  private engineFor(game: Game) {
    const entry = this.registry[game.gameKey];
    if (!entry?.engine) {
      throw new Error(`No engine registered for gameKey "${game.gameKey}"`);
    }
    return entry.engine;
  }

  async startGame(code: string): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);
    if (game.phase !== "LOBBY") {
      throw new Error("Game can only be started from LOBBY phase");
    }

    const prompt = pickRandomPrompt();

    return this.store.update(code, (g) => ({
      ...g,
      phase: "SUBMITTING" as const,
      promptText: prompt.text,
      answers: {},
    }));
  }

  async submitAnswer(
    code: string,
    playerId: string,
    answer: string
  ): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);
    if (game.phase !== "SUBMITTING") {
      throw new Error("Answers can only be submitted during SUBMITTING phase");
    }
    if (!game.players.some((p) => p.id === playerId)) {
      throw new Error(`${playerId} is not a player in this game`);
    }
    if (playerId in game.answers) {
      throw new Error("Player has already submitted an answer");
    }

    const updated = await this.store.update(code, (g) => ({
      ...g,
      answers: { ...g.answers, [playerId]: answer },
    }));

    if (Object.keys(updated.answers).length >= updated.players.length) {
      return this.transitionToGuessing(code);
    }

    return updated;
  }

  async advanceFromSubmitting(code: string): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);
    if (game.phase !== "SUBMITTING") {
      throw new Error("Can only advance from SUBMITTING phase");
    }
    if (Object.keys(game.answers).length === 0) {
      throw new Error("At least one answer is required");
    }

    return this.transitionToGuessing(code);
  }

  async submitGuess(
    code: string,
    playerId: string,
    guessedAuthorId: string
  ): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);
    if (game.phase !== "GUESSING") {
      throw new Error("Guesses can only be submitted during GUESSING phase");
    }

    const round = game.rounds[game.currentRoundIndex];
    if (!round) throw new Error("No active round");

    if (playerId === round.authorId) {
      throw new Error("Round author cannot guess on their own round");
    }
    if (playerId === guessedAuthorId) {
      throw new Error("Player cannot guess yourself as the author");
    }
    if (round.guesses.some((g) => g.playerId === playerId)) {
      throw new Error("Player has already guessed this round");
    }

    // Reject if timer has expired
    if (game.timer && GameTimer.isExpired(game.timer, Date.now())) {
      throw new Error("Timer has expired, no more guesses accepted");
    }

    return this.store.update(code, (g) => {
      const rounds = [...g.rounds];
      const currentRound = { ...rounds[g.currentRoundIndex] };
      currentRound.guesses = [
        ...currentRound.guesses,
        { playerId, guessedAuthorId },
      ];
      rounds[g.currentRoundIndex] = currentRound;
      return { ...g, rounds };
    });
  }

  async pauseTimer(code: string): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);
    if (!game.timer) throw new Error("No timer to pause");

    return this.store.update(code, (g) => ({
      ...g,
      timer: GameTimer.pause(g.timer!, Date.now()),
    }));
  }

  async resumeTimer(code: string): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);
    if (!game.timer) throw new Error("No timer to resume");

    return this.store.update(code, (g) => ({
      ...g,
      timer: GameTimer.resume(g.timer!, Date.now()),
    }));
  }

  async extendTimer(code: string, extraSeconds: number): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);
    if (!game.timer) throw new Error("No timer to extend");

    return this.store.update(code, (g) => ({
      ...g,
      timer: GameTimer.extend(g.timer!, extraSeconds, Date.now()),
    }));
  }

  /**
   * Advance the game forward.
   *
   * - GUESSING with more rounds remaining: advance to the next GUESSING round
   *   (fresh timer). No author info is revealed.
   * - GUESSING on the final round: transition to REVEAL. All round scores are
   *   summed and applied at this point, and `revealStartedAt` is stamped so the
   *   client cascade animation can play.
   * - REVEAL: transition to SCOREBOARD.
   */
  async nextRound(code: string): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);

    if (game.phase === "GUESSING") {
      const nextIndex = game.currentRoundIndex + 1;
      const isLastRound = nextIndex >= game.rounds.length;

      if (isLastRound) {
        return this.transitionToReveal(code);
      }

      return this.store.update(code, (g) => ({
        ...g,
        currentRoundIndex: nextIndex,
        timer: GameTimer.start(g.config.guessTimerSeconds, Date.now()),
      }));
    }

    if (game.phase === "REVEAL") {
      return this.store.update(code, (g) => ({
        ...g,
        phase: "SCOREBOARD" as const,
        timer: null,
      }));
    }

    throw new Error(`Cannot advance from ${game.phase} phase`);
  }

  async submitReaction(
    code: string,
    playerId: string,
    type: ReactionType
  ): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);
    if (game.phase !== "REVEAL") {
      throw new Error("Reactions can only be sent during REVEAL phase");
    }

    return this.store.update(code, (g) => ({
      ...g,
      reactions: [...g.reactions, { playerId, type, sentAt: Date.now() }],
    }));
  }

  async playAgain(code: string): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Game ${code} not found`);

    const prompt = pickRandomPrompt();

    return this.store.update(code, (g) => ({
      ...g,
      phase: "SUBMITTING" as const,
      promptText: prompt.text,
      answers: {},
      rounds: [],
      currentRoundIndex: 0,
      timer: null,
      revealStartedAt: null,
      reactions: [],
      players: g.players.map((p) => ({ ...p, score: 0 })),
    }));
  }

  private async transitionToGuessing(code: string): Promise<Game> {
    return this.store.update(code, (g) => {
      const rounds = this.buildRoundsFromAnswers(g);
      const timer = GameTimer.start(g.config.guessTimerSeconds, Date.now());
      return {
        ...g,
        phase: "GUESSING" as const,
        rounds,
        currentRoundIndex: 0,
        timer,
      };
    });
  }

  private async transitionToReveal(code: string): Promise<Game> {
    return this.store.update(code, (g) => {
      const engine = this.engineFor(g);
      // Sum score deltas across every round and apply them all at once.
      const totals = new Map<string, number>();
      for (let i = 0; i < g.rounds.length; i++) {
        const deltas = engine.calculateScores(g, i);
        for (const [playerId, delta] of deltas) {
          totals.set(playerId, (totals.get(playerId) ?? 0) + delta);
        }
      }
      const players = g.players.map((p) => ({
        ...p,
        score: p.score + (totals.get(p.id) ?? 0),
      }));

      return {
        ...g,
        phase: "REVEAL" as const,
        players,
        timer: null,
        revealStartedAt: Date.now(),
      };
    });
  }

  private buildRoundsFromAnswers(game: Game): Round[] {
    const entries = Object.entries(game.answers);
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    return entries.map(([authorId, answer], index) => ({
      index,
      authorId,
      answer,
      guesses: [],
    }));
  }
}
