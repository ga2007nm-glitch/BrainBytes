import { randomUUID } from "node:crypto";
import {
  generateMatchQuestions,
  getPublicQuestion,
  Question
} from "./validator.js";
import {
  getMiniGameForLevel,
  MiniGameMode,
  normalizeMiniGameMode,
  validateMiniGameAnswer
} from "./miniGames.js";

type LocalPlayerNumber = 1 | 2;
type LocalPhase = "question" | "handoff" | "resolved" | "finished";

export type LocalQuestionResult = {
  questionNumber: number;
  level: number;
  levelName: string;
  subject: string;
  player1Correct: boolean;
  player2Correct: boolean;
  player1Points: number;
  player2Points: number;
  player1Damage: number;
  player2Damage: number;
  player1Hp: number;
  player2Hp: number;
  explanation: string;
  correctAnswer: string;
};

export type LocalBattle = {
  id: string;
  ownerId: string;
  playerNames: [string, string];
  miniGameMode: MiniGameMode;
  questions: Question[];
  answers: [string | null, string | null];
  scores: [number, number];
  hp: [number, number];
  racePositions: [number, number];
  questionIndex: number;
  activePlayer: LocalPlayerNumber | null;
  phase: LocalPhase;
  status: "playing" | "finished";
  winner: "player1" | "player2" | "draw" | null;
  history: LocalQuestionResult[];
  lastResult: LocalQuestionResult | null;
};

function playerName(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid player name");
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 20) {
    throw new Error("Invalid player name");
  }
  return trimmed;
}

export class LocalPracticeManager {
  private battles = new Map<string, LocalBattle>();

  startBattle(ownerId: string, player1Name: unknown, player2Name: unknown, gameModeInput?: unknown) {
    const battleQuestions = generateMatchQuestions();
    const battle: LocalBattle = {
      id: randomUUID(),
      ownerId,
      playerNames: [playerName(player1Name), playerName(player2Name)],
      miniGameMode: normalizeMiniGameMode(gameModeInput),
      questions: battleQuestions,
      answers: [null, null],
      scores: [0, 0],
      hp: [100, 100],
      racePositions: [0, 0],
      questionIndex: 0,
      activePlayer: 1,
      phase: "question",
      status: "playing",
      winner: null,
      history: [],
      lastResult: null
    };

    this.battles.set(battle.id, battle);
    return this.publicBattle(battle);
  }

  getBattle(id: string, ownerId: string) {
    const battle = this.findBattle(id, ownerId);
    return this.publicBattle(battle);
  }

  submitAnswer(
    id: string,
    ownerId: string,
    playerNumber: number,
    questionId: string,
    answer: string
  ) {
    const battle = this.findBattle(id, ownerId);
    if (battle.status !== "playing") throw new Error("Battle not active");
    if (playerNumber !== 1 && playerNumber !== 2) {
      throw new Error("Invalid player");
    }
    const expectedPhase = playerNumber === 1 ? "question" : "handoff";
    if (battle.phase !== expectedPhase || battle.activePlayer !== playerNumber) {
      throw new Error("Wrong turn");
    }

    const currentQuestion = battle.questions[battle.questionIndex];
    if (questionId !== currentQuestion.id) throw new Error("Question changed");

    const activeMiniGame = getMiniGameForLevel(battle.miniGameMode, currentQuestion.level);
    if (activeMiniGame !== "memory-logic" && !currentQuestion.options.includes(answer)) {
      throw new Error("Invalid answer");
    }
    if (typeof answer !== "string" || answer.length > 200) throw new Error("Invalid answer");

    battle.answers[playerNumber - 1] = answer;

    if (playerNumber === 1) {
      battle.phase = "handoff";
      battle.activePlayer = 2;
      return this.publicBattle(battle);
    }

    const [answer1, answer2] = battle.answers;
    if (answer1 === null || answer2 === null) {
      throw new Error("Both answers are required");
    }

    const player1Result = validateMiniGameAnswer(currentQuestion.id, currentQuestion.level, activeMiniGame, answer1);
    const player2Result = validateMiniGameAnswer(currentQuestion.id, currentQuestion.level, activeMiniGame, answer2);

    let p1Points = 0;
    let p2Points = 0;
    let p1Damage = 0;
    let p2Damage = 0;

    if (player1Result.correct && player2Result.correct) {
      // Both correct
      p1Points = currentQuestion.points;
      p2Points = currentQuestion.points;
      battle.racePositions[0] = Math.min(5, battle.racePositions[0] + 1);
      battle.racePositions[1] = Math.min(5, battle.racePositions[1] + 1);
    } else if (player1Result.correct && !player2Result.correct) {
      p1Points = currentQuestion.points + 10;
      p1Damage = currentQuestion.damage;
      battle.hp[1] = Math.max(0, battle.hp[1] - p1Damage);
      battle.racePositions[0] = Math.min(5, battle.racePositions[0] + 1);
    } else if (!player1Result.correct && player2Result.correct) {
      p2Points = currentQuestion.points + 10;
      p2Damage = currentQuestion.damage;
      battle.hp[0] = Math.max(0, battle.hp[0] - p2Damage);
      battle.racePositions[1] = Math.min(5, battle.racePositions[1] + 1);
    }

    battle.scores[0] += p1Points;
    battle.scores[1] += p2Points;

    const roundResult: LocalQuestionResult = {
      questionNumber: battle.questionIndex + 1,
      level: currentQuestion.level,
      levelName: currentQuestion.levelName,
      subject: currentQuestion.subject,
      player1Correct: player1Result.correct,
      player2Correct: player2Result.correct,
      player1Points: p1Points,
      player2Points: p2Points,
      player1Damage: p1Damage,
      player2Damage: p2Damage,
      player1Hp: battle.hp[0],
      player2Hp: battle.hp[1],
      explanation: player1Result.explanation,
      correctAnswer: activeMiniGame === "memory-logic"
        ? "Replay the complete signal sequence."
        : currentQuestion.correctAnswer
    };

    battle.history.push(roundResult);
    battle.lastResult = roundResult;
    battle.questionIndex++;
    battle.answers = [null, null];
    battle.activePlayer = null;

    if (
      battle.questionIndex >= battle.questions.length ||
      battle.hp[0] === 0 ||
      battle.hp[1] === 0
    ) {
      battle.status = "finished";
      battle.phase = "finished";
      if (battle.hp[0] === 0 && battle.hp[1] > 0) {
        battle.winner = "player2";
      } else if (battle.hp[1] === 0 && battle.hp[0] > 0) {
        battle.winner = "player1";
      } else {
        battle.winner = battle.scores[0] === battle.scores[1]
          ? "draw"
          : battle.scores[0] > battle.scores[1]
            ? "player1"
            : "player2";
      }
    } else {
      battle.phase = "resolved";
    }

    return this.publicBattle(battle);
  }

