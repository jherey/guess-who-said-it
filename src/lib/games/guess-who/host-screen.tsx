"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/lib/hooks/use-countdown";
import type { GameView, Player, Reaction, RoundView } from "@/types";

export interface HostScreenProps {
  code: string;
  playerId: string;
  gameView: GameView;
  refetch: () => void;
}

/** Time between each card flip on the reveal cascade (ms). */
const REVEAL_INTERVAL_MS = 2500;

const REACTION_LABELS: Record<string, string> = {
  "knew-it": "Knew it!",
  "no-way": "No way!",
  legend: "Legend",
};

/**
 * Guess Who Said It — host/projected screen.
 *
 * The page-level dispatcher handles polling, error states, and resolves
 * the player identity. This component receives a current GameView and
 * dispatches by phase to the appropriate sub-screen.
 */
export function HostScreen({ code, playerId, gameView }: HostScreenProps) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (gameView.phase === "LOBBY") {
    return <LobbyBoard code={code} origin={origin} gameView={gameView} />;
  }

  if (gameView.phase === "SUBMITTING") {
    return <SubmittingBoard code={code} gameView={gameView} playerId={playerId} />;
  }

  if (gameView.phase === "GUESSING") {
    return <GuessingBoard code={code} gameView={gameView} playerId={playerId} />;
  }

  if (gameView.phase === "REVEAL") {
    return <RevealCascadeBoard code={code} gameView={gameView} />;
  }

  if (gameView.phase === "SCOREBOARD") {
    return <ScoreboardBoard code={code} gameView={gameView} playerId={playerId} />;
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <p className="text-muted-foreground">Phase: {gameView.phase}</p>
    </main>
  );
}

