/**
 * Player avatar and color pools.
 * Each player joining a room gets a unique avatar + color from these pools.
 * Designed for 4-10 players.
 */

export const PLAYER_AVATARS = [
  "🦊", // Fox
  "🐙", // Octopus
  "🦄", // Unicorn
  "🐸", // Frog
  "🦁", // Lion
  "🐧", // Penguin
  "🦋", // Butterfly
  "🐲", // Dragon
  "🦉", // Owl
  "🐬", // Dolphin
] as const;

export const PLAYER_COLORS = [
  "var(--color-player-1)",
  "var(--color-player-2)",
  "var(--color-player-3)",
  "var(--color-player-4)",
  "var(--color-player-5)",
  "var(--color-player-6)",
  "var(--color-player-7)",
  "var(--color-player-8)",
  "var(--color-player-9)",
  "var(--color-player-10)",
] as const;

/** Tailwind-compatible color class names for player backgrounds */
export const PLAYER_COLOR_CLASSES = [
  "bg-player-1",
  "bg-player-2",
  "bg-player-3",
  "bg-player-4",
  "bg-player-5",
  "bg-player-6",
  "bg-player-7",
  "bg-player-8",
  "bg-player-9",
  "bg-player-10",
] as const;

/**
 * Get the next available avatar and color for a new player.
 * Returns the first unused pair based on current player count.
 */
export function getNextPlayerIdentity(currentPlayerCount: number): {
  avatar: string;
  color: string;
} {
  const index = currentPlayerCount % PLAYER_AVATARS.length;
  return {
    avatar: PLAYER_AVATARS[index],
    color: PLAYER_COLORS[index],
  };
}
