export interface Prompt {
  id: string;
  text: string;
  category: "personality" | "experience" | "opinion" | "hypothetical";
}

export const PROMPT_BANK: Prompt[] = [
  {
    id: "p1",
    text: "What's a skill you have that nobody on this team knows about?",
    category: "personality",
  },
  {
    id: "p2",
    text: "What's the most unusual thing on your desk right now?",
    category: "personality",
  },
  {
    id: "p3",
    text: "What's a hobby you had as a kid that you'd love to pick up again?",
    category: "experience",
  },
  {
    id: "p4",
    text: "If you could swap jobs with anyone on this team for a day, who and why?",
    category: "hypothetical",
  },
  {
    id: "p5",
    text: "What's the weirdest food combination you genuinely enjoy?",
    category: "personality",
  },
  {
    id: "p6",
    text: "What's a movie or show you've watched more than 5 times?",
    category: "personality",
  },
  {
    id: "p7",
    text: "What's the most spontaneous thing you've ever done?",
    category: "experience",
  },
  {
    id: "p8",
    text: "If you could have dinner with any person, alive or dead, who would it be?",
    category: "hypothetical",
  },
  {
    id: "p9",
    text: "What's a hill you'll die on that most people disagree with?",
    category: "opinion",
  },
  {
    id: "p10",
    text: "What's your go-to karaoke song, even if you'd never actually do karaoke?",
    category: "personality",
  },
  {
    id: "p11",
    text: "What's the best piece of advice you've ever received?",
    category: "experience",
  },
  {
    id: "p12",
    text: "If you had to teach a class on anything, what would it be?",
    category: "hypothetical",
  },
  {
    id: "p13",
    text: "What's something you believed for way too long before finding out it was wrong?",
    category: "experience",
  },
  {
    id: "p14",
    text: "What's the most underrated place you've ever visited?",
    category: "experience",
  },
  {
    id: "p15",
    text: "If your life had a theme song, what would it be?",
    category: "hypothetical",
  },
  {
    id: "p16",
    text: "What's a small thing that makes your day unreasonably better?",
    category: "personality",
  },
  {
    id: "p17",
    text: "What's the most useless talent you have?",
    category: "personality",
  },
  {
    id: "p18",
    text: "If you could instantly become an expert in something, what would you choose?",
    category: "hypothetical",
  },
];

/**
 * Pick a random prompt, avoiding any in the exclude list.
 */
export function pickRandomPrompt(excludeIds: string[] = []): Prompt {
  const available = PROMPT_BANK.filter((p) => !excludeIds.includes(p.id));
  const pool = available.length > 0 ? available : PROMPT_BANK;
  return pool[Math.floor(Math.random() * pool.length)];
}