function LobbyBoard({
  code,
  origin,
  gameView,
}: {
  code: string;
  origin: string;
  gameView: GameView;
}) {
  const [isStarting, setIsStarting] = useState(false);
  const joinUrl = `${origin}/play/${code}`;

  async function handleStart() {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/game/${code}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch {
      setIsStarting(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-10">
      <div className="flex flex-col items-center gap-6">
        <h1 className="font-display text-3xl font-bold text-muted-foreground">
          Waiting for players...
        </h1>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Room Code
            </p>
            <p className="font-mono text-7xl font-bold tracking-[0.3em] text-primary">
              {code}
            </p>
          </div>

          {origin && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Scan to Join
              </p>
              <div className="bg-white p-3 rounded-xl">
                <QRCodeSVG value={joinUrl} size={140} />
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Join at{" "}
          <span className="font-mono text-foreground">
            {origin}/play/{code}
          </span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Players ({gameView.players.length}/10)
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {gameView.players.map((player) => (
            <div
              key={player.id}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border min-w-[100px]"
            >
              <span className="text-4xl">{player.avatar}</span>
              <span className="text-sm font-medium">{player.name}</span>
              {player.isHost && (
                <span className="text-xs text-primary font-display">Host</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {gameView.players.length >= 3 && (
        <Button
          onClick={handleStart}
          disabled={isStarting}
          className="h-14 px-10 text-xl font-display font-bold"
        >
          {isStarting ? "Starting..." : "Start Game"}
        </Button>
      )}
      {gameView.players.length < 3 && (
        <p className="text-sm text-muted-foreground">
          Need at least 3 players to start
        </p>
      )}
    </main>
  );
}

function SubmittingBoard({
  code,
  gameView,
  playerId,
}: {
  code: string;
  gameView: GameView;
  playerId: string;
}) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/game/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, answer: answer.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes("already submitted")
      ) {
        setSubmitted(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to submit");
      }
      setIsSubmitting(false);
    }
  }

  async function handleAdvance() {
    setIsAdvancing(true);
    try {
      await fetch(`/api/game/${code}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "advance-from-submitting" }),
      });
    } catch {
      setIsAdvancing(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-10">
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          The Prompt
        </p>
        <h1 className="font-display text-4xl font-bold text-center max-w-2xl leading-tight">
          {gameView.promptText}
        </h1>
      </div>

      {/* Host's own answer form */}
      {!submitted ? (
        <div className="flex flex-col gap-3 w-full max-w-md">
          <p className="text-sm text-muted-foreground text-center">
            Your answer (as host)
          </p>
          <textarea
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[100px] w-full rounded-lg border border-input bg-card px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !answer.trim()}
            className="h-12 text-lg font-display font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </Button>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      ) : (
        <p className="text-primary font-display font-semibold">
          ✓ Your answer is in!
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Answers Received
        </p>
        <p className="font-display text-6xl font-bold text-primary">
          {gameView.submissionCount}
          <span className="text-2xl text-muted-foreground">
            /{gameView.totalPlayers}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {gameView.players.map((player) => (
          <div
            key={player.id}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border"
          >
            <span className="text-xl">{player.avatar}</span>
            <span className="text-sm font-medium">{player.name}</span>
          </div>
        ))}
      </div>

      {gameView.submissionCount > 0 && submitted && (
        <Button
          variant="secondary"
          onClick={handleAdvance}
          disabled={isAdvancing}
          className="h-12 px-8 font-display font-semibold"
        >
          {isAdvancing ? "Advancing..." : "Skip Waiting & Start Guessing"}
        </Button>
      )}
    </main>
  );
}

function GuessingBoard({
  code,
  gameView,
  playerId,
}: {
  code: string;
  gameView: GameView;
  playerId: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [guessed, setGuessed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { seconds, isExpired, isPaused } = useCountdown(gameView.timer);

  const round = gameView.currentRound;

  // Reset local UI state when the round changes.
  const roundIndex = round?.index ?? -1;
  useEffect(() => {
    setSelectedId(null);
    setGuessed(false);
    setIsSubmitting(false);
  }, [roundIndex]);

  if (!round) return null;

  const isLastRound = round.index >= gameView.rounds.length - 1;
  const isAuthor = gameView.isCurrentRoundAuthor;
  const alreadyGuessed =
    guessed || round.guesses.some((g) => g.playerId === playerId);
  const eligibleGuessers = gameView.players.length - 1;
  const guessOptions = gameView.players.filter((p) => p.id !== playerId);

  async function sendControl(action: string, extra?: Record<string, unknown>) {
    await fetch(`/api/game/${code}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
  }

  async function handleGuess() {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/game/${code}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, guessedAuthorId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGuessed(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("already guessed") || msg.includes("author cannot guess")) {
        setGuessed(true);
      }
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      <p className="text-sm text-muted-foreground uppercase tracking-wider">
        Round {round.index + 1} of {gameView.rounds.length}
      </p>

      {/* Prompt + Anonymous answer */}
      <p className="text-sm text-muted-foreground text-center max-w-xl">
        {gameView.promptText}
      </p>
      <div className="flex flex-col items-center gap-3 max-w-2xl">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Who said this?
        </p>
        <blockquote className="font-display text-4xl font-bold text-center leading-tight">
          &ldquo;{round.answer}&rdquo;
        </blockquote>
      </div>

      {/* Countdown timer */}
      <div className="flex flex-col items-center gap-1">
        <p
          className={`font-mono text-6xl font-bold ${
            isExpired
              ? "text-destructive"
              : seconds <= 5
                ? "text-destructive animate-pulse"
                : "text-primary"
          }`}
        >
          {isPaused ? "⏸" : isExpired ? "0" : seconds}
        </p>
        {isPaused && (
          <p className="text-sm text-muted-foreground">Timer paused</p>
        )}
        {isExpired && (
          <p className="text-sm text-muted-foreground">Time&apos;s up!</p>
        )}
      </div>

      {/* Host's own guess (if not the author) */}
      {isAuthor ? (
        <p className="text-sm text-muted-foreground italic">
          This is your answer — sit back and watch them guess!
        </p>
      ) : alreadyGuessed ? (
        <p className="text-primary font-display font-semibold">
          ✓ Your guess is locked in!
        </p>
      ) : !isExpired ? (
        <div className="flex flex-col items-center gap-3 w-full max-w-lg">
          <p className="text-sm text-muted-foreground">Your guess (as host)</p>
          <div
            className={`grid gap-3 w-full ${
              guessOptions.length <= 2
                ? "grid-cols-2 max-w-xs mx-auto"
                : guessOptions.length <= 4
                  ? "grid-cols-2 max-w-sm mx-auto"
                  : guessOptions.length <= 6
                    ? "grid-cols-3"
                    : "grid-cols-4"
            }`}
          >
            {guessOptions.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedId(player.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selectedId === player.id
                    ? "border-primary bg-primary/10 scale-105"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                <span className="text-3xl">{player.avatar}</span>
                <span className="text-sm font-medium">{player.name}</span>
              </button>
            ))}
          </div>
          <Button
            onClick={handleGuess}
            disabled={!selectedId || isSubmitting}
            className="h-10 w-full max-w-xs font-display font-semibold"
          >
            {isSubmitting ? "Locking..." : "Lock In Guess"}
          </Button>
        </div>
      ) : null}

      {/* Guess count */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Guesses
        </p>
        <p className="font-display text-3xl font-bold text-primary">
          {round.guessCount}
          <span className="text-xl text-muted-foreground">
            /{eligibleGuessers}
          </span>
        </p>
      </div>

      {/* Host controls */}
      <div className="flex flex-wrap justify-center gap-3">
        {!isPaused && !isExpired && (
          <Button
            variant="secondary"
            onClick={() => sendControl("pause-timer")}
            className="font-display"
          >
            Pause
          </Button>
        )}
        {isPaused && (
          <Button
            variant="secondary"
            onClick={() => sendControl("resume-timer")}
            className="font-display"
          >
            Resume
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => sendControl("extend-timer", { seconds: 10 })}
          className="font-display"
        >
          +10s
        </Button>
        <Button
          onClick={() => sendControl("next-round")}
          className="font-display font-bold"
        >
          {isLastRound ? "Reveal All Answers" : "Next Round"}
        </Button>
      </div>
    </main>
  );
}

/**
 * Reveal cascade screen. After all rounds were guessed blind, the host
 * triggers this phase and the answers flip open one at a time, with the
 * scoreboard ticking up alongside. Reactions float across the whole screen.
 */
function RevealCascadeBoard({
  code,
  gameView,
}: {
  code: string;
  gameView: GameView;
}) {
  // Force a periodic re-render so the cascade timing advances smoothly.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const startedAt = gameView.revealStartedAt ?? now;
  const elapsed = Math.max(0, now - startedAt);
  // First card flips at t=0, second at t=interval, etc.
  const flippedCount = Math.min(
    gameView.rounds.length,
    Math.floor(elapsed / REVEAL_INTERVAL_MS) + 1
  );
  const allFlipped = flippedCount >= gameView.rounds.length;

  // Running scores derived from how many cards have flipped so far.
  const partialScores = useMemo(
    () => computePartialScores(gameView.rounds.slice(0, flippedCount)),
    [gameView.rounds, flippedCount]
  );

  async function handleContinue() {
    await fetch(`/api/game/${code}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "next-round" }),
    });
  }

  return (
    <main className="flex-1 flex flex-col items-center p-6 gap-6 relative overflow-hidden">
      <FloatingReactions
        reactions={gameView.reactions}
        players={gameView.players}
      />

      <motion.h1
        className="font-display text-4xl font-bold text-primary"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        The Reveal
      </motion.h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl flex-1">
        {/* Cards grid */}
        <div className="flex-1">
          <div
            className={`grid gap-4 ${
              gameView.rounds.length <= 4
                ? "grid-cols-1 sm:grid-cols-2"
                : gameView.rounds.length <= 6
                  ? "grid-cols-2 sm:grid-cols-3"
                  : gameView.rounds.length <= 8
                    ? "grid-cols-2 sm:grid-cols-4"
                    : "grid-cols-2 sm:grid-cols-5"
            }`}
          >
            {gameView.rounds.map((round, i) => {
              const flipped = i < flippedCount;
              const author = round.authorId
                ? gameView.players.find((p) => p.id === round.authorId)
                : null;
              return (
                <RevealCard
                  key={round.index}
                  round={round}
                  flipped={flipped}
                  author={author ?? null}
                  players={gameView.players}
                />
              );
            })}
          </div>
        </div>

        {/* Running scoreboard sidebar */}
        <aside className="lg:w-72 shrink-0">
          <div className="rounded-2xl bg-card border border-border p-4 sticky top-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 text-center">
              Running Scores
            </p>
            <div className="flex flex-col gap-2">
              {[...gameView.players]
                .map((p) => ({
                  player: p,
                  partial: partialScores.get(p.id) ?? 0,
                }))
                .sort((a, b) => b.partial - a.partial)
                .map(({ player, partial }) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-background"
                  >
                    <span className="text-lg">{player.avatar}</span>
                    <span className="flex-1 text-sm font-medium truncate">
                      {player.name}
                    </span>
                    <motion.span
                      key={partial}
                      initial={{ scale: 1.4, color: "var(--color-primary)" }}
                      animate={{ scale: 1, color: "var(--color-primary)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="font-display font-bold text-primary tabular-nums"
                    >
                      {partial}
                    </motion.span>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>

      <Button
        onClick={handleContinue}
        className="h-14 px-10 text-xl font-display font-bold"
      >
        {allFlipped ? "Show Final Scores" : "Skip to Final Scores"}
      </Button>
    </main>
  );
}

function RevealCard({
  round,
  flipped,
  author,
  players,
}: {
  round: RoundView;
  flipped: boolean;
  author: Player | null;
  players: Player[];
}) {
  const correctGuessers = flipped
    ? round.guesses
        .filter((g) => g.guessedAuthorId === round.authorId)
        .map((g) => players.find((p) => p.id === g.playerId))
        .filter((p): p is Player => Boolean(p))
    : [];

  return (
    <motion.div
      className="rounded-2xl bg-card border-2 p-4 flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        borderColor: flipped && author
          ? author.color
          : "var(--color-border)",
      }}
      transition={{ duration: 0.4 }}
    >
      <blockquote className="font-display text-base font-bold leading-snug min-h-[3.5rem]">
        &ldquo;{round.answer}&rdquo;
      </blockquote>

      <div className="border-t border-border pt-3">
        <AnimatePresence mode="wait">
          {flipped && author ? (
            <motion.div
              key="author"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="flex items-center gap-2"
            >
              <span className="text-3xl">{author.avatar}</span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Written by
                </span>
                <span className="font-display font-bold">{author.name}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <span className="text-3xl">❓</span>
              <span className="text-sm">Who said it?</span>
            </motion.div>
          )}
        </AnimatePresence>

        {flipped && correctGuessers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2 flex items-center gap-1.5 flex-wrap"
          >
            <span className="text-xs text-muted-foreground">Got it:</span>
            {correctGuessers.map((p) => (
              <span key={p.id} title={p.name} className="text-lg">
                {p.avatar}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function FloatingReactions({
  reactions,
  players,
}: {
  reactions: Reaction[];
  players: Player[];
}) {
  // Show only the most recent reactions, briefly. Each unique reaction
  // (by index in the array) lives ~3 seconds on screen.
  const REACTION_LIFETIME_MS = 3000;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const visible = reactions.filter(
    (r) => now - r.sentAt <= REACTION_LIFETIME_MS
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {visible.map((reaction) => {
          const player = players.find((p) => p.id === reaction.playerId);
          // Stable pseudo-random horizontal position based on sentAt.
          const left = ((reaction.sentAt * 9301 + 49297) % 233280) / 233280;
          return (
            <motion.div
              key={reaction.sentAt + ":" + reaction.playerId}
              initial={{ y: "100vh", opacity: 0, scale: 0.6 }}
              animate={{ y: "-10vh", opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: REACTION_LIFETIME_MS / 1000,
                ease: "easeOut",
              }}
              style={{ left: `${5 + left * 85}%` }}
              className="absolute bottom-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-card/95 backdrop-blur border border-border text-sm font-medium shadow-lg"
            >
              <span>{player?.avatar}</span>
              <span>{REACTION_LABELS[reaction.type] ?? reaction.type}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/** Sum +1 per correct guess to the guesser, +1 per wrong guess to the author. */
function computePartialScores(rounds: RoundView[]): Map<string, number> {
  const scores = new Map<string, number>();
  for (const round of rounds) {
    if (!round.authorId) continue;
    for (const guess of round.guesses) {
      if (guess.guessedAuthorId === round.authorId) {
        scores.set(guess.playerId, (scores.get(guess.playerId) ?? 0) + 1);
      } else {
        scores.set(round.authorId, (scores.get(round.authorId) ?? 0) + 1);
      }
    }
  }
  return scores;
}

function ScoreboardBoard({
  code,
  gameView,
  playerId,
}: {
  code: string;
  gameView: GameView;
  playerId: string;
}) {
  const ranked = [...gameView.players].sort((a, b) => b.score - a.score);
  const medals = ["🥇", "🥈", "🥉"];

  async function handlePlayAgain() {
    await fetch(`/api/game/${code}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "play-again" }),
    });
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-10">
      <motion.h1
        className="font-display text-5xl font-bold text-primary"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        Final Scores
      </motion.h1>

      {/* Leaderboard */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {ranked.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.04, y: -2 }}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-default ${
              player.id === playerId
                ? "bg-primary/10 border-primary"
                : i === 0
                  ? "bg-primary/5 border-primary/50"
                  : "bg-card border-border"
            }`}
          >
            <span className="text-2xl w-8 text-center">
              {medals[i] ?? `${i + 1}.`}
            </span>
            <span className="text-3xl">{player.avatar}</span>
            <span className="flex-1 font-display font-semibold text-lg">
              {player.name}
            </span>
            <span className="font-display text-2xl font-bold text-primary">
              {player.score}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Awards */}
      {gameView.awards.length > 0 && (
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-display text-2xl font-bold text-muted-foreground">
            Awards
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {gameView.awards.map((award, i) => {
              const player = gameView.players.find(
                (p) => p.id === award.playerId
              );
              return (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border min-w-[140px]"
                >
                  <span className="text-3xl">{player?.avatar}</span>
                  <span className="font-display font-bold text-sm text-primary">
                    {award.title}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {award.description}
                  </span>
                  <span className="text-xs font-medium">
                    {award.playerName}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Play Again */}
      <Button
        onClick={handlePlayAgain}
        className="h-14 px-10 text-xl font-display font-bold"
      >
        Play Again
      </Button>
    </main>
  );
}
