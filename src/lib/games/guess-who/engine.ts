import type { Game, GamePhase, Round, RoundView } from "@/types";
import type { EngineGameView, GameType, Award } from "@/lib/platform";

const PHASE_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  LOBBY: ["SUBMITTING"],
  SUBMITTING: ["GUESSING"],
  // Guessing rounds chain together; only after the last one do we reach REVEAL.
  GUESSING: ["GUESSING", "REVEAL"],
  REVEAL: ["SCOREBOARD"],
  SCOREBOARD: [],
};

export class GuessWhoGame implements GameType {
  readonly name = "Guess Who Said It";
  readonly description =
    "Everyone answers a prompt anonymously. Guess who wrote each answer.";
  readonly firstPhase: GamePhase = "SUBMITTING";

  validTransitions(currentPhase: GamePhase): GamePhase[] {
    return PHASE_TRANSITIONS[currentPhase] ?? [];
  }

  calculateScores(game: Game, roundIndex: number): Map<string, number> {
    const scores = new Map<string, number>();
    const round = game.rounds[roundIndex];
    if (!round) return scores;

    for (const guess of round.guesses) {
      if (guess.guessedAuthorId === round.authorId) {
        // Correct guess: +1 to guesser
        scores.set(guess.playerId, (scores.get(guess.playerId) ?? 0) + 1);
      } else {
        // Wrong guess: +1 to the author (they fooled someone)
        scores.set(round.authorId, (scores.get(round.authorId) ?? 0) + 1);
      }
    }

    return scores;
  }

  buildGameView(game: Game, playerId: string): EngineGameView {
    const authorsExposed =
      game.phase === "REVEAL" || game.phase === "SCOREBOARD";

    const currentRoundRaw = game.rounds[game.currentRoundIndex] ?? null;
    const isCurrentRoundAuthor = currentRoundRaw
      ? currentRoundRaw.authorId === playerId
      : false;

    const currentRound = currentRoundRaw
      ? this.buildRoundView(currentRoundRaw, {
          exposeAuthor: authorsExposed,
          exposeAnswer: true,
        })
      : null;

    // During GUESSING, only the current round's content is exposed in `rounds[]`.
    // All other rounds are reduced to metadata so a snooping client can't see
    // ahead. During REVEAL/SCOREBOARD everything is exposed for the cascade.
    const rounds = game.rounds.map((r) => {
      const exposeAnswer =
        authorsExposed || r.index === game.currentRoundIndex;
      return this.buildRoundView(r, {
        exposeAuthor: authorsExposed,
        exposeAnswer,
      });
    });

    const awards =
      game.phase === "SCOREBOARD" ? this.calculateAwards(game) : [];

    return {
      code: game.code,
      phase: game.phase,
      players: game.players,
      promptText: game.promptText,
      currentRound,
      rounds,
      timer: game.timer,
      submissionCount: Object.keys(game.answers).length,
      totalPlayers: game.players.length,
      isCurrentRoundAuthor,
      awards,
      revealStartedAt: game.revealStartedAt,
      reactions: authorsExposed ? game.reactions : [],
    };
  }

  calculateAwards(game: Game): Award[] {
    const awards: Award[] = [];
    const playerMap = new Map(game.players.map((p) => [p.id, p]));

    // Most Mysterious: author who fooled the most people across all rounds
    const fooledCounts = new Map<string, number>();
    // Detective: most correct guesses across all rounds
    const correctCounts = new Map<string, number>();
    // Hype Person: player who sent the most reactions during the reveal
    const reactionsSent = new Map<string, number>();

    for (const round of game.rounds) {
      for (const guess of round.guesses) {
        if (guess.guessedAuthorId === round.authorId) {
          correctCounts.set(
            guess.playerId,
            (correctCounts.get(guess.playerId) ?? 0) + 1
          );
        } else {
          fooledCounts.set(
            round.authorId,
            (fooledCounts.get(round.authorId) ?? 0) + 1
          );
        }
      }
    }

    for (const reaction of game.reactions) {
      reactionsSent.set(
        reaction.playerId,
        (reactionsSent.get(reaction.playerId) ?? 0) + 1
      );
    }

    const topFooled = this.topEntry(fooledCounts);
    if (topFooled) {
      const player = playerMap.get(topFooled[0]);
      if (player) {
        awards.push({
          title: "Most Mysterious",
          description: `Fooled others ${topFooled[1]} time${topFooled[1] !== 1 ? "s" : ""}`,
          playerId: player.id,
          playerName: player.name,
        });
      }
    }

    const topCorrect = this.topEntry(correctCounts);
    if (topCorrect) {
      const player = playerMap.get(topCorrect[0]);
      if (player) {
        awards.push({
          title: "Detective",
          description: `${topCorrect[1]} correct guess${topCorrect[1] !== 1 ? "es" : ""}`,
          playerId: player.id,
          playerName: player.name,
        });
      }
    }

    const topReactions = this.topEntry(reactionsSent);
    if (topReactions && topReactions[1] > 0) {
      const player = playerMap.get(topReactions[0]);
      if (player) {
        awards.push({
          title: "Hype Person",
          description: `Sent ${topReactions[1]} reaction${topReactions[1] !== 1 ? "s" : ""} during the reveal`,
          playerId: player.id,
          playerName: player.name,
        });
      }
    }

    return awards;
  }

  private topEntry(counts: Map<string, number>): [string, number] | null {
    let top: [string, number] | null = null;
    for (const [id, count] of counts) {
      if (!top || count > top[1]) {
        top = [id, count];
      }
    }
    return top;
  }

  private buildRoundView(
    round: Round,
    opts: { exposeAuthor: boolean; exposeAnswer: boolean }
  ): RoundView {
    return {
      index: round.index,
      answer: opts.exposeAnswer ? round.answer : "",
      authorId: opts.exposeAuthor ? round.authorId : null,
      guesses: opts.exposeAuthor ? round.guesses : [],
      guessCount: round.guesses.length,
    };
  }
}
