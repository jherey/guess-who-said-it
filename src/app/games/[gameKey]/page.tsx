import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameEntry } from "@/lib/games/registry";

interface PageProps {
  params: Promise<{ gameKey: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
  const { gameKey } = await params;
  const entry = getGameEntry(gameKey);
  if (!entry) {
    notFound();
  }

  const { meta } = entry;
  const isAvailable = meta.status === "available";
  const [minDuration, maxDuration] = meta.estimatedDurationMinutes;
  const durationLabel =
    minDuration === maxDuration
      ? `${minDuration} min`
      : `${minDuration}–${maxDuration} min`;
  const playerLabel = `${meta.minPlayers}–${meta.maxPlayers} players`;

  return (
    <main className="flex-1 px-6 py-10 sm:py-16 max-w-6xl mx-auto w-full pb-32 lg:pb-16">
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← All games
        </Link>
      </div>

      {/* Hero */}
      <header className="flex flex-col items-start gap-4 mb-12">
        <span
          className="text-6xl sm:text-7xl"
          role="img"
          aria-label={`${meta.name} icon`}
        >
          {meta.icon}
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          {meta.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">{meta.tagline}</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-10 lg:gap-12">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          <section aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="font-display text-sm uppercase tracking-wider text-muted-foreground mb-3"
            >
              About this game
            </h2>
            <p className="text-base leading-relaxed">{meta.description}</p>
          </section>

          <section
            aria-labelledby="rules-heading"
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h2
              id="rules-heading"
              className="font-display text-xl font-bold mb-4"
            >
              How to play
            </h2>
            <ol className="flex flex-col gap-3">
              {meta.rules.map((rule, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span
                    className="font-display font-bold text-primary shrink-0 w-6 text-right tabular-nums"
                    aria-hidden="true"
                  >
                    {i + 1}.
                  </span>
                  <span className="text-sm leading-relaxed">{rule}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Sidebar — sticky on desktop */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div
            className="rounded-2xl border-2 border-border bg-card p-6 flex flex-col gap-5"
            style={{ borderColor: meta.accentColor }}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Players
              </span>
              <span className="font-display text-2xl font-bold">
                {playerLabel}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Duration
              </span>
              <span className="font-display text-2xl font-bold">
                {durationLabel}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Best for
              </span>
              <span className="text-sm">Retros, kickoffs, all-hands</span>
            </div>

            {isAvailable ? (
              <Link
                href={`/games/${gameKey}/new`}
                className="hidden lg:inline-flex items-center justify-center h-12 rounded-lg bg-primary text-primary-foreground font-display font-bold text-base hover:opacity-90 transition-opacity"
              >
                Start a Game
              </Link>
            ) : (
              <div className="hidden lg:flex flex-col gap-1 items-center px-4 py-3 rounded-lg border border-border text-center">
                <span className="font-display font-bold text-muted-foreground">
                  Coming Soon
                </span>
                <span className="text-xs text-muted-foreground">
                  Not available yet
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile sticky CTA */}
      {isAvailable ? (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/95 backdrop-blur border-t border-border p-4">
          <Link
            href={`/games/${gameKey}/new`}
            className="flex items-center justify-center h-12 rounded-lg bg-primary text-primary-foreground font-display font-bold text-base"
          >
            Start a Game
          </Link>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/95 backdrop-blur border-t border-border p-4">
          <div className="flex items-center justify-center h-12 rounded-lg border border-border text-muted-foreground font-display font-bold">
            Coming Soon
          </div>
        </div>
      )}
    </main>
  );
}
