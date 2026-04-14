"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Code-entry input for visiting players. Used in the homepage's quiet
 * closing section. Players type their host's four-letter code and land on
 * the player phone screen.
 */
export function JoinBox() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) return;
    router.push(`/play/${trimmed}`);
  }

  const isReady = code.trim().length === 4;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleJoin();
      }}
      className="flex flex-col gap-3"
    >
      <label
        htmlFor="join-code"
        className="font-display text-xs uppercase tracking-[0.2em] parley-muted"
      >
        Room code
      </label>
      <input
        id="join-code"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={4}
        placeholder="X X X X"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="parley-input h-16 w-full border rounded-2xl px-5 text-center text-3xl font-mono tracking-[0.4em] uppercase transition-shadow"
        aria-describedby="join-help"
      />
      <button
        type="submit"
        disabled={!isReady}
        className="parley-accent-bg h-12 rounded-2xl font-display font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
      >
        Join the game
      </button>
      <p
        id="join-help"
        className="text-xs parley-faint text-center"
      >
        Four letters. The host can find theirs on the shared screen.
      </p>
    </form>
  );
}
