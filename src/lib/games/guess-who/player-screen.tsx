"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/lib/hooks/use-countdown";
import type { GameView, ReactionType } from "@/types";

export interface PlayerScreenProps {
  code: string;
  playerId: string;
  gameView: GameView;
  refetch: () => void;
}

/**
 * Guess Who Said It — phone-first player UI.
 *
 * The page-level dispatcher handles polling, error states, and the join
 * flow. This component receives a current GameView and dispatches by phase
 * to the appropriate sub-screen.
 */
export function PlayerScreen({ code, playerId, gameView }: PlayerScreenProps) {
  if (gameView.phase === "LOBBY") {
    return <PlayerLobby gameView={gameView} playerId={playerId} />;
  }

  if (gameView.phase === "SUBMITTING") {
    return (
      <PlayerSubmitting code={code} gameView={gameView} playerId={playerId} />
    );
  }

  if (gameView.phase === "GUESSING") {
    return (
      <PlayerGuessing code={code} gameView={gameView} playerId={playerId} />
    );
  }

  if (gameView.phase === "REVEAL") {
    return (
      <PlayerReveal code={code} gameView={gameView} playerId={playerId} />
    );
  }

  if (gameView.phase === "SCOREBOARD") {
    return <PlayerScoreboard gameView={gameView} playerId={playerId} />;
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <p className="text-muted-foreground">Phase: {gameView.phase}</p>
    </main>
  );
}

