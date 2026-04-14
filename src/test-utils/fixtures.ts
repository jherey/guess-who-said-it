import type { GameMeta } from "@/types";

/**
 * Minimal GameMeta for tests that don't care about catalog content.
 * Override only the fields the test asserts on.
 */
export function makeMeta(overrides: Partial<GameMeta> = {}): GameMeta {
  return {
    status: "available",
    name: "Test Game",
    tagline: "A test game",
    description: "Test description",
    rules: ["Rule 1"],
    minPlayers: 2,
    maxPlayers: 8,
    estimatedDurationMinutes: [5, 10],
    accentColor: "var(--color-player-1)",
    icon: "🎮",
    ...overrides,
  };
}
