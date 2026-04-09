import type { GameView } from "@/types";

/**
 * Interface for client-server communication.
 * Polling implementation now, WebSocket via Fastify later.
 * Game logic never calls HTTP/WS directly — it goes through this abstraction.
 */
export interface SyncProvider {
  /** Get the current game view for a player. */
  getGameView(code: string, playerId: string): Promise<GameView | null>;

  /** Subscribe to game state changes (used by clients). */
  subscribe(
    code: string,
    playerId: string,
    callback: (view: GameView) => void
  ): () => void;
}