  continueBattle(id: string, ownerId: string) {
    const battle = this.findBattle(id, ownerId);
    if (battle.status !== "playing" || battle.phase !== "resolved") {
      throw new Error("Battle cannot continue");
    }

    battle.phase = "question";
    battle.activePlayer = 1;
    return this.publicBattle(battle);
  }

  getAnalyticsData() {
    const battles = [...this.battles.values()];
    const attempts = [];

    for (const battle of battles) {
      for (const result of battle.history) {
        const grade = battle.questions[result.questionNumber - 1]?.grade ?? 7;
        attempts.push(
          { grade, subject: result.subject, correct: result.player1Correct },
          { grade, subject: result.subject, correct: result.player2Correct }
        );
      }
    }

    return {
      completedBattles: battles.filter(battle => battle.status === "finished").length,
      attempts
    };
  }

  private findBattle(id: string, ownerId: string) {
    const battle = this.battles.get(id);
    if (!battle) throw new Error("Not found");
    if (battle.ownerId !== ownerId) throw new Error("Forbidden");
    return battle;
  }

  private publicBattle(battle: LocalBattle) {
    const isFinished = battle.status === "finished";
    const rawQuestion = !isFinished && battle.questionIndex < battle.questions.length
      ? getPublicQuestion(battle.questions[battle.questionIndex].id)
      : null;
    const activeMiniGame = getMiniGameForLevel(
      battle.miniGameMode,
      rawQuestion?.level ?? battle.lastResult?.level ?? 1
    );
    const currentQuestion = rawQuestion && activeMiniGame === "memory-logic"
      ? { ...rawQuestion, options: [] }
      : rawQuestion;

    const maximumScore = battle.questions.reduce((sum, q) => sum + q.points + 10, 0);

    return {
      id: battle.id,
      status: battle.status,
      gameMode: battle.miniGameMode,
      activeMiniGame,
      phase: battle.phase,
      winner: battle.winner,
      activePlayer: battle.activePlayer,
      questionNumber: Math.min(battle.questionIndex + 1, battle.questions.length),
      totalQuestions: battle.questions.length,
      level: currentQuestion?.level ?? (battle.lastResult?.level || 1),
      levelName: currentQuestion?.levelName ?? (battle.lastResult?.levelName || "Level 1: Novice"),
      progress: battle.questionIndex,
      question: currentQuestion,
      players: [
        {
          number: 1,
          name: battle.playerNames[0],
          score: battle.scores[0],
          hp: battle.hp[0],
          racePosition: battle.racePositions[0],
          submitted: battle.answers[0] !== null
        },
        {
          number: 2,
          name: battle.playerNames[1],
          score: battle.scores[1],
          hp: battle.hp[1],
          racePosition: battle.racePositions[1],
          submitted: battle.answers[1] !== null
        }
      ],
      scores: {
        player1: battle.scores[0],
        player2: battle.scores[1],
        maximum: maximumScore
      },
      lastResult: battle.lastResult,
      history: battle.history
    };
  }
}
