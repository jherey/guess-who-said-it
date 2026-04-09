"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGamePolling } from "@/lib/hooks/use-game-polling";
import { useCountdown } from "@/lib/hooks/use-countdown";
import type { GameView } from "@/types";

interface PlayerScreenClientProps {
  code: string;
}

export function PlayerScreenClient({ code }: PlayerScreenClientProps) {
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem(`player-${code}`);
    if (storedId) {
      setPlayerId(storedId);
      setJoined(true);
    }
  }, [code]);

  async function handleJoin() {
    if (!playerName.trim()) {
      setError("Enter your name");
      return;
    }
    setIsJoining(true);
    setError("");
    try {
      const res = await fetch(`/api/game/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(`player-${code}`, data.playerId);
      setPlayerId(data.playerId);
      setJoined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
      setIsJoining(false);
    }
  }

  if (!joined) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Joining Room
          </p>
          <p className="font-mono text-4xl font-bold tracking-[0.3em] text-primary mt-2">
            {code}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Input
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            className="h-12 text-center text-lg"
            autoFocus
          />
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="h-12 text-lg font-display font-semibold"
          >
            {isJoining ? "Joining..." : "Join Game"}
          </Button>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>
      </main>
    );
  }

  return <PlayerGameView code={code} playerId={playerId} />;
}

function PlayerGameView({
  code,
  playerId,
}: {
  code: string;
  playerId: string;
}) {
  const { gameView, error } = useGamePolling(code, playerId);

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-destructive">{error}</p>
      </main>
    );
  }

  if (!gameView) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </main>
    );
  }

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

  if (isAuthor) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        {me && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{me.avatar}</span>
            <span className="font-display font-semibold">{me.name}</span>
          </div>
        )}
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
          Guess Locked In!
        </h2>
        <p className="text-muted-foreground text-sm">
          Waiting for everyone else...
        </p>
        <p className="text-sm text-muted-foreground">
          {round.guessCount}/{gameView.players.length - 1} guessed
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

      {/* Player identity */}
      {me && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{me.avatar}</span>
          <span className="font-display font-semibold">{me.name}</span>
        </div>
      )}

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
          Time&apos;s up! Waiting for reveal...
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
  const [reacted, setReacted] = useState(false);
  const round = gameView.currentRound;
  if (!round) return null;

  const author = gameView.players.find((p) => p.id === round.authorId);
  const me = gameView.players.find((p) => p.id === playerId);
  const myGuess = round.guesses.find((g) => g.playerId === playerId);
  const guessedCorrectly = myGuess?.guessedAuthorId === round.authorId;

  const reactions: { type: "knew-it" | "no-way" | "legend"; label: string }[] = [
    { type: "knew-it", label: "Knew it!" },
    { type: "no-way", label: "No way!" },
    { type: "legend", label: "Legend" },
  ];

  async function handleReaction(type: string) {
    setReacted(true);
    try {
      await fetch(`/api/game/${code}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, type }),
      });
    } catch {
      // Reaction is best-effort
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      {/* Answer + Author */}
      <blockquote className="font-display text-xl font-bold text-center max-w-sm leading-tight">
        &ldquo;{round.answer}&rdquo;
      </blockquote>

      {author && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Written by</p>
          <div className="flex flex-col items-center gap-1 p-4 rounded-xl bg-card border-2 border-primary">
            <span className="text-5xl">{author.avatar}</span>
            <span className="font-display text-lg font-bold">{author.name}</span>
          </div>
        </div>
      )}

      {/* Your guess result */}
      {myGuess && (
        <p
          className={`font-display font-semibold ${
            guessedCorrectly ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {guessedCorrectly ? "You guessed right! +1" : "You got fooled!"}
        </p>
      )}

      {/* Reaction buttons */}
      {!reacted ? (
        <div className="flex gap-3">
          {reactions.map((r) => (
            <Button
              key={r.type}
              variant="secondary"
              onClick={() => handleReaction(r.type)}
              className="font-display text-lg px-5 py-3"
            >
              {r.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Reaction sent!</p>
      )}

      {/* Your score */}
      {me && (
        <div className="flex items-center gap-2">
          <span className="text-2xl">{me.avatar}</span>
          <span className="font-display font-semibold">Score: {me.score}</span>
        </div>
      )}

      <p className="text-sm text-muted-foreground animate-pulse">
        Waiting for host...
      </p>
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
          <div
            key={player.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
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
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground animate-pulse">
        Waiting for host...
      </p>
    </main>
  );
}
