import type { TimerState } from "@/types";

/**
 * Interface for managing countdown timers.
 * Server-authoritative — clients display a synced countdown.
 */
export interface TimerController {
  /** Start a new countdown for the given duration in seconds. */
  start(durationSeconds: number): TimerState;

  /** Pause the current timer, preserving remaining time. */
  pause(timer: TimerState): TimerState;

  /** Resume a paused timer. */
  resume(timer: TimerState): TimerState;

  /** Extend the timer by the given number of seconds. */
  extend(timer: TimerState, extraSeconds: number): TimerState;

  /** Check if the timer has expired. */
  isExpired(timer: TimerState): boolean;

  /** Get remaining milliseconds. */
  remaining(timer: TimerState): number;
}
