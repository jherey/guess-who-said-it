import type { TimerState } from "@/types";

/**
 * Pure functions for managing countdown timers.
 * Time is injected as `now` parameter — no side effects, fully testable.
 * Server-authoritative: clients display synced countdown from TimerState.
 */
export class GameTimer {
  static start(durationSeconds: number, now: number): TimerState {
    return {
      endsAt: now + durationSeconds * 1000,
      paused: false,
      remaining: durationSeconds * 1000,
    };
  }

  static remaining(timer: TimerState, now: number): number {
    if (timer.paused) return timer.remaining;
    return Math.max(0, timer.endsAt - now);
  }

  static isExpired(timer: TimerState, now: number): boolean {
    if (timer.paused) return false;
    return now >= timer.endsAt;
  }

  static pause(timer: TimerState, now: number): TimerState {
    return {
      endsAt: timer.endsAt,
      paused: true,
      remaining: Math.max(0, timer.endsAt - now),
    };
  }

  static resume(timer: TimerState, now: number): TimerState {
    return {
      endsAt: now + timer.remaining,
      paused: false,
      remaining: timer.remaining,
    };
  }

  static extend(timer: TimerState, extraSeconds: number, now: number): TimerState {
    const extraMs = extraSeconds * 1000;
    if (timer.paused) {
      return {
        ...timer,
        remaining: timer.remaining + extraMs,
      };
    }
    // If expired, extend from now so the full extra time is usable
    const base = timer.endsAt < now ? now : timer.endsAt;
    return {
      ...timer,
      endsAt: base + extraMs,
      paused: false,
    };
  }
}
