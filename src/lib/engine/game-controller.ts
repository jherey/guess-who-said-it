import type { Game, Round } from "@/types";
import type { GameStore } from "@/lib/store/game-store";
import { GuessWhoGame } from "./guess-who-game";
import { pickRandomPrompt } from "@/lib/prompts";

const gameType = new GuessWhoGame();

export class GameController {
  constructor(private store: GameStore) {}

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
      answers: new Map(),
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
    if (game.answers.has(playerId)) {
      throw new Error("Player has already submitted an answer");
    }

    const updated = await this.store.update(code, (g) => {
      const newAnswers = new Map(g.answers);
      newAnswers.set(playerId, answer);
      return { ...g, answers: newAnswers };
    });

    // Auto-transition if all players have submitted
    if (updated.answers.size >= updated.players.length) {
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
    if (game.answers.size === 0) {
      throw new Error("At least one answer is required");
    }

    return this.transitionToGuessing(code);
  }

  private async transitionToGuessing(code: string): Promise<Game> {
    return this.store.update(code, (g) => {
      const rounds = this.buildRoundsFromAnswers(g);
      return {
        ...g,
        phase: "GUESSING" as const,
        rounds,
        currentRoundIndex: 0,
      };
    });
  }

  private buildRoundsFromAnswers(game: Game): Round[] {
    const entries = Array.from(game.answers.entries());
    // Shuffle the entries so the order doesn't reveal who submitted when
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    return entries.map(([authorId, answer], index) => ({
      index,
      authorId,
      answer,
      guesses: [],
      reactions: [],
      revealed: false,
    }));
  }
}
