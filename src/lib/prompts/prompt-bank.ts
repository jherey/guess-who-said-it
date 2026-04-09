export interface Prompt {
  id: string;
  text: string;
  category: "personality" | "experience" | "opinion" | "hypothetical";
}

export const PROMPT_BANK: Prompt[] = [
  // --- PERSONALITY ---
  { id: "p1", text: "What's a skill you have that nobody on this team knows about?", category: "personality" },
  { id: "p2", text: "What's the most unusual thing on your desk right now?", category: "personality" },
  { id: "p5", text: "What's the weirdest food combination you genuinely enjoy?", category: "personality" },
  { id: "p6", text: "What's a movie or show you've watched more than 5 times?", category: "personality" },
  { id: "p10", text: "What's your go-to karaoke song, even if you'd never actually do karaoke?", category: "personality" },
  { id: "p16", text: "What's a small thing that makes your day unreasonably better?", category: "personality" },
  { id: "p17", text: "What's the most useless talent you have?", category: "personality" },
  { id: "p19", text: "What's the strangest compliment you've ever received?", category: "personality" },
  { id: "p20", text: "What's your comfort movie — the one you put on when nothing else works?", category: "personality" },
  { id: "p21", text: "What app on your phone do you use embarrassingly often?", category: "personality" },
  { id: "p22", text: "What's a song that instantly puts you in a good mood?", category: "personality" },
  { id: "p23", text: "What's your guilty pleasure TV show?", category: "personality" },
  { id: "p24", text: "What's a food you could eat every single day and never get tired of?", category: "personality" },
  { id: "p25", text: "What's your most unpopular food opinion?", category: "personality" },
  { id: "p26", text: "What's the most niche interest or hobby you have?", category: "personality" },
  { id: "p27", text: "If you had a walk-on song every time you entered a room, what would it be?", category: "personality" },
  { id: "p28", text: "What's the last thing you got unreasonably excited about?", category: "personality" },
  { id: "p29", text: "What's something you're weirdly competitive about?", category: "personality" },
  { id: "p30", text: "What's the most random thing in your browser bookmarks?", category: "personality" },
  { id: "p31", text: "What's your go-to order at a coffee shop?", category: "personality" },
  { id: "p32", text: "What's a word or phrase you say way too often?", category: "personality" },
  { id: "p33", text: "What were you really into as a teenager that you'd never admit now?", category: "personality" },
  { id: "p34", text: "What's the most played song on your Spotify/Apple Music?", category: "personality" },
  { id: "p35", text: "What's the weirdest thing you've ever googled?", category: "personality" },

  // --- EXPERIENCE ---
  { id: "p3", text: "What's a hobby you had as a kid that you'd love to pick up again?", category: "experience" },
  { id: "p7", text: "What's the most spontaneous thing you've ever done?", category: "experience" },
  { id: "p11", text: "What's the best piece of advice you've ever received?", category: "experience" },
  { id: "p13", text: "What's something you believed for way too long before finding out it was wrong?", category: "experience" },
  { id: "p14", text: "What's the most underrated place you've ever visited?", category: "experience" },
  { id: "p36", text: "What's the best meal you've ever had and where was it?", category: "experience" },
  { id: "p37", text: "What's the most embarrassing thing that happened to you at work?", category: "experience" },
  { id: "p38", text: "What's a concert or event that genuinely changed your life?", category: "experience" },
  { id: "p39", text: "What's the bravest thing you've ever done?", category: "experience" },
  { id: "p40", text: "What job did you want when you were 10 years old?", category: "experience" },
  { id: "p41", text: "What's the worst haircut you've ever had?", category: "experience" },
  { id: "p42", text: "What's a tradition from your family that other people find weird?", category: "experience" },
  { id: "p43", text: "What's the funniest misunderstanding you've been part of?", category: "experience" },
  { id: "p44", text: "What's the longest you've ever gone without sleep, and why?", category: "experience" },
  { id: "p45", text: "What's the most unusual job you've ever had?", category: "experience" },
  { id: "p46", text: "What's a skill you learned the hard way?", category: "experience" },
  { id: "p47", text: "What's the best random act of kindness you've witnessed or experienced?", category: "experience" },
  { id: "p48", text: "What's the most ridiculous thing you've done to avoid an awkward situation?", category: "experience" },
  { id: "p49", text: "What's a trip or vacation that didn't go as planned but turned out great?", category: "experience" },
  { id: "p50", text: "What's the first thing you remember buying with your own money?", category: "experience" },
  { id: "p51", text: "What's a mistake you made that turned out to be a blessing in disguise?", category: "experience" },
  { id: "p52", text: "What's the most interesting conversation you've had with a stranger?", category: "experience" },
  { id: "p53", text: "What's something that scared you as a kid but seems silly now?", category: "experience" },
  { id: "p54", text: "What's the best impulse purchase you've ever made?", category: "experience" },
  { id: "p55", text: "What's a moment in your life that felt like it was straight out of a movie?", category: "experience" },

  // --- OPINION ---
  { id: "p9", text: "What's a hill you'll die on that most people disagree with?", category: "opinion" },
  { id: "p56", text: "What's an overrated thing that everyone else seems to love?", category: "opinion" },
  { id: "p57", text: "What's an underrated thing that deserves way more hype?", category: "opinion" },
  { id: "p58", text: "Pineapple on pizza — yes or no, and why are you right?", category: "opinion" },
  { id: "p59", text: "What's a popular movie or book that you just don't get the hype for?", category: "opinion" },
  { id: "p60", text: "What's the most controversial opinion you hold about technology?", category: "opinion" },
  { id: "p61", text: "Morning person or night owl — and would you switch if you could?", category: "opinion" },
  { id: "p62", text: "What's the best decade for music and why?", category: "opinion" },
  { id: "p63", text: "What's a rule at work that you think should be abolished?", category: "opinion" },
  { id: "p64", text: "Cats or dogs — and what does your choice say about you?", category: "opinion" },
  { id: "p65", text: "What's a life hack that you swear by but nobody believes works?", category: "opinion" },
  { id: "p66", text: "What's the most important quality in a teammate?", category: "opinion" },
  { id: "p67", text: "What's a trend that you hope never comes back?", category: "opinion" },
  { id: "p68", text: "What's something that's considered rude but shouldn't be?", category: "opinion" },
  { id: "p69", text: "What's the best invention of the last 20 years?", category: "opinion" },
  { id: "p70", text: "Remote work, office, or hybrid — what's actually best and why?", category: "opinion" },
  { id: "p71", text: "What's a common piece of advice that you think is actually wrong?", category: "opinion" },

  // --- HYPOTHETICAL ---
  { id: "p4", text: "If you could swap jobs with anyone on this team for a day, who and why?", category: "hypothetical" },
  { id: "p8", text: "If you could have dinner with any person, alive or dead, who would it be?", category: "hypothetical" },
  { id: "p12", text: "If you had to teach a class on anything, what would it be?", category: "hypothetical" },
  { id: "p15", text: "If your life had a theme song, what would it be?", category: "hypothetical" },
  { id: "p18", text: "If you could instantly become an expert in something, what would you choose?", category: "hypothetical" },
  { id: "p72", text: "If you could live in any fictional universe, which one would you pick?", category: "hypothetical" },
  { id: "p73", text: "If you had to eat one cuisine for the rest of your life, which would it be?", category: "hypothetical" },
  { id: "p74", text: "If you could time travel to any era, when would you go?", category: "hypothetical" },
  { id: "p75", text: "If you won the lottery tomorrow, what's the first thing you'd do?", category: "hypothetical" },
  { id: "p76", text: "If you could have any superpower, but only for one hour a day, what would it be?", category: "hypothetical" },
  { id: "p77", text: "If you could master any musical instrument overnight, which one?", category: "hypothetical" },
  { id: "p78", text: "If you had to give a TED talk next week, what would your topic be?", category: "hypothetical" },
  { id: "p79", text: "If you could teleport to one place right now, where would you go?", category: "hypothetical" },
  { id: "p80", text: "If you could add one room to your house, what would it be?", category: "hypothetical" },
  { id: "p81", text: "If you could relive one day of your life, which day would you pick?", category: "hypothetical" },
  { id: "p82", text: "If you had to survive a zombie apocalypse with one person from this team, who?", category: "hypothetical" },
  { id: "p83", text: "If you could only watch one movie for the rest of your life, which one?", category: "hypothetical" },
  { id: "p84", text: "If you could have any animal as a pet (magically tame), what would you choose?", category: "hypothetical" },
  { id: "p85", text: "If you could wake up tomorrow with one new skill fully mastered, what would it be?", category: "hypothetical" },
  { id: "p86", text: "If you could start a business with unlimited funding, what would it be?", category: "hypothetical" },
  { id: "p87", text: "If you were a character in a sitcom, which show would it be?", category: "hypothetical" },
  { id: "p88", text: "If you could uninvent one thing, what would it be?", category: "hypothetical" },
  { id: "p89", text: "If aliens landed and asked you to explain humanity in one sentence, what would you say?", category: "hypothetical" },
  { id: "p90", text: "If you could have a conversation with your 10-year-old self, what would you tell them?", category: "hypothetical" },
  { id: "p91", text: "If you had to rename this team, what would you call it?", category: "hypothetical" },
  { id: "p92", text: "If you could be famous for one thing, what would you want it to be?", category: "hypothetical" },
  { id: "p93", text: "If you could snap your fingers and fix one thing about the world, what would it be?", category: "hypothetical" },
  { id: "p94", text: "If you could only use three apps on your phone forever, which three?", category: "hypothetical" },
  { id: "p95", text: "If you could live anywhere in the world for a year, where would you go?", category: "hypothetical" },
  { id: "p96", text: "If you had a time machine but could only go forward, how far would you go?", category: "hypothetical" },
  { id: "p97", text: "If you could switch lives with someone for a week, who would it be?", category: "hypothetical" },
  { id: "p98", text: "If your team had a mascot, what animal should it be?", category: "hypothetical" },
  { id: "p99", text: "If you could make one rule that everyone in the world had to follow, what would it be?", category: "hypothetical" },
  { id: "p100", text: "If you could attend any event in history as a spectator, what would you choose?", category: "hypothetical" },
];

/**
 * Pick a random prompt, avoiding any in the exclude list.
 */
export function pickRandomPrompt(excludeIds: string[] = []): Prompt {
  const available = PROMPT_BANK.filter((p) => !excludeIds.includes(p.id));
  const pool = available.length > 0 ? available : PROMPT_BANK;
  return pool[Math.floor(Math.random() * pool.length)];
}
