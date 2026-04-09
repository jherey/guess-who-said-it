import type { Game } from "@/types";

/**
 * Interface for persisting game state.
 * In-memory implementation now, Redis/DB later.
 * Swapping storage backends should not change game logic.
 */
export interface GameStore {
  /** Create a new game and return it. */
  create(game: Game): Promise<Game>;

  /** Get a game by room code. Returns null if not found. */
  get(code: string): Promise<Game | null>;

  /** Update a game. Returns the updated game. */
  update(code: string, updater: (game: Game) => Game): Promise<Game>;

  /** Delete a game by room code. */
  delete(code: string): Promise<void>;

  /** Check if a room code is already in use. */
  exists(code: string): Promise<boolean>;
}
