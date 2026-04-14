import { describe, it, expect, beforeEach } from "vitest";
import { RoomManager } from "./room-manager";
import { InMemoryGameStore } from "@/lib/store/in-memory-store";
import type { GameRegistry } from "@/lib/games/registry";
import { makeMeta } from "@/test-utils/fixtures";

const testRegistry: GameRegistry = {
  "guess-who": { meta: makeMeta({ status: "available" }) },
  "future-game": { meta: makeMeta({ status: "coming-soon" }) },
};

describe("RoomManager", () => {
  let roomManager: RoomManager;
  let store: InMemoryGameStore;

  beforeEach(() => {
    store = new InMemoryGameStore();
    roomManager = new RoomManager(store, testRegistry);
  });

  it("creates a room with a 4-character code in LOBBY phase", async () => {
    const game = await roomManager.createRoom("Alice", "guess-who");

    expect(game.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(game.phase).toBe("LOBBY");
    expect(game.players).toHaveLength(1);
    expect(game.players[0].name).toBe("Alice");
    expect(game.players[0].isHost).toBe(true);
  });

  it("records the gameKey on the created Game", async () => {
    const game = await roomManager.createRoom("Alice", "guess-who");

    expect(game.gameKey).toBe("guess-who");
  });

  it("rejects createRoom with an unknown gameKey", async () => {
    await expect(
      roomManager.createRoom("Alice", "made-up-key")
    ).rejects.toThrow(/unknown game/i);
  });

  it("rejects createRoom with a coming-soon gameKey", async () => {
    await expect(
      roomManager.createRoom("Alice", "future-game")
    ).rejects.toThrow(/not yet available/i);
  });

  it("allows a player to join and assigns unique avatar and color", async () => {
    const game = await roomManager.createRoom("Alice", "guess-who");
    const updated = await roomManager.joinRoom(game.code, "Bob");

    expect(updated.players).toHaveLength(2);
    const bob = updated.players.find((p) => p.name === "Bob")!;
    expect(bob.isHost).toBe(false);
    expect(bob.avatar).toBeDefined();
    expect(bob.color).toBeDefined();
    // Avatar and color should differ from the host
    const alice = updated.players.find((p) => p.name === "Alice")!;
    expect(bob.avatar).not.toBe(alice.avatar);
    expect(bob.color).not.toBe(alice.color);
  });

  it("rejects join when room is full", async () => {
    const game = await roomManager.createRoom("Host", "guess-who");
    // Fill up to 10 players
    for (let i = 1; i < 10; i++) {
      await roomManager.joinRoom(game.code, `Player${i}`);
    }
    await expect(
      roomManager.joinRoom(game.code, "OneMore")
    ).rejects.toThrow("full");
  });

  it("rejects join with duplicate player name", async () => {
    const game = await roomManager.createRoom("Alice", "guess-who");
    await roomManager.joinRoom(game.code, "Bob");
    await expect(
      roomManager.joinRoom(game.code, "Bob")
    ).rejects.toThrow("already taken");
  });

  it("rejects join to nonexistent room", async () => {
    await expect(
      roomManager.joinRoom("ZZZZ", "Alice")
    ).rejects.toThrow("not found");
  });
});
