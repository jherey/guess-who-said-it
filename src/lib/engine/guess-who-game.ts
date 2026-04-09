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
    };
  }

  calculateAwards(_game: Game): Award[] {
    // Implemented in Phase 5
    return [];
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
