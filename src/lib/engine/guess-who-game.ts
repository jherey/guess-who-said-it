import type { Game, GamePhase, GameView, Round, RoundView } from "@/types";
import type { GameType, Award } from "./game-type";

const PHASE_TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  LOBBY: ["SUBMITTING"],
  SUBMITTING: ["GUESSING"],
  GUESSING: ["REVEAL"],
  REVEAL: ["GUESSING", "SCOREBOARD"],
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

  buildGameView(game: Game, playerId: string): GameView {
    const currentRound = game.rounds[game.currentRoundIndex] ?? null;
    const isCurrentRoundAuthor = currentRound
      ? currentRound.authorId === playerId
      : false;

    const awards =
      game.phase === "SCOREBOARD" ? this.calculateAwards(game) : [];

    return {
      code: game.code,
      phase: game.phase,
      players: game.players,
      promptText: game.promptText,
      currentRound: currentRound ? this.buildRoundView(currentRound) : null,
      rounds: game.rounds.map((r) => this.buildRoundView(r)),
      timer: game.timer,
      submissionCount: game.answers.size,
      totalPlayers: game.players.length,
      isCurrentRoundAuthor,
      awards,
    };
  }

  calculateAwards(game: Game): Award[] {
    const awards: Award[] = [];
    const playerMap = new Map(game.players.map((p) => [p.id, p]));

    // Most Mysterious: author who fooled the most people across all rounds
    const fooledCounts = new Map<string, number>();
    // Detective: most correct guesses across all rounds
    const correctCounts = new Map<string, number>();
    // Social Butterfly: author whose answer got the most reactions
    const reactionCounts = new Map<string, number>();

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
      reactionCounts.set(
        round.authorId,
        (reactionCounts.get(round.authorId) ?? 0) + round.reactions.length
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

    const topReactions = this.topEntry(reactionCounts);
    if (topReactions && topReactions[1] > 0) {
      const player = playerMap.get(topReactions[0]);
      if (player) {
        awards.push({
          title: "Social Butterfly",
          description: `Got ${topReactions[1]} reaction${topReactions[1] !== 1 ? "s" : ""} on their answers`,
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

  private buildRoundView(round: Round): RoundView {
    return {
      index: round.index,
      answer: round.answer,
      authorId: round.revealed ? round.authorId : null,
      guesses: round.guesses,
      guessCount: round.guesses.length,
      reactions: round.reactions as RoundView["reactions"],
      revealed: round.revealed,
    };
  }
}
