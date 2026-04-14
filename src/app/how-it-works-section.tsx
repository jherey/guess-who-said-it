"use client"

import { motion } from "framer-motion"

const STEPS = [
  {
    step: "01",
    title: "Pick a game",
    desc: "Choose from the catalog. Each one is built for groups, designed to play in fifteen minutes or less.",
  },
  {
    step: "02",
    title: "Get a code",
    desc: "Create a room and you'll get a four-letter code instantly. No accounts, no setup, nothing to install.",
  },
  {
    step: "03",
    title: "Share it",
    desc: "Drop the code in chat or share the QR. Everyone joins on their phone in seconds.",
  },
  {
    step: "04",
    title: "Play together",
    desc: "Host runs the game from a shared screen. Players answer, guess, and react on their phones.",
  },
  {
    step: "05",
    title: "Move on with your day",
    desc: "Final scores, fun awards, play again with one click — or close the tab and get back to it.",
  },
]

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-heading"
      className="px-6 sm:px-10 py-20 sm:py-28 max-w-6xl mx-auto w-full"
    >
      <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
        <motion.div
          className="lg:sticky lg:top-12 lg:self-start"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-display text-sm uppercase tracking-[0.2em] parley-muted mb-4">
            How it works
          </p>
          <h2
            id="how-heading"
            className="font-display text-3xl sm:text-4xl font-bold leading-tight"
          >
            Five small steps,
            <br />
            from idea to playing.
          </h2>
        </motion.div>

        <ol className="flex flex-col">
          {STEPS.map((item, i) => (
            <motion.li
              key={item.step}
              className={`flex gap-6 sm:gap-10 py-6 ${
                i < STEPS.length - 1 ? "border-b parley-border" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <span
                className="font-display text-2xl font-bold parley-accent shrink-0 w-12 tabular-nums"
                aria-hidden="true"
              >
                {item.step}
              </span>
              <div className="flex flex-col gap-1.5 flex-1">
                <h3 className="font-display text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-sm parley-muted leading-relaxed max-w-xl">
                  {item.desc}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
