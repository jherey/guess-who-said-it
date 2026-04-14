"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGamePolling } from "@/lib/hooks/use-game-polling";
import { resolveDispatchState } from "@/lib/platform";
import { GAMES } from "@/lib/games/registry";

interface PlayerDispatcherProps {
  code: string;
}

export function PlayerDispatcher({ code }: PlayerDispatcherProps) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPlayerId(localStorage.getItem(`player-${code}`));
    setHydrated(true);
  }, [code]);

  // Wait for client hydration before deciding what to render so we don't flash
  // the join form to a player who already has a stored playerId.
  if (!hydrated) {
    return (
      <main
        className="flex-1 flex flex-col items-center justify-center p-8"
        aria-busy="true"
      >
        <p className="text-muted-foreground animate-pulse">Loading…</p>
      </main>
    );
  }

  if (!playerId) {
    return (
      <JoinForm
        code={code}
        onJoined={(id) => {
          localStorage.setItem(`player-${code}`, id);
          setPlayerId(id);
        }}
      />
    );
  }

  return <JoinedView code={code} playerId={playerId} />;
}

function JoinForm({
  code,
  onJoined,
}: {
  code: string;
  onJoined: (playerId: string) => void;
}) {
  const [playerName, setPlayerName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

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
      onJoined(data.playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
      setIsJoining(false);
    }
  }

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

function JoinedView({ code, playerId }: { code: string; playerId: string }) {
  const { gameView, error, refetch } = useGamePolling(code, playerId);

  const state = resolveDispatchState({
    gameView,
    error: error ?? null,
    registry: GAMES,
  });

  if (state.kind === "loading") {
    return (
      <main
        className="flex-1 flex flex-col items-center justify-center p-8"
        aria-busy="true"
      >
        <p className="text-muted-foreground animate-pulse">Connecting…</p>
      </main>
    );
  }

  if (state.kind === "error") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-destructive">{state.message}</p>
        <Link href="/" className="text-sm underline text-muted-foreground">
          Back to homepage
        </Link>
      </main>
    );
  }

  if (state.kind === "unknown-game") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-destructive">
          This game is no longer supported. Please reload.
        </p>
        <Link href="/" className="text-sm underline text-muted-foreground">
          Back to homepage
        </Link>
      </main>
    );
  }

  const { entry } = state;
  if (!entry.PlayerScreen) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-destructive">
          This game has no player screen registered.
        </p>
        <Link href="/" className="text-sm underline text-muted-foreground">
          Back to homepage
        </Link>
      </main>
    );
  }

  const PlayerScreen = entry.PlayerScreen;
  return (
    <div data-game={gameView!.gameKey}>
      <PlayerScreen
        code={code}
        playerId={playerId}
        gameView={gameView!}
        refetch={refetch}
      />
    </div>
  );
}
