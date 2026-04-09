"use client";

import { useState, useEffect, useCallback } from "react";
import type { GameView } from "@/types";

export function useGamePolling(code: string, playerId: string, intervalMs = 1500) {
  const [gameView, setGameView] = useState<GameView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/${code}?playerId=${playerId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch game");
      }
      const data = await res.json();
      setGameView(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection lost");
    }
  }, [code, playerId]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [poll, intervalMs]);

  return { gameView, error, refetch: poll };
}
