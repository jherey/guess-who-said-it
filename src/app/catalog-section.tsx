"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { GameMeta } from "@/types"

interface CatalogSectionProps {
  games: Array<{ key: string; meta: GameMeta }>
}

export function CatalogSection({ games }: CatalogSectionProps) {
  return (
    <section
      id="catalog"
      aria-labelledby="catalog-heading"
      className="parley-dark"
    >
      <div className="px-6 sm:px-10 py-20 sm:py-28 max-w-6xl mx-auto w-full">
        <motion.div
          className="flex flex-col gap-2 mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-display text-sm uppercase tracking-[0.2em] parley-dark-muted">
            The catalog
          </p>
          <h2
            id="catalog-heading"
            className="font-display text-3xl sm:text-5xl font-bold leading-tight"
          >
            The lineup, for now.
          </h2>
          <p className="mt-3 text-base parley-dark-muted leading-relaxed">
            Each game is its own thing — different mechanic, different mood, same
            simple flow to set up and play. New games are added when they&apos;re
            ready, not before.
          </p>
        </motion.div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {games.map(({ key, meta }, i) => {
            const [minDur, maxDur] = meta.estimatedDurationMinutes
            const durationLabel =
              minDur === maxDur ? `${minDur} min` : `${minDur}–${maxDur} min`
            const isComingSoon = meta.status === "coming-soon"

            const cardBody = (
              <>
                <div className="flex items-start justify-between">
                  <span
                    className="text-5xl"
                    role="img"
                    aria-label={`${meta.name} icon`}
                  >
                    {meta.icon}
                  </span>
                  {isComingSoon && (
                    <span className="text-[10px] uppercase tracking-[0.15em] font-display font-semibold px-2 py-1 rounded-md parley-dark-card border parley-dark-border parley-dark-muted">
                      Soon
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h3
                    className="font-display text-xl font-bold leading-tight"
                    style={{
                      color: isComingSoon ? undefined : meta.accentColor,
                    }}
                  >
                    {meta.name}
                  </h3>
                  <p className="text-sm parley-dark-muted leading-relaxed">
                    {meta.tagline}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap pt-3 border-t parley-dark-border">
                  <span className="text-xs px-2 py-1 rounded-md parley-dark-card border parley-dark-border parley-dark-muted">
                    {meta.minPlayers}–{meta.maxPlayers} players
                  </span>
                  <span className="text-xs px-2 py-1 rounded-md parley-dark-card border parley-dark-border parley-dark-muted">
                    {durationLabel}
                  </span>
                </div>
              </>
            )

            if (isComingSoon) {
              return (
                <motion.li
                  key={key}
                  className="flex flex-col gap-4 p-6 rounded-2xl parley-dark-card border parley-dark-border border-dashed opacity-65 cursor-default"
                  aria-disabled="true"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 0.65, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  {cardBody}
                </motion.li>
              )
            }

            return (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  href={`/games/${key}`}
                  className="flex flex-col gap-4 h-full p-6 rounded-2xl parley-dark-card border parley-dark-border transition-all hover:-translate-y-1 hover:border-current"
                >
                  {cardBody}
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
