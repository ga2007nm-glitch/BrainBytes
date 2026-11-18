import { randomUUID } from "node:crypto";
import {
  generateMatchQuestions,
  getPublicQuestion,
  Question,
} from "./validator.js";
import {
  getMiniGameBotAnswer,
  getMiniGameForLevel,
  MiniGameMode,
  normalizeMiniGameMode,
  validateMiniGameAnswer
} from "./miniGames.js";

export type PracticeResult = {
  questionNumber: number;
  level: number;
  levelName: string;
  grade: number;
  subject: string;
  playerCorrect: boolean;
  botCorrect: boolean;
  playerFirst: boolean;
  playerPoints: number;
  botPoints: number;
  playerDamage: number;
  botDamage: number;
  playerHp: number;
  botHp: number;
  explanation: string;
  correctAnswer: string;
};

export type PracticeBattle = {
  id: string;
  playerId: string;
  grade: number;
  miniGameMode: MiniGameMode;
  questions: Question[];
  questionIndex: number;
  playerScore: number;
  botScore: number;
  playerHp: number;
  botHp: number;
  playerRacePosition: number;
  botRacePosition: number;
  status: "playing" | "finished";
  winner: "player" | "bot" | "draw" | null;
  history: PracticeResult[];
  lastResult: PracticeResult | null;
};

const botAccuracyByLevel = [0.4, 0.5, 0.55, 0.65, 0.7];

export class PracticeManager {
  private battles = new Map<string, PracticeBattle>();

  startBattle(playerId: string, gradeInput?: unknown, gameModeInput?: unknown) {
    const grade = Number(gradeInput) || 7;
    const miniGameMode = normalizeMiniGameMode(gameModeInput);
    const battleQuestions = generateMatchQuestions(grade);
    const battle: PracticeBattle = {
      id: randomUUID(),
      playerId,
      grade,
      miniGameMode,
      questions: battleQuestions,
      questionIndex: 0,
      playerScore: 0,
      botScore: 0,
      playerHp: 100,
      botHp: 100,
      playerRacePosition: 0,
      botRacePosition: 0,
      status: "playing",
      winner: null,
      history: [],
      lastResult: null
    };

    this.battles.set(battle.id, battle);
    return this.publicBattle(battle);
  }

  getBattle(id: string, playerId: string) {
    const battle = this.battles.get(id);
    if (!battle) throw new Error("Not found");
    if (battle.playerId !== playerId) throw new Error("Forbidden");
    return this.publicBattle(battle);
  }

