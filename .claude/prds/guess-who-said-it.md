# Guess Who Said It — Icebreaker Game for Team Retros

## Problem Statement

Team retrospectives often start cold — people jump straight into agenda items without warming up, leading to quieter discussions and less psychological safety. Icebreakers help, but running them manually (going around the room, awkward silences) is clunky and loses energy fast. There's no lightweight, fun, real-time tool purpose-built for team retro icebreakers that's easy to spin up and doesn't require accounts or setup overhead.

## Solution

A real-time multiplayer web game called **Guess Who Said It** where a host creates a game room, team members join on their phones via a code or QR scan, everyone answers a fun prompt anonymously, and then the team guesses who wrote each answer. Points are awarded for correct guesses and for fooling others. The game takes 10-15 minutes — perfect icebreaker length.

The app is architected as an extensible game platform. "Guess Who Said It" is the first game type, but the engine supports adding more (Hot Takes, Two Truths and a Lie, This or That, etc.) via a common game type interface.

## User Stories

1. As a host, I want to create a new game room so that my team can join and play an icebreaker before our retro.
2. As a host, I want to see a room code and QR code on my screen so that players can join quickly without friction.
3. As a host, I want to start the game once enough players have joined so that we can begin on my schedule.
4. As a host, I want to see a live count of how many players have submitted answers so that I know when everyone is ready.
5. As a host, I want to see a live count of how many players have guessed so that I know when to move to the reveal.
6. As a host, I want to pause or extend the countdown timer so that I can let good discussions continue.
7. As a host, I want to advance to the next round manually if the timer hasn't expired so that I can keep the pace up.
8. As a host, I want to also participate as a player (submit answers, guess, earn points) so that no one is left out in a small team.
9. As a player, I want to join a game by entering a short code or scanning a QR code so that I can get in quickly from my phone.
10. As a player, I want to enter my name when joining so that other players can identify me during the guessing phase.
11. As a player, I want to be assigned a random avatar and color on join so that I have a visual identity without needing to set one up.
12. As a player, I want to see the prompt on my phone so that I can type my answer privately.
13. As a player, I want to submit my answer anonymously so that others don't know it's mine during the guessing phase.
14. As a player, I want to see confirmation that my answer was submitted so that I know it went through.
15. As a player, I want to see an anonymous answer and a grid of player avatars so that I can pick who I think wrote it.
16. As a player, I want to see a countdown timer while guessing so that I feel urgency and the game keeps moving.
17. As a player, I want to see who actually wrote the answer after the reveal so that I learn something new about my teammate.
18. As a player, I want to tap a quick reaction after the reveal ("Knew it!", "No way!", "Legend") so that I can express my surprise or amusement.
19. As a player, I want to see reactions from others pop up on screen so that the reveal moment feels alive and shared.
20. As a player, I want to earn points for guessing correctly (+1) so that there's a competitive incentive.
21. As a player, I want to earn points for each person I fooled (+1 per person) so that writing a tricky answer is rewarded.
22. As a player, I want to see a final scoreboard at the end so that we can celebrate the winner.
23. As a player, I want to see fun awards ("Most Mysterious", "Detective") so that the ending has personality beyond just a score.
24. As a player, I want the game to work well on my phone in portrait mode so that I can play comfortably one-handed.
25. As a viewer (on the projected host screen), I want to see the room code and QR prominently during the lobby phase so that latecomers can still join.
26. As a viewer, I want to see the prompt displayed clearly during the submission phase so that I know what we're answering.
27. As a viewer, I want to see each anonymous answer displayed one at a time during guessing so that focus is on one answer at a time.
28. As a viewer, I want to see a dramatic reveal animation when the author is shown so that the moment has impact.
29. As a viewer, I want to see reactions bubbling up on screen after a reveal so that the energy in the room is reflected on screen.
30. As a viewer, I want to see the final scoreboard with awards so that the game has a clear, celebratory ending.

## Implementation Decisions

### Architecture

- **Game Engine abstraction**: A `GameType` interface that each game implements. Defines phases (lobby, submission, guessing, reveal, scoreboard), scoring logic, valid player actions per phase, and phase transition rules. "Guess Who Said It" is the first implementation. "Hot Takes", "Two Truths and a Lie", and others can be added later by implementing the same interface.
- **Room Manager**: Handles room creation (generates 4-character alphanumeric codes), player join/leave, avatar/color assignment from a predefined pool, and room lifecycle. Stores state in-memory using a `GameStore` interface that can be swapped to Redis or a database later without changing game logic.
- **Prompt Bank**: A data module with 15-20 curated prompts suitable for team/retro settings. Provides random selection with no-repeat logic within a session. The interface supports adding custom host prompts in a future version.
- **Sync Layer**: Abstraction over client-server communication. Tomorrow's implementation: Next.js API routes with short-polling (~1-2 second intervals). Future: swap to WebSocket via Fastify on Hetzner. Game logic interacts with the sync layer, never with HTTP/WS directly.
- **Timer & Round Controller**: Server-authoritative countdown. The server tracks the canonical timer state; clients display a synced countdown. Supports pause, extend, and manual advance by the host.

