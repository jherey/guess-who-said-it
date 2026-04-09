# Plan: Guess Who Said It

> Source PRD: .claude/prds/guess-who-said-it.md

## Architectural decisions

Durable decisions that apply across all phases:

- **Pages**: `/` (landing — create game), `/game/[code]` (game board / host projected screen), `/play/[code]` (player phone screen)
- **API routes**: `/api/game` (POST create), `/api/game/[code]` (GET state), `/api/game/[code]/join` (POST), `/api/game/[code]/submit` (POST), `/api/game/[code]/guess` (POST), `/api/game/[code]/react` (POST), `/api/game/[code]/control` (POST — host actions: start, pause, extend, advance, end)
- **Key models**: `Game` (room state, current phase, current round index), `Player` (id, name, avatar, color, score), `Round` (the anonymous answer being guessed, author id, guesses, reactions), `GameConfig` (timer duration, max players)
- **Core interfaces**: `GameType` (defines phases, scoring, valid actions per phase — each game mode implements this), `GameStore` (get/set game state — in-memory now, Redis/DB later), `SyncProvider` (how clients receive updates — polling now, WebSocket later)
- **State flow**: Server is source of truth. Clients poll `GET /api/game/[code]` every 1-2s. Response is phase-aware: during guessing, answers are returned without author info. Author is only included in the response after the host triggers reveal.
- **Game phases enum**: `LOBBY` → `SUBMITTING` → `GUESSING` → `REVEAL` → `SCOREBOARD` (repeats GUESSING → REVEAL for each answer, then final SCOREBOARD)
- **Prompt bank**: Static data file exporting an array of prompt objects with `id`, `text`, and `category` fields.
- **Development methodology**: TDD (red-green-refactor) with vertical slices. See testing strategy below.
- **CSS**: Tailwind CSS
- **Components**: shadcn/ui (Radix primitives, fully owned in-repo)
- **Animation**: Framer Motion (Motion)
- **Fonts**: Display — bold/playful game-show energy (chosen during scaffolding). Body — clean with character (chosen during scaffolding). Both from Google Fonts.
- **Color palette**: Dark-only theme (no light mode). Vibrant primary (warm coral/orange), contrasting accent, 10 distinct player colors that pop on dark backgrounds.
- **Project structure**:
  ```
  src/
    app/                    # Next.js App Router pages + API routes
    components/             # Shared UI components (shadcn/ui + custom)
    lib/
      engine/               # Game engine, GameType interface
      store/                # GameStore interface + in-memory impl
      sync/                 # Sync layer (polling impl)
      prompts/              # Prompt bank data
      timer/                # Timer & round controller
    types/                  # Shared TypeScript types
  ```

---

## Testing Strategy (TDD)

All feature code is built using **test-driven development** with the red-green-refactor loop in **vertical slices** — one test at a time, one behavior at a time. No horizontal slicing (writing all tests first, then all code).

### Modules that GET tests (via TDD)

| Module | What to test | Why |
|---|---|---|
| **Game Engine** | Phase transitions, valid/invalid actions per phase, game lifecycle | Core logic — most complex, highest risk |
| **Room Manager** | Room creation, player join/leave, code uniqueness, capacity limits, avatar assignment | Edge cases around player management |
| **Timer & Round Controller** | Countdown, pause/resume, extend, expiry triggers, manual advance | Timing logic is notoriously bug-prone |
| **Scoring** | Correct guess points, fooled-others points, award calculations | Must be mathematically correct |
| **GameStore (in-memory)** | Create, read, update game state through the interface | Validates the interface contract that future DB implementations must also satisfy |

### Modules that DO NOT get tests (explicitly skipped)

| Module | Why skipped |
|---|---|
| **UI components** (all React components, pages, layouts) | Manually tested during development. Component tests add friction and time we don't have before tomorrow. Add later. |
| **Prompt Bank** | Static data. No logic beyond "returns a prompt." Not worth a test. |
| **Sync Layer (polling)** | Thin HTTP wrapper. Exercised implicitly through integration tests of game flow via API routes. |
| **API routes** | Thin handlers that delegate to engine/store. Tested implicitly through game engine tests. |

### Testing principles (from TDD skill)

- Tests verify **behavior through public interfaces**, not implementation details
- Mock only at **system boundaries** (time, randomness) — never mock internal modules
- Design interfaces for testability: accept dependencies, return results, small surface area
- A test that breaks on refactor (without behavior change) is a bad test
- Refactor only when GREEN — never while RED

### Test tooling

- **Vitest** as the test runner (fast, native ESM, works well with Next.js)
- Tests colocated next to the module they test (e.g., `engine/engine.test.ts`)

