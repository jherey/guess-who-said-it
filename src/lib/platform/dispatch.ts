import type { GameView } from "@/types";
import type { GameRegistry, GameRegistryEntry } from "@/lib/games/registry";

export type DispatchState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "unknown-game"; gameKey: string }
  | { kind: "ready"; entry: GameRegistryEntry };

export interface DispatchInput {
  gameView: GameView | null;
  error: string | null;
  registry: GameRegistry;
}

export function resolveDispatchState(input: DispatchInput): DispatchState {
  if (input.error) {
    return { kind: "error", message: input.error };
  }
  if (!input.gameView) {
    return { kind: "loading" };
  }
  const entry = input.registry[input.gameView.gameKey];
  if (!entry) {
    return { kind: "unknown-game", gameKey: input.gameView.gameKey };
  }
  return { kind: "ready", entry };
}
