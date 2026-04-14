export type GamePhase =
  | "LOBBY"
  | "SUBMITTING"
  | "GUESSING"
  | "REVEAL"
  | "SCOREBOARD";

export type ReactionType = "knew-it" | "no-way" | "legend";

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  score: number;
  isHost: boolean;
}

export interface Guess {
  playerId: string;
  guessedAuthorId: string;
}

export interface Reaction {
  playerId: string;
  type: ReactionType;
  /** Server timestamp when the reaction was received (ms). */
  sentAt: number;
}

export interface Round {
  index: number;
  authorId: string;
  answer: string;
  guesses: Guess[];
}

export interface GameConfig {
  maxPlayers: number;
  guessTimerSeconds: number;
}

export interface Game {
  code: string;
  /** Identifies which game type this room is playing. */
  gameKey: string;
  phase: GamePhase;
  players: Player[];
  promptText: string;
  answers: Record<string, string>; // playerId -> answer text
  rounds: Round[];
  currentRoundIndex: number;
  config: GameConfig;
  createdAt: number;
  timer: TimerState | null;
  /** Server timestamp (ms) when REVEAL phase began. Drives the cascade animation. */
  revealStartedAt: number | null;
  /** Reactions for the entire game's reveal phase, in send order. */
  reactions: Reaction[];
}

export interface TimerState {
  endsAt: number;
  paused: boolean;
  remaining: number; // ms remaining when paused
}

/**
 * Phase-aware view of game state sent to clients.
 *
 * Author identity and answer text for non-current rounds are withheld
 * during GUESSING — players guess every round blind, and only after the
 * final guess does REVEAL expose all author info at once.
 */
export interface GameView {
  code: string;
  /** Identifies which game type this room is playing. Server-authoritative. */
  gameKey: string;
  /** Resolved game metadata from the server registry. */
  meta: GameMeta;
  phase: GamePhase;
  players: Player[];
  promptText: string;
  currentRound: RoundView | null;
  rounds: RoundView[];
  timer: TimerState | null;
  submissionCount: number;
  totalPlayers: number;
  /** True if the requesting player is the author of the current round */
  isCurrentRoundAuthor: boolean;
  /** Awards calculated at SCOREBOARD phase */
  awards: { title: string; description: string; playerId: string; playerName: string }[];
  /** When REVEAL phase began (ms). Null outside REVEAL/SCOREBOARD. */
  revealStartedAt: number | null;
  /** All reactions sent during REVEAL, in order received. */
  reactions: Reaction[];
}

/**
 * Game metadata. Authoritative on the server (lives in the registry); echoed
 * to clients via GameView. Used to render the catalog homepage, the per-game
 * detail page, and any in-game references to game identity.
 */
export interface GameMeta {
  status: "available" | "coming-soon";
  /** Display name shown in the catalog and detail page hero. */
  name: string;
  /** One-line punchy description for the catalog card. */
  tagline: string;
  /** Long-form paragraph for the detail page. */
  description: string;
  /** Bulleted "How to play" lines for the detail page rules card. */
  rules: string[];
  /** Recommended minimum number of players. */
  minPlayers: number;
  /** Recommended maximum number of players. */
  maxPlayers: number;
  /** Estimated game duration as a [min, max] minute range. */
  estimatedDurationMinutes: [number, number];
  /** CSS variable name for the catalog card highlight (e.g. "--color-player-1"). */
  accentColor: string;
  /** Single emoji or short character used as the game icon. */
  icon: string;
}

export interface RoundView {
  index: number;
  /** Empty string for non-current rounds during GUESSING (answer hidden). */
  answer: string;
  /** null until REVEAL/SCOREBOARD. */
  authorId: string | null;
  guesses: Guess[];
  guessCount: number;
}
