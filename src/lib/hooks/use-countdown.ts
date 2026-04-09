"use client";

import { useState, useEffect } from "react";
import type { TimerState } from "@/types";

/**
 * Client-side countdown display synced with server TimerState.
 * Ticks every 100ms for smooth visual updates.
 */
export function useCountdown(timer: TimerState | null) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!timer) {
      setRemainingMs(0);
      return;
    }

    if (timer.paused) {
      setRemainingMs(timer.remaining);
      return;
    }

    function tick() {
      const now = Date.now();
      const remaining = Math.max(0, timer!.endsAt - now);
      setRemainingMs(remaining);
    }

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [timer]);

  const seconds = Math.ceil(remainingMs / 1000);
  const isExpired = remainingMs <= 0 && timer !== null && !timer.paused;
  const isPaused = timer?.paused ?? false;

  return { remainingMs, seconds, isExpired, isPaused };
}
