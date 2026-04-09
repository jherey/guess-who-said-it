import { describe, it, expect } from "vitest";
import { GameTimer } from "./game-timer";

describe("GameTimer", () => {
  it("starts a timer with correct endsAt", () => {
    const now = 1000000;
    const timer = GameTimer.start(20, now);

    expect(timer.endsAt).toBe(1000000 + 20 * 1000);
    expect(timer.paused).toBe(false);
    expect(timer.remaining).toBe(20 * 1000);
  });

  it("reports remaining time correctly", () => {
    const now = 1000000;
    const timer = GameTimer.start(20, now);

    expect(GameTimer.remaining(timer, now + 5000)).toBe(15000);
    expect(GameTimer.remaining(timer, now + 20000)).toBe(0);
    expect(GameTimer.remaining(timer, now + 25000)).toBe(0);
  });

  it("detects expiry", () => {
    const now = 1000000;
    const timer = GameTimer.start(20, now);

    expect(GameTimer.isExpired(timer, now + 10000)).toBe(false);
    expect(GameTimer.isExpired(timer, now + 20000)).toBe(true);
    expect(GameTimer.isExpired(timer, now + 30000)).toBe(true);
  });

  it("pauses and preserves remaining time", () => {
    const now = 1000000;
    const timer = GameTimer.start(20, now);
    const paused = GameTimer.pause(timer, now + 5000);

    expect(paused.paused).toBe(true);
    expect(paused.remaining).toBe(15000);
    // Paused timer never expires regardless of time passing
    expect(GameTimer.isExpired(paused, now + 100000)).toBe(false);
  });

  it("resumes from paused state", () => {
    const now = 1000000;
    const timer = GameTimer.start(20, now);
    const paused = GameTimer.pause(timer, now + 5000);
    const resumed = GameTimer.resume(paused, now + 10000);

    expect(resumed.paused).toBe(false);
    // 15s remaining, resumed at now+10000, so expires at now+25000
    expect(resumed.endsAt).toBe(now + 10000 + 15000);
    expect(GameTimer.remaining(resumed, now + 10000)).toBe(15000);
  });

  it("extends the timer by additional seconds", () => {
    const now = 1000000;
    const timer = GameTimer.start(20, now);
    const extended = GameTimer.extend(timer, 10, now + 5000);

    expect(extended.endsAt).toBe(timer.endsAt + 10000);
    expect(GameTimer.remaining(extended, now + 5000)).toBe(25000);
  });

  it("extends a paused timer", () => {
    const now = 1000000;
    const timer = GameTimer.start(20, now);
    const paused = GameTimer.pause(timer, now + 5000);
    const extended = GameTimer.extend(paused, 10, now + 8000);

    expect(extended.paused).toBe(true);
    expect(extended.remaining).toBe(25000); // 15s remaining + 10s extension
  });

  it("extends an expired timer from now, giving the full extra time", () => {
    const now = 1000000;
    const timer = GameTimer.start(20, now);
    // Timer expired 5s ago
    const extendTime = now + 25000;
    const extended = GameTimer.extend(timer, 10, extendTime);

    expect(extended.endsAt).toBe(extendTime + 10000);
    expect(GameTimer.remaining(extended, extendTime)).toBe(10000);
    expect(GameTimer.isExpired(extended, extendTime)).toBe(false);
  });
});
