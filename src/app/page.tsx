"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [joinCode, setJoinCode] = useState("");
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
        body: JSON.stringify({ hostName: hostName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem(`player-${data.code}`, data.playerId);
      router.push(`/game/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
      setIsCreating(false);
    }
  }

  function handleJoin() {
    if (!joinCode.trim()) return;
    router.push(`/play/${joinCode.trim().toUpperCase()}`);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 gap-12">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold tracking-tight text-primary">
          Guess Who
          <br />
          Said It
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">
          The icebreaker game that actually breaks the ice
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Your name"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="h-12 text-center text-lg"
          />
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="h-12 text-lg font-display font-semibold"
          >
            {isCreating ? "Creating..." : "Create Game"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">or join a game</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Room code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            maxLength={4}
            className="h-12 text-center text-lg font-mono tracking-widest"
          />
          <Button
            onClick={handleJoin}
            disabled={joinCode.length < 4}
            className="h-12 px-6 font-display font-semibold"
          >
            Join
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>

      {/* How to Play */}
      <div className="w-full max-w-lg">
        <h2 className="font-display text-2xl font-bold text-center mb-6">
          How to Play
        </h2>
        <div className="flex flex-col gap-4">
          {[
            {
              step: "1",
              title: "Create & Join",
              desc: "The host creates a game and shares the room code or QR. Everyone joins on their phone.",
            },
            {
              step: "2",
              title: "Answer the Prompt",
              desc: "A fun question appears. Everyone types their answer anonymously.",
            },
            {
              step: "3",
              title: "Guess Who",
              desc: "Answers are revealed one at a time. Guess which teammate wrote each one before time runs out!",
            },
            {
              step: "4",
              title: "Score & React",
              desc: "+1 for a correct guess. +1 to the author for every person they fooled. React with \"Knew it!\", \"No way!\", or \"Legend\".",
            },
            {
              step: "5",
              title: "Celebrate",
              desc: "See the final leaderboard and fun awards like Most Mysterious and Detective.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <span className="font-display text-2xl font-bold text-primary w-8 shrink-0 text-center">
                {item.step}
              </span>
              <div>
                <p className="font-display font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
