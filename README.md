# Team Events

A real-time multiplayer icebreaker platform for team retrospectives. Browse a catalog of games, create a room, and play together on any device.

## Games

### Guess Who Said It (available)
Everyone answers a fun prompt anonymously, then the team guesses who wrote each answer.

### Two Truths and a Lie (coming soon)
Each player writes two truths and one lie — the team votes which statement is the lie.

### Hot Takes (coming soon)
Players post bold, controversial takes and the team reacts in real time.

## How Guess Who Said It Works

1. **Browse & Create** - Pick a game from the catalog. The host sets up a room.
2. **Join** - Players join on their phones via a 4-digit code or QR code.
3. **Answer the Prompt** - A fun question appears. Everyone types their answer anonymously.
4. **Guess Who** - Answers are revealed one at a time. Guess which teammate wrote each one before time runs out.
5. **Score & React** - +1 for a correct guess. +1 to the author for every person they fooled. React with "Knew it!", "No way!", or "Legend".
6. **Celebrate** - Final leaderboard with awards: Most Mysterious, Detective, Hype Person.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Animation**: Framer Motion
- **Testing**: Vitest (71 tests)
- **Runtime**: Bun
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun run test

# Build for production
bun run build
```

Open [http://localhost:3000](http://localhost:3000) to play.

## Project Structure

```
src/
  app/                          # Next.js pages + API routes
    page.tsx                    # Landing page (catalog + join)
    games/[gameKey]/            # Game detail + host setup form
    host/[code]/                # Host screen (projected display)
    play/[code]/                # Player screen (phone)
    api/game/                   # REST API endpoints
  components/ui/                # shadcn/ui + custom components
  lib/
    games/                      # Game modules (engine + screens per game)
      guess-who/                # Guess Who Said It implementation
      registry.ts               # Central game registry
    platform/                   # Core platform abstractions
      game-type.ts              # GameType interface all games implement
      game-controller.ts        # Orchestrates game lifecycle
      room-manager.ts           # Room creation + player management
      view-enricher.ts          # Derives player-specific views from state
      dispatch.ts               # Action dispatch layer
    store/                      # State persistence
      game-store.ts             # GameStore interface
      in-memory-store.ts        # In-process implementation
      vercel-kv-store.ts        # Vercel KV (Redis) implementation
    hooks/                      # useGamePolling, useCountdown
    prompts/                    # 50 curated workplace-safe prompts
    sync/                       # SyncProvider interface + polling impl
    timer/                      # Server-authoritative countdown timer
  types/                        # TypeScript interfaces
```

## Architecture

The app is a game platform where each game is a self-contained module registered in a central registry. Key abstractions:

- **GameType** - Interface each game mode implements (phases, scoring, awards). `GuessWhoGame` is the first; adding a new game means implementing this interface and registering it in `registry.ts`.
- **GameStore** - Interface for state persistence. Two implementations ship: `InMemoryGameStore` (default in dev) and `VercelKVGameStore` (Redis-backed, for production). Swap them without touching game logic.
- **SyncProvider** - Interface for client-server communication. Currently polling at 1.5s intervals; swappable to WebSocket without changing game logic.
- **GameTimer** - Pure functions with injected time for testability. Server-authoritative; clients display a synced countdown.

## Game Features

- 3–10 players
- Host is also a player (can submit answers and guess)
- Room code + QR code for easy joining
- 20-second countdown timer with pause, resume, and extend controls
- Real-time polling updates (~1.5s)
- Reactions after each reveal
- Awards: Most Mysterious, Detective, Hype Person
- Play Again with a new prompt
- Dark theme with game-show energy
- Mobile-first responsive design

## Deployment

Deploy to Vercel:

```bash
vercel
```

For production, set up a [Vercel KV](https://vercel.com/docs/storage/vercel-kv) database and set the `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables. The `VercelKVGameStore` will be used automatically, giving you persistent game state across serverless function instances with a 2-hour TTL per room.

Without KV configured, the app falls back to `InMemoryGameStore`, which works fine for a small team on a single instance but will lose state if the function is recycled mid-game.

## Future Plans

- WebSocket real-time via Fastify backend
- Two Truths and a Lie game mode
- Hot Takes game mode
- Custom host prompts
- Persistent game history
