"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGamePolling } from "@/lib/hooks/use-game-polling";
import { resolveDispatchState } from "@/lib/platform";
import { GAMES } from "@/lib/games/registry";

interface HostDispatcherProps {
  code: string;
}

export function HostDispatcher({ code }: HostDispatcherProps) {
  const [playerId, setPlayerId] = useState("");
  useEffect(() => {
    setPlayerId(localStorage.getItem(`player-${code}`) ?? "");
  }, [code]);

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
        aria-label="Connecting to game"
      >
        <p className="text-muted-foreground text-lg animate-pulse">
          Connecting…
        </p>
      </main>
    );
  }

  if (state.kind === "error") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-destructive text-lg">{state.message}</p>
        <Link href="/" className="text-sm underline text-muted-foreground">
          Back to homepage
        </Link>
      </main>
    );
  }

  if (state.kind === "unknown-game") {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-destructive text-lg">
          This game is no longer supported. Please reload.
        </p>
        <Link href="/" className="text-sm underline text-muted-foreground">
          Back to homepage
        </Link>
      </main>
    );
  }

  const { entry } = state;
  if (!entry.HostScreen) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-destructive text-lg">
          This game has no host screen registered.
        </p>
        <Link href="/" className="text-sm underline text-muted-foreground">
          Back to homepage
        </Link>
      </main>
    );
  }

  const HostScreen = entry.HostScreen;
  return (
    <div data-game={gameView!.gameKey}>
      <HostScreen
        code={code}
        playerId={playerId}
        gameView={gameView!}
        refetch={refetch}
      />
    </div>
  );
}
