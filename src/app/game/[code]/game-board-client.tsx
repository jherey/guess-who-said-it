"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useGamePolling } from "@/lib/hooks/use-game-polling";
import type { GameView } from "@/types";

interface GameBoardClientProps {
  code: string;
}

export function GameBoardClient({ code }: GameBoardClientProps) {
  const [playerId, setPlayerId] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setPlayerId(localStorage.getItem(`player-${code}`) ?? "");
    setOrigin(window.location.origin);
  }, [code]);

  const { gameView, error } = useGamePolling(code, playerId);

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-destructive text-lg">{error}</p>
      </main>
    );
  }

  if (!gameView) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground text-lg animate-pulse">
          Loading...
        </p>
      </main>
    );
  }

  if (gameView.phase === "LOBBY") {
    return <LobbyBoard code={code} origin={origin} gameView={gameView} />;
  }

  if (gameView.phase === "SUBMITTING") {
    return <SubmittingBoard code={code} gameView={gameView} playerId={playerId} />;
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

      {gameView.players.length >= 2 && (
        <Button
          onClick={handleStart}
          disabled={isStarting}
          className="h-14 px-10 text-xl font-display font-bold"
        >
          {isStarting ? "Starting..." : "Start Game"}
        </Button>
      )}
      {gameView.players.length < 2 && (
        <p className="text-sm text-muted-foreground">
          Need at least 2 players to start
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
