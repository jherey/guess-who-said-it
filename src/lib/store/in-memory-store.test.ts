import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryGameStore } from "./in-memory-store";
import type { Game } from "@/types";

function createTestGame(overrides: Partial<Game> = {}): Game {
  return {
    code: "ABCD",
    phase: "LOBBY",
    players: [],
    promptText: "",
    answers: new Map(),
    rounds: [],
    currentRoundIndex: 0,
    config: { maxPlayers: 10, guessTimerSeconds: 20 },
    createdAt: Date.now(),
    timer: null,
    ...overrides,
  };
}

describe("InMemoryGameStore", () => {
  let store: InMemoryGameStore;

  beforeEach(() => {
    store = new InMemoryGameStore();
  });

  it("creates and retrieves a game", async () => {
    const game = createTestGame();
    await store.create(game);

    const retrieved = await store.get("ABCD");
    expect(retrieved).not.toBeNull();
    expect(retrieved!.code).toBe("ABCD");
    expect(retrieved!.phase).toBe("LOBBY");
  });

  it("returns null for nonexistent game", async () => {
    const result = await store.get("NOPE");
    expect(result).toBeNull();
  });

  it("rejects duplicate game codes", async () => {
    await store.create(createTestGame());
    await expect(store.create(createTestGame())).rejects.toThrow(
      "already exists"
    );
  });

  it("updates a game via updater function", async () => {
    await store.create(createTestGame());

    const updated = await store.update("ABCD", (game) => ({
      ...game,
      phase: "SUBMITTING" as const,
    }));

    expect(updated.phase).toBe("SUBMITTING");

    const retrieved = await store.get("ABCD");
    expect(retrieved!.phase).toBe("SUBMITTING");
  });

  it("throws when updating nonexistent game", async () => {
    await expect(
      store.update("NOPE", (g) => g)
    ).rejects.toThrow("not found");
  });

  it("deletes a game", async () => {
    await store.create(createTestGame());
    await store.delete("ABCD");

    const result = await store.get("ABCD");
    expect(result).toBeNull();
  });

  it("checks existence correctly", async () => {
    expect(await store.exists("ABCD")).toBe(false);
    await store.create(createTestGame());
    expect(await store.exists("ABCD")).toBe(true);
  });
});
