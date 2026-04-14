/**
 * Game registry — the single source of truth for which games exist on the platform.
 *
 * Phase 1 ships only the minimum shape needed for room creation to validate
 * that a requested gameKey is known and available. The full GameModule shape
 * (engine, components, theme overrides) is introduced in later phases.
 */

import type { ComponentType } from "react";
import type { GameMeta, GameView } from "@/types";
import type { GameType } from "@/lib/platform";
import { GuessWhoGame, PlayerScreen, HostScreen } from "./guess-who";

/** Uniform props every game's PlayerScreen and HostScreen receive from the dispatcher. */
export interface GameScreenProps {
  code: string;
  playerId: string;
  gameView: GameView;
  refetch: () => void;
}

export interface GameRegistryEntry {
  meta: GameMeta;
  /** Optional in coming-soon entries; required for available games. */
  engine?: GameType;
  /** Optional in coming-soon entries; required for available games. */
  PlayerScreen?: ComponentType<GameScreenProps>;
  /** Optional in coming-soon entries; required for available games. */
  HostScreen?: ComponentType<GameScreenProps>;
}

export type GameRegistry = Record<string, GameRegistryEntry>;

/**
 * The live registry of games on the platform. Add a new game by registering
 * its module here keyed by a stable string identifier.
 */
export const GAMES = {
  "guess-who": {
    meta: {
      status: "available" as const,
      name: "Guess Who Said It",
      tagline: "Anonymous answers, blind guesses, big reveal.",
      description:
        "Everyone answers the same prompt anonymously on their phone. Then the team sees each answer one by one — without knowing who wrote it — and tries to guess. After every round is in, all the authors flip open at once in a dramatic reveal cascade. Earn a point for each correct guess, and a point for every player you fooled.",
      rules: [
        "The host shares a room code; players join on their phones.",
        "Everyone answers the same prompt anonymously.",
        "Anonymous answers appear one at a time. Guess who wrote each one.",
        "After every round, all the authors flip open at once.",
        "+1 for each correct guess. +1 to the author for every player they fooled.",
        "Final scoreboard with awards: Most Mysterious, Detective, Hype Person.",
      ],
      minPlayers: 3,
      maxPlayers: 10,
      estimatedDurationMinutes: [10, 15] as [number, number],
      accentColor: "var(--color-player-1)",
      icon: "🕵️",
    },
    engine: new GuessWhoGame(),
    PlayerScreen,
    HostScreen,
  },
  "two-truths": {
    meta: {
      status: "coming-soon" as const,
      name: "Two Truths and a Lie",
      tagline: "One lie hidden in plain sight.",
      description:
        "Each player writes two true things about themselves and one lie. Then, one by one, everyone takes the spotlight — and the rest of the team votes which statement is the lie. Score points for spotting lies and for fooling your teammates with a believable one.",
      rules: [
        "The host shares a room code; players join on their phones.",
        "Each player writes two truths and one lie about themselves.",
        "One player at a time goes on stage; their three statements appear.",
        "Everyone else votes which one is the lie.",
        "+1 for spotting the lie. +1 to the on-stage player for every teammate they fooled.",
        "Final scoreboard with awards: Best Liar, Polygraph, and more.",
      ],
      minPlayers: 3,
      maxPlayers: 10,
      estimatedDurationMinutes: [10, 15] as [number, number],
      accentColor: "var(--color-player-3)",
      icon: "🤥",
    },
  },
  "hot-takes": {
    meta: {
      status: "coming-soon" as const,
      name: "Hot Takes",
      tagline: "Spicy opinions, honest reactions.",
      description:
        "Players post bold, controversial takes about work, culture, or life — and the team reacts in real time. No scoring, no winners. Just an honest temperature check on what your team actually thinks.",
      rules: [
        "The host shares a room code; players join on their phones.",
        "Players take turns posting a hot take.",
        "Everyone else reacts: strongly agree, disagree, or somewhere in between.",
        "The team sees the spread of reactions in real time.",
        "Move on to the next take — discuss as much or as little as you want.",
        "End with a summary of the spiciest takes and the most divisive ones.",
      ],
      minPlayers: 3,
      maxPlayers: 15,
      estimatedDurationMinutes: [10, 20] as [number, number],
      accentColor: "var(--color-player-9)",
      icon: "🔥",
    },
  },
} as const satisfies GameRegistry;

/** Union of all known game keys, derived from the GAMES record. */
export type GameKey = keyof typeof GAMES;

/** Returns the entries from a registry whose meta.status is "available". */
export function getAvailableGames(
  registry: GameRegistry
): Array<[string, GameRegistryEntry]> {
  return Object.entries(registry).filter(
    ([, entry]) => entry.meta.status === "available"
  );
}

/**
 * Look up a game entry by key, widened to the GameRegistryEntry interface
 * so optional fields (engine, components, themeOverrides) are visible.
 *
 * Use this when accessing GAMES dynamically by string key — direct indexing
 * (`GAMES[key]`) returns the literal type which doesn't expose optional
 * fields on coming-soon entries.
 */
export function getGameEntry(key: string): GameRegistryEntry | undefined {
  return (GAMES as GameRegistry)[key];
}

