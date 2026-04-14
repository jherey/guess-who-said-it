"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HostSetupFormProps {
  gameKey: string;
  gameName: string;
  icon: string;
}

export function HostSetupForm({ gameKey, gameName, icon }: HostSetupFormProps) {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!hostName.trim()) {
      setError("Enter your name first");
      return;
    }
    setIsCreating(true);
    setError("");
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: hostName.trim(), gameKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(`player-${data.code}`, data.playerId);
      router.push(`/host/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
      setIsCreating(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Contextual header */}
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            ← Pick a different game
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-3xl" role="img" aria-label={`${gameName} icon`}>
              {icon}
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Starting
              </span>
              <span className="font-display font-bold text-lg">{gameName}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
          <label htmlFor="host-name" className="font-display font-semibold">
            Your name
          </label>
          <Input
            id="host-name"
            placeholder="e.g. Jeremiah"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-12 text-center text-lg"
            autoFocus
            aria-describedby={error ? "host-name-error" : undefined}
          />
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="h-12 text-lg font-display font-bold"
          >
            {isCreating ? "Creating..." : "Create Room"}
          </Button>
          {error && (
            <p
              id="host-name-error"
              className="text-sm text-destructive text-center"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