---

## Phase 0: Project Scaffolding & Design System

**User stories**: None — this is infrastructure that all phases depend on.

### What to build

Initialize the Next.js project with App Router, TypeScript, Tailwind CSS, shadcn/ui, and Framer Motion. Set up the project directory structure with placeholder files for all major modules (engine, store, sync, prompts, timer, types). Define the core TypeScript interfaces (`GameType`, `GameStore`, `SyncProvider`, `Game`, `Player`, `Round`). Establish the design system: color palette as CSS/Tailwind variables, font pairing loaded from Google Fonts, spacing scale, component tokens (border radius, shadows), and player color/avatar pools. Create a base layout with the chosen fonts and dark theme applied.

### Acceptance criteria

- [ ] Next.js project initialized with App Router, TypeScript strict mode, Tailwind CSS
- [ ] shadcn/ui initialized with base components (Button, Input, Card, Dialog)
- [ ] Framer Motion installed
- [ ] Directory structure matches architectural decisions
- [ ] Core TypeScript interfaces defined: `GameType`, `GameStore`, `SyncProvider`, `Game`, `Player`, `Round`, `GamePhase`
- [ ] Tailwind config extended with custom color palette (CSS variables), font families, and player colors
- [ ] Google Fonts loaded in layout with display and body font pairing
- [ ] Dark-only theme layout renders correctly (no light theme — this is a game, not a dashboard)
- [ ] Player avatar and color pools defined (10 of each)
- [ ] Placeholder pages exist for all three routes (`/`, `/game/[code]`, `/play/[code]`)
- [ ] API route stubs exist for all endpoints
- [ ] `GameStore` in-memory implementation is functional (create/get/update game)
- [ ] Vitest installed and configured, `bun run test` works
- [ ] Test file structure established (colocated with modules)
- [ ] Project runs locally with `bun run dev`

---

## Phase 1: Room Creation & Join

**User stories**: 1, 2, 9, 10, 11, 25

### What to build

The end-to-end flow of creating a game and joining it. A host visits the landing page, clicks "Create Game," and is taken to the game board screen showing a 4-character room code and a QR code. A player on their phone navigates to the app, enters the room code (or scans the QR), types their name, and joins. The server assigns a random avatar and color from a predefined pool. The host's game board updates to show all connected players in the lobby. The player's phone shows a "Waiting for host to start" state with the list of who's joined.

This phase establishes the Game Engine core (phase management), Room Manager (create/join), GameStore (in-memory), Sync Layer (polling), and the foundational UI for both screens.

### Acceptance criteria

- [ ] Host can create a game room and is redirected to the game board screen
- [ ] Game board displays a 4-character alphanumeric room code and a scannable QR code
- [ ] Player can join by entering the room code and their name on the player screen
- [ ] Player is assigned a random avatar and color that are unique within the room
- [ ] Game board shows all joined players (avatar, color, name) in real time (within ~2s)
- [ ] Player phone shows lobby state with list of joined players
- [ ] Room rejects joins when 10 players are already in
- [ ] Room rejects joins with duplicate names
- [ ] Game Engine, GameStore interface, and Sync Layer (polling) are functional
- [ ] Tests: Room creation, player join, avatar assignment, capacity limits, phase transitions

---

## Phase 2: Prompt & Submission

**User stories**: 3, 4, 8, 12, 13, 14, 26

### What to build

The host clicks "Start Game" in the lobby, which transitions the game to the SUBMITTING phase. A prompt from the built-in prompt bank appears on all screens — the game board displays it prominently, and each player sees it on their phone with a text input field. Players type and submit their answer. The host's game board shows a live counter ("5/8 submitted"). The host is also a player — their phone view shows the same input. Once all players have submitted (or the host manually advances), the game transitions to the first guessing round.

This phase builds the Prompt Bank module and the submission flow through all layers.

### Acceptance criteria

- [ ] Host can start the game from the lobby, transitioning to SUBMITTING phase
- [ ] A random prompt from the bank (15-20 curated prompts) appears on all screens
- [ ] Each player (including the host on their phone) sees a text input to submit their answer
- [ ] Submitted answers are stored server-side, not visible to other players
- [ ] Game board shows live submission count updating in real time
- [ ] Player sees confirmation after submitting
- [ ] Player cannot submit more than once per round
- [ ] Game transitions to GUESSING once all players have submitted or host advances manually
- [ ] Tests: Prompt selection, answer submission, duplicate submission rejection, phase transition on all-submitted

---

## Phase 3: Guessing Round

**User stories**: 5, 15, 16, 27

