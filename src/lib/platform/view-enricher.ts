import type { GameMeta, GameView } from "@/types";

/**
 * Enriches the engine's raw game view with platform-level metadata
 * (gameKey + meta) before it leaves the server.
 *
 * The engine produces everything except gameKey/meta — those are platform
 * concerns and the engine has no knowledge of the registry. This wrapper
 * is the boundary where platform metadata is attached.
 */
export function enrichGameView(
  engineView: Omit<GameView, "gameKey" | "meta">,
  gameKey: string,
  meta: GameMeta
): GameView {
  return {
    ...engineView,
    gameKey,
    meta,
  };
}
