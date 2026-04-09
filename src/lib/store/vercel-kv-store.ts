import { kv } from "@vercel/kv";
import type { Game } from "@/types";
import type { GameStore } from "./game-store";

const KEY_PREFIX = "game:";
const TTL_SECONDS = 7200; // 2 hours

function key(code: string): string {
  return `${KEY_PREFIX}${code}`;
}

/**
 * Vercel KV (Redis) implementation of GameStore.
 * Each game is stored as a JSON value with a 2-hour TTL.
 * Auto-cleans up after games naturally expire.
 */
export class VercelKVGameStore implements GameStore {
  async create(game: Game): Promise<Game> {
    const exists = await kv.exists(key(game.code));
    if (exists) {
      throw new Error(`Game with code ${game.code} already exists`);
    }
    await kv.set(key(game.code), game, { ex: TTL_SECONDS });
    return game;
  }

  async get(code: string): Promise<Game | null> {
    return kv.get<Game>(key(code));
  }

  async update(code: string, updater: (game: Game) => Game): Promise<Game> {
    const existing = await this.get(code);
    if (!existing) {
      throw new Error(`Game with code ${code} not found`);
    }
    const updated = updater(existing);
    await kv.set(key(code), updated, { ex: TTL_SECONDS });
    return updated;
  }

  async delete(code: string): Promise<void> {
    await kv.del(key(code));
  }

  async exists(code: string): Promise<boolean> {
    const result = await kv.exists(key(code));
    return result > 0;
  }
}