  submitAnswer(
    battleId: string,
    playerId: string,
    questionId: string,
    answer: string
  ) {
    const battle = this.battles.get(battleId);
    if (!battle) throw new Error("Not found");
    if (battle.playerId !== playerId) throw new Error("Forbidden");
    if (battle.status !== "playing") throw new Error("Battle not active");

    const currentQuestion = battle.questions[battle.questionIndex];
    if (questionId !== currentQuestion.id) throw new Error("Question changed");

    const activeMiniGame = getMiniGameForLevel(battle.miniGameMode, currentQuestion.level);
    if (activeMiniGame !== "memory-logic" && !currentQuestion.options.includes(answer)) {
      throw new Error("Invalid answer");
    }

    if (typeof answer !== "string" || answer.length > 200) throw new Error("Invalid answer");
    const playerResult = validateMiniGameAnswer(currentQuestion.id, currentQuestion.level, activeMiniGame, answer);
    const botShouldAnswerCorrectly =
      Math.random() < botAccuracyByLevel[currentQuestion.level - 1];
    const botAnswer = getMiniGameBotAnswer(
      currentQuestion.id,
      currentQuestion.level,
      activeMiniGame,
      botShouldAnswerCorrectly
    );
    const botResult = validateMiniGameAnswer(currentQuestion.id, currentQuestion.level, activeMiniGame, botAnswer);

    const playerFirst = Math.random() < 0.68;

    let playerPoints = 0;
    let botPoints = 0;
    let playerDamage = 0;
    let botDamage = 0;

    if (playerResult.correct && botResult.correct) {
      if (playerFirst) {
        playerPoints = currentQuestion.points + 5;
        botPoints = Math.floor(currentQuestion.points * 0.5);
        playerDamage = currentQuestion.damage;
        battle.botHp = Math.max(0, battle.botHp - playerDamage);
        battle.playerRacePosition = Math.min(5, battle.playerRacePosition + 1);
      } else {
        botPoints = currentQuestion.points + 5;
        playerPoints = Math.floor(currentQuestion.points * 0.5);
        botDamage = currentQuestion.damage;
        battle.playerHp = Math.max(0, battle.playerHp - botDamage);
        battle.botRacePosition = Math.min(5, battle.botRacePosition + 1);
      }
    } else if (playerResult.correct && !botResult.correct) {
      playerPoints = currentQuestion.points + 10;
      playerDamage = currentQuestion.damage + 5;
      battle.botHp = Math.max(0, battle.botHp - playerDamage);
      battle.playerRacePosition = Math.min(5, battle.playerRacePosition + 1);
    } else if (!playerResult.correct && botResult.correct) {
      botPoints = currentQuestion.points + 10;
      botDamage = currentQuestion.damage + 5;
      battle.playerHp = Math.max(0, battle.playerHp - botDamage);
      battle.botRacePosition = Math.min(5, battle.botRacePosition + 1);
    }

    battle.playerScore += playerPoints;
    battle.botScore += botPoints;

    const roundResult: PracticeResult = {
      questionNumber: battle.questionIndex + 1,
      level: currentQuestion.level,
      levelName: currentQuestion.levelName,
      grade: battle.grade,
      subject: currentQuestion.subject,
      playerCorrect: playerResult.correct,
      botCorrect: botResult.correct,
      playerFirst,
      playerPoints,
      botPoints,
      playerDamage,
      botDamage,
      playerHp: battle.playerHp,
      botHp: battle.botHp,
      explanation: playerResult.explanation,
      correctAnswer: activeMiniGame === "memory-logic"
        ? "Replay the complete signal sequence."
        : currentQuestion.correctAnswer
    };

    battle.history.push(roundResult);
    battle.lastResult = roundResult;
    battle.questionIndex++;

    if (battle.questionIndex >= battle.questions.length || battle.playerHp === 0 || battle.botHp === 0) {
      battle.status = "finished";
      if (battle.playerHp === 0 && battle.botHp > 0) {
        battle.winner = "bot";
      } else if (battle.botHp === 0 && battle.playerHp > 0) {
        battle.winner = "player";
      } else {
        battle.winner =
          battle.playerScore === battle.botScore
            ? "draw"
            : battle.playerScore > battle.botScore
              ? "player"
              : "bot";
      }
    }

    return this.publicBattle(battle);
  }

  private publicBattle(battle: PracticeBattle) {
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
      grade: battle.grade,
      gameMode: battle.miniGameMode,
      activeMiniGame,
      status: battle.status,
      winner: battle.winner,
      questionNumber: Math.min(battle.questionIndex + 1, battle.questions.length),
      totalQuestions: battle.questions.length,
      level: currentQuestion?.level ?? (battle.lastResult?.level || 1),
      levelName: currentQuestion?.levelName ?? (battle.lastResult?.levelName || "Level 1: Novice"),
      progress: battle.questionIndex,
      question: currentQuestion,
      scores: {
        player: battle.playerScore,
        bot: battle.botScore,
        playerHp: battle.playerHp,
        botHp: battle.botHp,
        playerRacePosition: battle.playerRacePosition,
        botRacePosition: battle.botRacePosition,
        maximum: maximumScore
      },
      lastResult: battle.lastResult,
      history: battle.history
    };
  }
}
