"use client";

import { motion } from "framer-motion";

/**
 * A small ambient demo of what playing on Parley feels like — three
 * prompt/answer cards, gently breathing, contained inside their own column
 * of the hero. Decorative, not interactive. Reduced-motion users see them
 * static.
 */

interface SampleCard {
  prompt: string;
  answer: string;
  rotate: number;
  driftDuration: number;
  driftRangePx: number;
  offsetX: number;
}

const SAMPLE_CARDS: SampleCard[] = [
  {
    prompt: "What's a small ritual that makes your day better?",
    answer: "First coffee with no phone. Twelve minutes, every morning.",
    rotate: -2,
    driftDuration: 22,
    driftRangePx: 6,
    offsetX: -8,
  },
  {
    prompt: "What's the most unusual thing on your desk right now?",
    answer: "A jar of teeth. They're ceramic, but still.",
    rotate: 3,
    driftDuration: 26,
    driftRangePx: 7,
    offsetX: 12,
  },
  {
    prompt: "What show would you marathon if work disappeared?",
    answer: "Severance. Probably for the third time.",
    rotate: -1,
    driftDuration: 24,
    driftRangePx: 5,
    offsetX: 4,
  },
];

export function FloatingCards() {
  return (
    <div
      className="relative w-full max-w-md mx-auto lg:mx-0 flex flex-col gap-5"
      aria-hidden="true"
    >
      {SAMPLE_CARDS.map((card, i) => (
        <motion.div
          key={i}
          data-animate="drift"
          className="relative"
          style={{ marginLeft: `${card.offsetX}px` }}
          initial={{ opacity: 0, y: 12, rotate: card.rotate }}
          animate={{
            opacity: 1,
            y: [0, -card.driftRangePx, 0],
            rotate: [card.rotate, card.rotate + 0.8, card.rotate],
          }}
          transition={{
            opacity: { duration: 1.0, delay: 0.4 + i * 0.18 },
            y: {
              duration: card.driftDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            },
            rotate: {
              duration: card.driftDuration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            },
          }}
        >
          <div className="parley-card border rounded-2xl px-5 py-4 flex flex-col gap-2 shadow-sm">
            <p className="parley-faint text-[0.65rem] uppercase tracking-[0.18em] font-medium">
              {card.prompt}
            </p>
            <p className="text-base font-display italic leading-snug">
              &ldquo;{card.answer}&rdquo;
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
