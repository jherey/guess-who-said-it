export interface Prompt {
  id: string;
  text: string;
  category: "personality" | "experience" | "opinion" | "hypothetical";
}

export const PROMPT_BANK: Prompt[] = [
  // --- PERSONALITY (13) ---
  { id: "p1", text: "What's a skill you have that nobody on this team knows about?", category: "personality" },
  { id: "p2", text: "What's the most unusual thing on your desk right now?", category: "personality" },
  { id: "p5", text: "What's the weirdest food combination you genuinely enjoy?", category: "personality" },
  { id: "p6", text: "What's a movie or show you've watched more than 5 times?", category: "personality" },
  { id: "p10", text: "What's your go-to karaoke song, even if you'd never actually do karaoke?", category: "personality" },
  { id: "p16", text: "What's a small thing that makes your day unreasonably better?", category: "personality" },
  { id: "p17", text: "What's the most useless talent you have?", category: "personality" },
  { id: "p22", text: "What's a song that instantly puts you in a good mood?", category: "personality" },
  { id: "p24", text: "What's a food you could eat every single day and never get tired of?", category: "personality" },
  { id: "p26", text: "What's the most niche interest or hobby you have?", category: "personality" },
  { id: "p28", text: "What's the last thing you got unreasonably excited about?", category: "personality" },
  { id: "p31", text: "What's your go-to order at a coffee shop?", category: "personality" },
  { id: "p32", text: "What's a word or phrase you say way too often?", category: "personality" },

  // --- EXPERIENCE (12) ---
  { id: "p3", text: "What's a hobby you had as a kid that you'd love to pick up again?", category: "experience" },
  { id: "p11", text: "What's the best piece of advice you've ever received?", category: "experience" },
  { id: "p14", text: "What's the most underrated place you've ever visited?", category: "experience" },
  { id: "p36", text: "What's the best meal you've ever had and where was it?", category: "experience" },
  { id: "p38", text: "What's a concert or live event that you'll never forget?", category: "experience" },
  { id: "p40", text: "What job did you want when you were 10 years old?", category: "experience" },
  { id: "p42", text: "What's a tradition from your family that other people find unusual?", category: "experience" },
  { id: "p46", text: "What's a skill you learned the hard way?", category: "experience" },
  { id: "p47", text: "What's the best random act of kindness you've witnessed or experienced?", category: "experience" },
  { id: "p49", text: "What's a trip that didn't go as planned but turned out great?", category: "experience" },
  { id: "p50", text: "What's the first thing you remember buying with your own money?", category: "experience" },
  { id: "p53", text: "What's something that scared you as a kid but seems silly now?", category: "experience" },

  // --- OPINION (10) ---
  { id: "p56", text: "What's an overrated thing that everyone else seems to love?", category: "opinion" },
  { id: "p57", text: "What's an underrated thing that deserves way more hype?", category: "opinion" },
  { id: "p58", text: "Pineapple on pizza — yes or no, and why are you right?", category: "opinion" },
  { id: "p61", text: "Morning person or night owl — and would you switch if you could?", category: "opinion" },
  { id: "p62", text: "What's the best decade for music and why?", category: "opinion" },
  { id: "p64", text: "Cats or dogs — and what does your choice say about you?", category: "opinion" },
  { id: "p65", text: "What's a life hack that you swear by but nobody believes works?", category: "opinion" },
  { id: "p66", text: "What's the most important quality in a teammate?", category: "opinion" },
  { id: "p69", text: "What's the best invention of the last 20 years?", category: "opinion" },
  { id: "p71", text: "What's a common piece of advice that you think is actually wrong?", category: "opinion" },

  // --- HYPOTHETICAL (15) ---
  { id: "p4", text: "If you could swap jobs with anyone on this team for a day, who and why?", category: "hypothetical" },
  { id: "p8", text: "If you could have dinner with any person, alive or dead, who would it be?", category: "hypothetical" },
  { id: "p12", text: "If you had to teach a class on anything, what would it be?", category: "hypothetical" },
  { id: "p15", text: "If your life had a theme song, what would it be?", category: "hypothetical" },
  { id: "p18", text: "If you could instantly become an expert in something, what would you choose?", category: "hypothetical" },
  { id: "p72", text: "If you could live in any fictional universe, which one would you pick?", category: "hypothetical" },
  { id: "p73", text: "If you had to eat one cuisine for the rest of your life, which would it be?", category: "hypothetical" },
  { id: "p76", text: "If you could have any superpower, but only for one hour a day, what would it be?", category: "hypothetical" },
  { id: "p77", text: "If you could master any musical instrument overnight, which one?", category: "hypothetical" },
  { id: "p78", text: "If you had to give a TED talk next week, what would your topic be?", category: "hypothetical" },
  { id: "p79", text: "If you could teleport to one place right now, where would you go?", category: "hypothetical" },
  { id: "p84", text: "If you could have any animal as a pet (magically tame), what would you choose?", category: "hypothetical" },
  { id: "p91", text: "If you had to rename this team, what would you call it?", category: "hypothetical" },
  { id: "p94", text: "If you could only use three apps on your phone forever, which three?", category: "hypothetical" },
  { id: "p98", text: "If your team had a mascot, what animal should it be?", category: "hypothetical" },
];

/**
 * Pick a random prompt, avoiding any in the exclude list.
 */
export function pickRandomPrompt(excludeIds: string[] = []): Prompt {
  const available = PROMPT_BANK.filter((p) => !excludeIds.includes(p.id));
  const pool = available.length > 0 ? available : PROMPT_BANK;
  return pool[Math.floor(Math.random() * pool.length)];
}