function PlayerLobby({
  gameView,
  playerId,
}: {
  gameView: GameView;
  playerId: string;
}) {
  const me = gameView.players.find((p) => p.id === playerId);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
      {me && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-6xl">{me.avatar}</span>
          <span className="font-display text-xl font-semibold">{me.name}</span>
          <span className="text-sm text-muted-foreground">You&apos;re in!</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Players in lobby ({gameView.players.length})
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {gameView.players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border ${
                player.id === playerId ? "ring-2 ring-primary" : ""
              }`}
            >
              <span className="text-xl">{player.avatar}</span>
              <span className="text-sm font-medium">{player.name}</span>
              {player.isHost && (
                <span className="text-xs font-display font-semibold text-primary bg-primary/15 px-1.5 py-0.5 rounded">
                  Host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-sm animate-pulse">
        Waiting for host to start the game...
      </p>
    </main>
  );
}

function PlayerSubmitting({
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
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!answer.trim()) {
      setError("Write something!");
      return;
    }
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

  const me = gameView.players.find((p) => p.id === playerId);

  if (submitted) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">✓</span>
          <h2 className="font-display text-2xl font-bold text-primary">
            Answer Submitted!
          </h2>
          <p className="text-muted-foreground text-sm">
            Waiting for everyone else...
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {gameView.submissionCount}/{gameView.totalPlayers} answered
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
      {me && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{me.avatar}</span>
          <span className="font-display font-semibold">{me.name}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          The Prompt
        </p>
        <h1 className="font-display text-2xl font-bold text-center max-w-sm leading-tight">
          {gameView.promptText}
        </h1>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <textarea
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[120px] w-full rounded-lg border border-input bg-card px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
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
    </main>
  );
}

function PlayerGuessing({
  code,
  gameView,
  playerId,
}: {
  code: string;
  gameView: GameView;
  playerId: string;
}) {
  const [guessed, setGuessed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { seconds, isExpired, isPaused } = useCountdown(gameView.timer);

  const round = gameView.currentRound;
  const roundIndex = round?.index ?? -1;

  // Reset local UI state when the round changes so each round is a fresh slate.
  useEffect(() => {
    setGuessed(false);
    setSelectedId(null);
    setIsSubmitting(false);
    setError("");
  }, [roundIndex]);

  if (!round) return null;

  const alreadyGuessed =
    guessed || round.guesses.some((g) => g.playerId === playerId);

  const isAuthor = gameView.isCurrentRoundAuthor;
  const guessOptions = gameView.players.filter((p) => p.id !== playerId);

  async function handleGuess() {
    if (!selectedId) return;
    setIsSubmitting(true);
    setError("");
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
      const msg = err instanceof Error ? err.message : "Failed to guess";
      if (msg.includes("already guessed") || msg.includes("author cannot guess")) {
        setGuessed(true);
      } else {
        setError(msg);
      }
      setIsSubmitting(false);
    }
  }

  const me = gameView.players.find((p) => p.id === playerId);
  const totalRounds = gameView.rounds.length;

  if (isAuthor) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        {me && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{me.avatar}</span>
            <span className="font-display font-semibold">{me.name}</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Round {round.index + 1} of {totalRounds}
        </p>
        <p
          className={`font-mono text-4xl font-bold ${
            isExpired
              ? "text-destructive"
              : seconds <= 5
                ? "text-destructive animate-pulse"
                : "text-primary"
          }`}
        >
          {isPaused ? "⏸" : isExpired ? "0" : seconds}
        </p>
        <blockquote className="font-display text-xl font-bold text-center max-w-sm leading-tight">
          &ldquo;{round.answer}&rdquo;
        </blockquote>
        <p className="text-sm text-muted-foreground italic">
          This is your answer — watch them guess!
        </p>
        <p className="text-sm text-muted-foreground">
          {round.guessCount}/{gameView.players.length - 1} guessed
        </p>
      </main>
    );
  }

  if (alreadyGuessed) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        {me && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{me.avatar}</span>
            <span className="font-display font-semibold">{me.name}</span>
          </div>
        )}
        <span className="text-5xl">✓</span>
        <h2 className="font-display text-2xl font-bold text-primary">
          Guess Locked In
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-xs">
          All answers stay anonymous until the end. Sit tight for the next
          one.
        </p>
        <p className="text-xs text-muted-foreground">
          Round {round.index + 1} of {totalRounds} · {round.guessCount}/
          {gameView.players.length - 1} guessed
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      {/* Timer */}
      <p
        className={`font-mono text-4xl font-bold ${
          isExpired
            ? "text-destructive"
            : seconds <= 5
              ? "text-destructive animate-pulse"
              : "text-primary"
        }`}
      >
        {isPaused ? "⏸" : isExpired ? "0" : seconds}
      </p>

      {/* Player identity + round counter */}
      {me && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{me.avatar}</span>
          <span className="font-display font-semibold">{me.name}</span>
        </div>
      )}
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        Round {round.index + 1} of {totalRounds}
      </p>

      {/* Prompt + anonymous answer */}
      <p className="text-xs text-muted-foreground text-center max-w-sm">
        {gameView.promptText}
      </p>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wider">
          Who said this?
        </p>
        <blockquote className="font-display text-xl font-bold text-center leading-tight max-w-sm">
          &ldquo;{round.answer}&rdquo;
        </blockquote>
      </div>

      {/* Avatar grid */}
      {!isExpired ? (
        <>
          <div
            className={`grid gap-3 w-full ${
              guessOptions.length <= 2
                ? "grid-cols-2 max-w-xs mx-auto"
                : guessOptions.length <= 4
                  ? "grid-cols-2 max-w-sm mx-auto"
                  : guessOptions.length <= 6
                    ? "grid-cols-3 max-w-sm mx-auto"
                    : "grid-cols-3 max-w-md mx-auto"
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
            className="h-12 w-full max-w-sm text-lg font-display font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Lock In Guess"}
          </Button>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          Time&apos;s up! Waiting for the next round...
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </main>
  );
}

function PlayerReveal({
  code,
  gameView,
  playerId,
}: {
  code: string;
  gameView: GameView;
  playerId: string;
}) {
  const me = gameView.players.find((p) => p.id === playerId);

  const reactions: { type: ReactionType; label: string; emoji: string }[] = [
    { type: "knew-it", label: "Knew it!", emoji: "🎯" },
    { type: "no-way", label: "No way!", emoji: "😱" },
    { type: "legend", label: "Legend", emoji: "🔥" },
  ];

  // How many of MY reactions the server has acked, so the count "Sent: N"
  // reflects what's actually recorded.
  const myReactionCount = gameView.reactions.filter(
    (r) => r.playerId === playerId
  ).length;

  async function sendReaction(type: ReactionType) {
    try {
      await fetch(`/api/game/${code}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, type }),
      });
    } catch {
      // Best effort — reactions are non-critical.
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      <motion.h1
        className="font-display text-3xl font-bold text-primary"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        The Reveal!
      </motion.h1>

      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Watch the host screen — answers are flipping open one by one. Tap to
        react however you like.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {reactions.map((r, i) => (
          <motion.div
            key={r.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button
              variant="secondary"
              onClick={() => sendReaction(r.type)}
              className="w-full h-14 text-lg font-display font-semibold flex items-center justify-center gap-2"
            >
              <span className="text-2xl">{r.emoji}</span>
              {r.label}
            </Button>
          </motion.div>
        ))}
      </div>

      {myReactionCount > 0 && (
        <p className="text-xs text-muted-foreground">
          You sent {myReactionCount} reaction{myReactionCount !== 1 ? "s" : ""}
        </p>
      )}

      {me && (
        <div className="flex items-center gap-2 pt-4 border-t border-border w-full max-w-xs justify-center">
          <span className="text-2xl">{me.avatar}</span>
          <span className="font-display font-semibold">{me.name}</span>
        </div>
      )}
    </main>
  );
}

function PlayerScoreboard({
  gameView,
  playerId,
}: {
  gameView: GameView;
  playerId: string;
}) {
  const ranked = [...gameView.players].sort((a, b) => b.score - a.score);
  const myRank = ranked.findIndex((p) => p.id === playerId) + 1;
  const me = gameView.players.find((p) => p.id === playerId);
  const myAwards = gameView.awards.filter((a) => a.playerId === playerId);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="font-display text-3xl font-bold text-primary">
        Game Over!
      </h1>

      {/* Personal result */}
      {me && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">{me.avatar}</span>
          <span className="font-display text-xl font-bold">{me.name}</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{medals[myRank - 1] ?? ""}</span>
            <span className="font-display text-lg text-muted-foreground">
              #{myRank} of {ranked.length}
            </span>
            <span className="font-display text-2xl font-bold text-primary">
              {me.score} pts
            </span>
          </div>
        </div>
      )}

      {/* Awards won */}
      {myAwards.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          {myAwards.map((award, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-full bg-primary/10 border border-primary"
            >
              <span className="font-display font-bold text-primary text-sm">
                {award.title}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {award.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {ranked.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.04, y: -2 }}
            transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-default ${
              player.id === playerId
                ? "bg-primary/10 border border-primary"
                : "bg-card border border-border"
            }`}
          >
            <span className="w-6 text-center text-sm">
              {medals[i] ?? `${i + 1}.`}
            </span>
            <span className="text-xl">{player.avatar}</span>
            <span className="flex-1 text-sm font-medium">{player.name}</span>
            <span className="font-display font-bold text-primary">
              {player.score}
            </span>
          </motion.div>
        ))}
      </div>

      {/* All awards */}
      {gameView.awards.length > 0 && (
        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <h2 className="font-display text-lg font-bold text-muted-foreground">
            Awards
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {gameView.awards.map((award, i) => {
              const player = gameView.players.find(
                (p) => p.id === award.playerId
              );
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border min-w-[110px]"
                >
                  <span className="text-2xl">{player?.avatar}</span>
                  <span className="font-display font-bold text-xs text-primary">
                    {award.title}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {award.description}
                  </span>
                  <span className="text-xs font-medium">
                    {award.playerName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground animate-pulse">
        Waiting for host...
      </p>
    </main>
  );
}
