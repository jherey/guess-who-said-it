import { GAMES } from "@/lib/games/registry";
import { HeroSection } from "./hero-section";
import { ValuePropsStrip } from "./value-props-strip";
import { CatalogSection } from "./catalog-section";
import { HowItWorksSection } from "./how-it-works-section";
import { JoinSection } from "./join-section";

export default function Home() {
  const allGames = Object.entries(GAMES);
  const catalogGames = [
    ...allGames.filter(([, e]) => e.meta.status === "available"),
    ...allGames.filter(([, e]) => e.meta.status === "coming-soon"),
  ].map(([key, entry]) => ({ key, meta: entry.meta }));

  return (
    <div className="parley-home min-h-screen">
      <HeroSection />
      <ValuePropsStrip />
      <CatalogSection games={catalogGames} />
      <HowItWorksSection />
      <JoinSection />

      <footer className="border-t parley-border">
        <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm parley-muted">
          <span className="font-display font-semibold text-base">
            Parley<span className="parley-accent">.</span>
          </span>
          <span>
            A small platform of games. Built for the team you already have.
          </span>
        </div>
      </footer>
    </div>
  );
}
