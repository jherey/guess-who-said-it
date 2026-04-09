# Guess Who Said It

A real-time multiplayer icebreaker game for team retrospectives. Everyone answers a fun prompt anonymously, then the team guesses who wrote each answer.

## How It Works

1. **Create & Join** - The host creates a game room. Players join via a 4-digit code or QR code on their phones.
2. **Answer the Prompt** - A fun question appears. Everyone types their answer anonymously.
3. **Guess Who** - Answers are revealed one at a time. Guess which teammate wrote each one before time runs out.
4. **Score & React** - +1 for a correct guess. +1 to the author for every person they fooled. React with "Knew it!", "No way!", or "Legend".
5. **Celebrate** - Final leaderboard with awards: Most Mysterious, Detective, Social Butterfly.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: Framer Motion
- **Testing**: Vitest (50 tests)
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
    page.tsx                    # Landing page (create/join game)
    game/[code]/                # Game board (host projected screen)
    play/[code]/                # Player screen (phone)
    api/game/                   # REST API endpoints
  components/ui/                # shadcn/ui components
  lib/
    engine/                     # Game engine, controller, room manager
    store/                      # GameStore interface + in-memory impl
    hooks/                      # useGamePolling, useCountdown
    prompts/                    # 50 curated workplace-safe prompts
    timer/                      # Server-authoritative countdown timer
  types/                        # TypeScript interfaces
```

## Architecture

The app is built as an extensible game platform. Key abstractions:

- **GameType** - Interface each game mode implements (phases, scoring, awards). "Guess Who Said It" is the first; Hot Takes, Two Truths and a Lie, etc. can be added by implementing the same interface.
- **GameStore** - Interface for state persistence. Currently in-memory; swappable to Redis/DB without changing game logic.
- **SyncProvider** - Interface for client-server communication. Currently polling (1.5s); swappable to WebSocket via Fastify without changing game logic.
- **GameTimer** - Pure functions with injected time for testability. Server-authoritative; clients display a synced countdown.

## Game Features

- 4-10 players
- Host is also a player (can submit answers and guess)
- Room code + QR code for easy joining
- 20-second countdown timer with pause, resume, and extend controls
- Real-time polling updates (~1.5s)
- Reactions after each reveal
- Awards: Most Mysterious, Detective, Social Butterfly
- Play Again with a new prompt
- Dark theme with game-show energy
- Mobile-first responsive design

## Deployment

Deploy to Vercel:

```bash
vercel
```

Important: Game state is stored in-memory on the server. Vercel serverless functions are stateless, so each API route invocation may hit a different instance. For a retro with a small team this works fine on a single serverless function, but for production use consider adding Redis or a database backend via the GameStore interface.

## Future Plans

- WebSocket real-time via Fastify backend on Hetzner
- Additional game modes (Hot Takes, Two Truths and a Lie, This or That)
- Custom host prompts
- Persistent game history
- User accounts
