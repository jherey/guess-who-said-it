import type { Game, Player } from "@/types";
import type { GameStore } from "@/lib/store/game-store";
import type { GameRegistry } from "@/lib/games/registry";
import { getNextPlayerIdentity } from "@/lib/player-pool";

export class RoomManager {
  constructor(
    private store: GameStore,
    private registry: GameRegistry
  ) {}

  async createRoom(hostName: string, gameKey: string): Promise<Game> {
    const entry = this.registry[gameKey];
    if (!entry) {
      throw new Error(`Unknown game: "${gameKey}"`);
    }
    if (entry.meta.status !== "available") {
      throw new Error(`Game "${gameKey}" is not yet available`);
    }

    const code = await this.generateUniqueCode();
    const host = this.createPlayer(hostName, 0, true);

    const game: Game = {
      code,
      gameKey,
      phase: "LOBBY",
      players: [host],
      promptText: "",
      answers: {},
      rounds: [],
      currentRoundIndex: 0,
      config: { maxPlayers: 10, guessTimerSeconds: 20 },
      createdAt: Date.now(),
      timer: null,
      revealStartedAt: null,
      reactions: [],
    };

    return this.store.create(game);
  }

  async joinRoom(code: string, playerName: string): Promise<Game> {
    const game = await this.store.get(code);
    if (!game) throw new Error(`Room ${code} not found`);
    if (game.players.length >= game.config.maxPlayers) {
      throw new Error("Room is full");
    }
    if (game.players.some((p) => p.name === playerName)) {
      throw new Error(`Player name "${playerName}" is already taken`);
    }

    return this.store.update(code, (g) => {
      const player = this.createPlayer(playerName, g.players.length, false);
      return { ...g, players: [...g.players, player] };
    });
  }

  private createPlayer(
    name: string,
    index: number,
    isHost: boolean
  ): Player {
    const { avatar, color } = getNextPlayerIdentity(index);
    return {
      id: crypto.randomUUID(),
      name,
      avatar,
      color,
      score: 0,
      isHost,
    };
  }

  private async generateUniqueCode(): Promise<string> {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
    let code: string;
    do {
      code = Array.from({ length: 4 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    } while (await this.store.exists(code));
    return code;
  }
}