### Screens

- **Game Board (Host/Projected Screen)**: Full-screen view designed for projection or screen sharing. Shows room code + QR in lobby, prompt during submission, anonymous answers during guessing, reveal with animation, reaction bubbles, and final scoreboard with awards.
- **Player Screen (Phone)**: Mobile-first, portrait-optimized. Join form (code + name), answer text input, guess picker (avatar grid of all players), reaction buttons (3-4 options), personal score view.
- **Host Controls**: The host sees player controls on their phone AND the game board on the projected screen. Host phone has additional controls: start game, pause/extend timer, advance round, end game.

### Tech Stack

- **Frontend/API**: Next.js (App Router) deployed on Vercel
- **State**: In-memory on the server, behind a `GameStore` interface
- **Future backend**: Fastify on Hetzner (WebSocket support, persistent storage)
- **Future database**: To be determined (Postgres, Redis, or SQLite depending on needs)

### Scoring

- +1 point for a correct guess (you picked the right author)
- +1 point to the author for each player they fooled (someone guessed wrong on their answer)
- Awards at the end: "Most Mysterious" (fooled the most people total), "Detective" (most correct guesses), and other fun superlatives

### Design Direction

- Playful, colorful, game-show energy
- Bold countdown animations that build tension
- Satisfying reveal animations with impact
- Reaction bubbles that pop up on the game board
- Unique typography and color palette — no generic AI aesthetic
- Each player's avatar/color used consistently throughout for visual identity

### Player Limits

- Designed for 4-10 players
- UI optimized for this range (avatar grid, not scrollable list)

## Testing Decisions

Good tests verify external behavior through the module's public interface, not implementation details. A test should break only when the module's behavior changes, not when internals are refactored.

### Modules to test

- **Game Engine**: Phase transitions (lobby → submission → guessing → reveal → scoreboard), scoring calculations (correct guess points, fooled-others points), edge cases (all players guess correctly, no one guesses correctly, player disconnects mid-round), award calculations.
- **Room Manager**: Room creation and code uniqueness, player join with name and avatar assignment, player leave and reconnect, room capacity limits (max 10), room cleanup/expiry.
- **Timer & Round Controller**: Countdown accuracy, pause/resume behavior, extend time behavior, auto-advance when timer expires, manual advance by host.

### Modules NOT tested (for now)

- UI components (Game Board, Player Screen) — manually tested tomorrow, component tests added later.
- Sync Layer — integration tested through game flow, not unit tested in isolation.
- Prompt Bank — static data, no logic worth testing beyond basic "returns a prompt" smoke test.

## Out of Scope

- **Other game types**: Hot Takes, Two Truths and a Lie, This or That, Story Chain, Emoji Week, Bingo — designed for in the architecture but not built.
- **Custom host prompts**: The prompt bank interface supports it, but the UI for adding custom prompts is not built tomorrow.
- **Persistent storage**: No database, no game history, no replays. In-memory only.
- **User accounts / authentication**: Players join with just a name. No login, no profiles.
- **WebSocket real-time**: Polling for now. WebSocket via Fastify is a future upgrade.
- **Deployment of Fastify backend**: No Hetzner setup. Vercel only for now.
- **Accessibility audit**: Basic accessibility (keyboard nav, semantic HTML) but no formal WCAG audit.
- **Internationalization**: English only.
- **Native mobile app**: Web only, mobile-optimized.

## Further Notes

- The retro is tomorrow — the MVP must be deployable by then. Every decision has been made to minimize scope while preserving the extensibility of the architecture.
- The `GameType` interface is the most important architectural decision. Getting it right means adding Hot Takes or any other game is a matter of implementing the interface, not restructuring the app.
- The `GameStore` interface is the second most important. It ensures the move from in-memory to persistent storage is a backend concern, invisible to game logic.
- The Sync Layer abstraction ensures the move from polling to WebSockets is a transport concern, invisible to game logic.
- The prompt bank should lean toward questions that reveal personality and spark conversation, not trivia or knowledge-based questions. Examples: "What's a hobby you had as a kid that you'd love to pick up again?", "What's the most unusual thing on your desk right now?", "If you could swap jobs with anyone on this team for a day, who and why?"
