"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGamePolling } from "@/lib/hooks/use-game-polling";
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
