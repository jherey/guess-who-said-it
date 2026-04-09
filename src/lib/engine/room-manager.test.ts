import { describe, it, expect, beforeEach } from "vitest";
import { RoomManager } from "./room-manager";
import { InMemoryGameStore } from "@/lib/store/in-memory-store";

describe("RoomManager", () => {
  let roomManager: RoomManager;
  let store: InMemoryGameStore;

  beforeEach(() => {
    store = new InMemoryGameStore();
    roomManager = new RoomManager(store);
  });

  it("creates a room with a 4-character code in LOBBY phase", async () => {
    const game = await roomManager.createRoom("Alice");

    expect(game.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(game.phase).toBe("LOBBY");
    expect(game.players).toHaveLength(1);
    expect(game.players[0].name).toBe("Alice");
    expect(game.players[0].isHost).toBe(true);
  });

  it("allows a player to join and assigns unique avatar and color", async () => {
    const game = await roomManager.createRoom("Alice");
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
    const game = await roomManager.createRoom("Host");
    // Fill up to 10 players
    for (let i = 1; i < 10; i++) {
      await roomManager.joinRoom(game.code, `Player${i}`);
    }
    await expect(
      roomManager.joinRoom(game.code, "OneMore")
    ).rejects.toThrow("full");
  });

  it("rejects join with duplicate player name", async () => {
    const game = await roomManager.createRoom("Alice");
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
