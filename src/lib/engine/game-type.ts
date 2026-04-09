import type { Game, GamePhase, GameView, Player } from "@/types";

/**
 * Interface that each game mode implements.
 * "Guess Who Said It" is the first implementation.
 * Future games (Hot Takes, Two Truths, etc.) implement the same interface.
 */
export interface GameType {
  readonly name: string;
  readonly description: string;

  /** Initial phase when the game starts (after lobby). */
  readonly firstPhase: GamePhase;

  /** Valid phase transitions for this game type. */
  validTransitions(currentPhase: GamePhase): GamePhase[];

  /** Calculate scores for a revealed round. */
  calculateScores(game: Game, roundIndex: number): Map<string, number>;

  /** Build a phase-aware view of the game for a specific player. */
  buildGameView(game: Game, playerId: string): GameView;

  /** Calculate end-of-game awards. */
  calculateAwards(game: Game): Award[];
}

export interface Award {
  title: string;
  description: string;
  playerId: string;
  playerName: string;
}
