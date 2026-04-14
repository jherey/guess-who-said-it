"use client"

import { motion } from "framer-motion"

const PROPS = [
  { icon: "🚫", label: "No accounts" },
  { icon: "📱", label: "Plays on phones" },
  { icon: "⏱️", label: "10–15 min" },
  { icon: "👥", label: "3–10 players" },
]

export function ValuePropsStrip() {
  return (
    <section
      aria-label="Key features"
      className="px-6 sm:px-10 py-10 sm:py-14 max-w-6xl mx-auto w-full"
    >
      <ul className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {PROPS.map((prop, i) => (
          <motion.li
            key={prop.label}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl parley-card border text-sm font-display font-medium"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
          >
            <span className="text-lg" aria-hidden="true">
              {prop.icon}
            </span>
            {prop.label}
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
