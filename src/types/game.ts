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
}

export interface Round {
  index: number;
  authorId: string;
  answer: string;
  guesses: Guess[];
  reactions: Reaction[];
  revealed: boolean;
}

export interface GameConfig {
  maxPlayers: number;
  guessTimerSeconds: number;
}

export interface Game {
  code: string;
  phase: GamePhase;
  players: Player[];
  promptText: string;
  answers: Map<string, string>; // playerId -> answer text
  rounds: Round[];
  currentRoundIndex: number;
  config: GameConfig;
  createdAt: number;
  timer: TimerState | null;
}

export interface TimerState {
  endsAt: number;
  paused: boolean;
  remaining: number; // ms remaining when paused
}

/**
 * Phase-aware view of game state sent to clients.
 * Never exposes answer authors during GUESSING phase.
 */
export interface GameView {
  code: string;
  phase: GamePhase;
  players: Player[];
  promptText: string;
  currentRound: RoundView | null;
  rounds: RoundView[];
  timer: TimerState | null;
  submissionCount: number;
  totalPlayers: number;
}

export interface RoundView {
  index: number;
  answer: string;
  authorId: string | null; // null until revealed
  guesses: Guess[];
  guessCount: number;
  reactions: Reaction[];
  revealed: boolean;
}
