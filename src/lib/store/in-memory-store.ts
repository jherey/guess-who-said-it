import type { Game } from "@/types";
import type { GameStore } from "./game-store";

/**
 * In-memory implementation of GameStore.
 * Games are stored in a Map and lost on server restart.
 * Swap to Redis/DB by implementing the same GameStore interface.
 */
export class InMemoryGameStore implements GameStore {
  private games = new Map<string, Game>();

  async create(game: Game): Promise<Game> {
    if (this.games.has(game.code)) {
      throw new Error(`Game with code ${game.code} already exists`);
    }
    this.games.set(game.code, game);
    return game;
  }

  async get(code: string): Promise<Game | null> {
    return this.games.get(code) ?? null;
  }

  async update(code: string, updater: (game: Game) => Game): Promise<Game> {
    const existing = this.games.get(code);
    if (!existing) {
      throw new Error(`Game with code ${code} not found`);
    }
    const updated = updater(existing);
    this.games.set(code, updated);
    return updated;
  }

  async delete(code: string): Promise<void> {
    this.games.delete(code);
  }

  async exists(code: string): Promise<boolean> {
    return this.games.has(code);
  }
}

/**
 * Singleton store instance.
 * Uses Vercel KV when KV_REST_API_URL is set (production on Vercel),
 * falls back to in-memory for local development.
 */
let storeInstance: GameStore | null = null;

export function getGameStore(): GameStore {
  if (storeInstance) return storeInstance;

  if (process.env.KV_REST_API_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { VercelKVGameStore } = require("./vercel-kv-store");
    storeInstance = new VercelKVGameStore() as GameStore;
  } else {
    storeInstance = new InMemoryGameStore();
  }

  return storeInstance;
}