### What to build

The game enters the GUESSING phase for the first anonymous answer. The game board displays the anonymous answer text prominently. Each player's phone shows the answer along with a grid of all other players' avatars — they tap to guess who wrote it. A countdown timer (15-20 seconds) is visible on all screens, driven by the server. The game board shows a live counter of how many players have guessed. Players cannot guess themselves as the author. When the timer expires or all players have guessed, the game holds in a "ready to reveal" state for the host to trigger.

This phase builds the Timer & Round Controller and the guessing interaction through all layers.

### Acceptance criteria

- [ ] One anonymous answer is displayed on the game board and all player screens
- [ ] Player screen shows a grid of other players' avatars to pick from (cannot pick self)
- [ ] Countdown timer (server-authoritative) is visible on all screens and counts down in sync
- [ ] Game board shows live guess count ("6/8 guessed")
- [ ] Player can submit one guess per round
- [ ] Round stops accepting guesses when timer expires
- [ ] Host can pause and extend the timer via controls
- [ ] Game waits for host to trigger reveal after guessing ends
- [ ] Tests: Guess submission, self-guess prevention, timer expiry, pause/extend behavior

---

## Phase 4: Reveal, Reactions & Scoring

**User stories**: 6, 7, 17, 18, 19, 20, 21, 28, 29

### What to build

The host triggers the reveal. The game board plays a reveal animation showing who actually wrote the answer — the author's avatar and name are highlighted. Scores are calculated: +1 for each player who guessed correctly, +1 to the author for each player they fooled. Updated scores are shown. Immediately after the reveal, each player's phone shows 3-4 reaction buttons ("Knew it!", "No way!", "Legend"). Tapping a reaction sends it to the server, and reaction bubbles pop up on the game board in real time. After a few seconds (or host advances), the game moves to the next anonymous answer and repeats the GUESSING → REVEAL cycle. Once all answers have been revealed, the game transitions to the SCOREBOARD phase.

### Acceptance criteria

- [ ] Host triggers reveal, transitioning from GUESSING to REVEAL phase
- [ ] Game board plays a reveal animation highlighting the author's avatar, name, and color
- [ ] Scores are calculated correctly: +1 per correct guess, +1 to author per player fooled
- [ ] Updated scores are visible on game board and player screens
- [ ] Player phones show 3-4 reaction buttons after reveal
- [ ] Reactions appear as bubbles/popups on the game board in real time
- [ ] Host can advance to the next answer's guessing round
- [ ] Cycle repeats (GUESSING → REVEAL) for each submitted answer
- [ ] After the last answer is revealed, game transitions to SCOREBOARD
- [ ] Host can pause/extend timer and manually advance at any point
- [ ] Tests: Score calculation (correct guess, fooled points), full round cycle, phase transitions through all answers

---

## Phase 5: Scoreboard, Awards & Polish

**User stories**: 22, 23, 24, 30

### What to build

The game board displays the final scoreboard — players ranked by total points with their avatars and colors. Below the leaderboard, fun awards are shown: "Most Mysterious" (author who fooled the most people across all rounds), "Detective" (most correct guesses), and 1-2 other contextual superlatives. The player phone shows their personal ranking and any awards they won.

This phase also covers visual polish across the entire app: game-show energy with playful colors, bold typography (distinctive, non-generic fonts), satisfying countdown animations that build tension, dramatic reveal animations, smooth transitions between phases, bouncy/poppy reaction bubbles, and responsive mobile optimization ensuring the player screen works well in portrait on phones. The design should feel like a party, not a productivity tool — colorful, energetic, memorable.

### Acceptance criteria

- [ ] Final scoreboard displays all players ranked by points with avatars and colors
- [ ] "Most Mysterious" award calculated and displayed (most total fooled-others points)
- [ ] "Detective" award calculated and displayed (most correct guesses)
- [ ] At least one additional fun award is shown
- [ ] Player phone shows personal rank and any awards won
- [ ] Host has an option to play again (new prompt) or end the session
- [ ] Countdown timer animation builds tension visually (color change, pulse, shake)
- [ ] Reveal animation is dramatic and satisfying (not just a text swap)
- [ ] Reaction bubbles are animated and feel alive on the game board
- [ ] Phase transitions have smooth animations
- [ ] Player screen is fully responsive and comfortable in portrait mode on phones
- [ ] Typography uses distinctive, non-generic fonts — no Inter/Roboto/Arial
- [ ] Color palette is bold and cohesive — no default purple gradients
- [ ] Overall aesthetic feels playful, colorful, and has game-show energy
- [ ] Tests: Award calculations, scoreboard ranking logic
