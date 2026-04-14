"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { TextRotate } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"

const springTransition = {
  type: "spring",
  damping: 30,
  stiffness: 400,
} as const

export function HeroSection() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const saved = localStorage.getItem("parley-hero-theme")
    if (saved === "dark") setTheme("dark")
  }, [])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("parley-hero-theme", next)
  }

  return (
    <section
      className="parley-hero relative min-h-screen overflow-hidden flex flex-col"
      data-theme={theme}
    >
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[8%] right-[12%] w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full hero-glow-warm blur-[120px]" />
        <div className="absolute bottom-[15%] left-[8%] w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full hero-glow-cool blur-[120px]" />
      </div>

      {/* Parallax floating layer */}
      <Floating sensitivity={-0.5} className="h-full pointer-events-none">
        {/* Top-left: prompt card */}
        <FloatingElement
          depth={1}
          className="top-[10%] left-[2%] md:top-[15%] md:left-[5%] hidden md:block"
        >
          <motion.div
            className="hero-glass rounded-xl p-4 w-52 -rotate-[4deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-[0.55rem] uppercase tracking-[0.15em] hero-card-label mb-1.5 leading-relaxed">
              What&apos;s a small ritual that makes your day better?
            </p>
            <p className="text-sm hero-card-text font-display italic leading-snug">
              &ldquo;First coffee with no phone.&rdquo;
            </p>
          </motion.div>
        </FloatingElement>

        {/* Top-right: game badge */}
        <FloatingElement
          depth={2}
          className="top-[6%] left-[80%] md:top-[10%] md:left-[82%]"
        >
          <motion.div
            className="hero-glass rounded-xl px-4 py-3 flex items-center gap-2.5 rotate-[5deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-2xl">🕵️</span>
            <span className="text-sm hero-card-text font-display font-semibold whitespace-nowrap">
              Guess Who
            </span>
          </motion.div>
        </FloatingElement>

        {/* Mid-left: reaction chip */}
        <FloatingElement
          depth={1.5}
          className="top-[52%] left-[2%] md:top-[48%] md:left-[6%] hidden lg:block"
        >
          <motion.div
            className="hero-glass rounded-full px-4 py-2 -rotate-[3deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <span className="text-sm hero-card-text font-display font-medium">
              🎯 Knew it!
            </span>
          </motion.div>
        </FloatingElement>

        {/* Mid-right: prompt card */}
        <FloatingElement
          depth={0.8}
          className="top-[42%] left-[84%] md:top-[38%] md:left-[84%] hidden md:block"
        >
          <motion.div
            className="hero-glass rounded-xl p-4 w-48 rotate-[6deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <p className="text-[0.55rem] uppercase tracking-[0.15em] hero-card-label mb-1.5 leading-relaxed">
              What show would you marathon?
            </p>
            <p className="text-sm hero-card-text font-display italic leading-snug">
              &ldquo;Severance. Third time.&rdquo;
            </p>
          </motion.div>
        </FloatingElement>

        {/* Bottom-left: prompt card */}
        <FloatingElement
          depth={2.5}
          className="top-[78%] left-[4%] md:top-[75%] md:left-[7%]"
        >
          <motion.div
            className="hero-glass rounded-xl p-3 md:p-4 w-44 md:w-52 -rotate-[2deg]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-[0.55rem] uppercase tracking-[0.15em] hero-card-label mb-1.5 leading-relaxed">
              Most unusual desk item?
            </p>
            <p className="text-sm hero-card-text font-display italic leading-snug">
              &ldquo;A jar of ceramic teeth.&rdquo;
            </p>
          </motion.div>
        </FloatingElement>

        {/* Bottom-right: reaction chip + game badge */}
        <FloatingElement
          depth={1.2}
          className="top-[80%] left-[78%] md:top-[76%] md:left-[80%] hidden md:block"
        >
          <motion.div
            className="flex flex-col gap-3 items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <div className="hero-glass rounded-full px-4 py-2 rotate-[4deg]">
              <span className="text-sm hero-card-text font-display font-medium">
                🔥 Legend
              </span>
            </div>
            <div className="hero-glass rounded-xl px-4 py-3 flex items-center gap-2.5 rotate-[8deg]">
              <span className="text-xl">🔥</span>
              <span className="text-sm hero-card-text font-display font-semibold whitespace-nowrap">
                Hot Takes
              </span>
            </div>
          </motion.div>
        </FloatingElement>
      </Floating>

      {/* Content layer */}
      <div className="relative z-50 flex flex-col min-h-screen pointer-events-auto">
        {/* Header */}
        <header className="px-6 sm:px-10 pt-8 pb-4 max-w-6xl mx-auto w-full flex items-center justify-between">
          <motion.span
            className="font-display text-xl sm:text-2xl font-bold tracking-tight"
            aria-label="Parley"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Parley<span className="hero-accent">.</span>
          </motion.span>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="hero-muted p-2 rounded-lg hover:opacity-70 transition-opacity"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <motion.a
              href="#join"
              className="hero-muted text-sm hover:opacity-70 transition-opacity"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Have a code?
            </motion.a>
          </div>
        </header>

        {/* Centered hero content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="text-center max-w-3xl">
            <motion.p
              className="font-display text-sm uppercase tracking-[0.2em] hero-muted mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              A small platform of multiplayer games
            </motion.p>

            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className="block">A few good games</span>
              <span className="block mt-1 md:mt-3">to make your team</span>
              <TextRotate
                texts={[
                  "laugh",
                  "bond",
                  "guess",
                  "confess",
                  "compete",
                  "connect",
                ]}
                mainClassName="overflow-hidden pb-1 md:pb-3 justify-center mt-1 md:mt-3"
                elementLevelClassName="hero-accent"
                staggerDuration={0.03}
                staggerFrom="last"
                rotationInterval={3000}
                transition={springTransition}
              />
            </motion.h1>

            <motion.p
              className="mt-7 text-base sm:text-lg hero-muted max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Built for retros, kickoffs, and the time between meetings. Share a
              code, everyone joins on their phone, you&apos;re playing in a
              minute.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-row gap-3 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              <a
                href="#catalog"
                className="hero-accent-bg inline-flex items-center justify-center h-12 px-7 rounded-2xl font-display font-semibold text-base hover:opacity-90 transition-opacity"
              >
                Start a game
              </a>
              <a
                href="#join"
                className="hero-secondary-btn inline-flex items-center justify-center h-12 px-7 rounded-2xl font-display font-semibold text-base border transition-colors"
              >
                Have a code
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
