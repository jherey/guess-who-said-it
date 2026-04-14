"use client"

import { motion } from "framer-motion"
import { JoinBox } from "./join-box"

export function JoinSection() {
  return (
    <section
      id="join"
      aria-labelledby="join-heading"
      className="px-6 sm:px-10 py-20 sm:py-28 max-w-6xl mx-auto w-full"
    >
      <motion.div
        className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-4">
          <p className="font-display text-sm uppercase tracking-[0.2em] parley-muted">
            For players
          </p>
          <h2
            id="join-heading"
            className="font-display text-3xl sm:text-4xl font-bold leading-tight"
          >
            Have a code from your host?
          </h2>
          <p className="text-base parley-muted leading-relaxed max-w-md">
            Drop it in here and you&apos;ll be in the game in a second. No
            account needed.
          </p>
        </div>

        <div className="lg:justify-self-end w-full max-w-sm">
          <JoinBox />
        </div>
      </motion.div>
    </section>
  )
}
