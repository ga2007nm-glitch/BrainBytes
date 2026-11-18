import { randomBytes, randomUUID } from "node:crypto";
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

type OnlinePlayerNumber = 1 | 2;
type AvatarPresetId = "nova" | "kai";
export type TacticalPowerUp = "shield" | "overclock" | "byteHack";

export type OnlinePlayer = {
  id: string;
  name: string;
  portraitId: AvatarPresetId;
  grade: number; // 7, 8, 9, 10, 11
  score: number;
  hp: number; // 0 - 100
  racePosition: number; // 0 - 5
  shieldActive: boolean;
  overclockActive: boolean;
  powerUpsAvailable: {
    shield: boolean;
    overclock: boolean;
    byteHack: boolean;
  };
  isBot?: boolean;
};

export type OnlineRoundResult = {
  questionNumber: number;
  level: number;
  levelName: string;
  grade: number;
  subject: string;
  firstAnswerer: "player1" | "player2" | null;
  player1Correct: boolean;
  player2Correct: boolean;
  player1Points: number;
  player2Points: number;
  player1DamageDealt: number;
  player2DamageDealt: number;
  player1ShieldBlocked: boolean;
  player2ShieldBlocked: boolean;
  player1Hp: number;
  player2Hp: number;
  correctAnswer: string;
  explanation: string;
  roundWinner: "player1" | "player2" | "tie" | "both_missed";
};

type SubmittedAnswer = {
  answer: string;
  submittedAt: number;
  powerUpUsed?: TacticalPowerUp;
};

export type OnlineMatch = {
  id: string;
  code: string;
  grade: number;
  miniGameMode: MiniGameMode;
  players: [OnlinePlayer, OnlinePlayer | null];
  questions: Question[];
  answers: [SubmittedAnswer | null, SubmittedAnswer | null];
  questionIndex: number;
  questionStartedAt: number;
  status: "waiting" | "playing" | "finished";
  winner: "player1" | "player2" | "draw" | null;
  history: OnlineRoundResult[];
  lastResolvedResult: OnlineRoundResult | null;
};

function validateName(value: unknown): string {
  if (typeof value !== "string") throw new Error("Invalid player name");
  const name = value.trim();
  if (name.length < 1 || name.length > 20) {
    throw new Error("Invalid player name");
  }
  return name;
}

function validateAvatar(value: unknown): AvatarPresetId {
  if (value === "nova" || value === "kai") return value;
  return "nova";
}

function normalizeGrade(gradeValue: unknown): number {
  const g = Number(gradeValue);
  if (!Number.isFinite(g)) return 7;
  return g >= 11 ? 11 : Math.max(7, Math.min(10, Math.floor(g)));
}

const PEER_NAMES_BY_GRADE: Record<number, string[]> = {
  7: ["Rohan_Class7", "Ananya_7th", "Dev_Class7", "Priya_Grade7"],
  8: ["Aarav_Class8", "Sneha_Grade8", "Vikram_8th", "Tanvi_Coder8"],
  9: ["Kabir_Class9", "Diya_STEM9", "Arjun_Class9", "Rhea_Grade9"],
  10: ["Aryan_Class10", "Meera_10th", "Aditya_BoardPrep", "Isha_Class10"],
  11: ["Karthik_Senior", "Zoya_Advanced", "Siddharth_CS", "Tara_Calculus"]
};

export class OnlineMatchManager {
  private matches = new Map<string, OnlineMatch>();
  private matchIdsByCode = new Map<string, string>();
  private quickMatchQueue: { playerId: string; name: string; portraitId: AvatarPresetId; grade: number; miniGameMode: MiniGameMode; queuedAt: number }[] = [];

  create(playerId: string, name: unknown, portraitId: unknown, gradeInput?: unknown, gameModeInput?: unknown): ReturnType<OnlineMatchManager["publicMatch"]> {
    let code = "";
    do {
      code = randomBytes(4).toString("hex").toUpperCase();
    } while (this.matchIdsByCode.has(code));

    const grade = normalizeGrade(gradeInput);
    const miniGameMode = normalizeMiniGameMode(gameModeInput);
    const matchQuestions = generateMatchQuestions(grade);

    const match: OnlineMatch = {
      id: randomUUID(),
      code,
      grade,
      miniGameMode,
      players: [
        {
          id: playerId,
          name: validateName(name),
          portraitId: validateAvatar(portraitId),
          grade,
          score: 0,
          hp: 100,
          racePosition: 0,
          shieldActive: false,
          overclockActive: false,
          powerUpsAvailable: { shield: true, overclock: true, byteHack: true }
        },
        null
      ],
      questions: matchQuestions,
      answers: [null, null],
      questionIndex: 0,
      questionStartedAt: Date.now(),
      status: "waiting",
      winner: null,
      history: [],
      lastResolvedResult: null
    };

    this.matches.set(match.id, match);
    this.matchIdsByCode.set(code, match.id);
    return this.publicMatch(match, 1);
  }

  join(playerId: string, codeValue: unknown, name: unknown, portraitId: unknown, gradeInput?: unknown): ReturnType<OnlineMatchManager["publicMatch"]> {
    if (typeof codeValue !== "string") throw new Error("Not found");
    const code = codeValue.trim().toUpperCase();

    const matchId = this.matchIdsByCode.get(code);
    const match = matchId ? this.matches.get(matchId) : undefined;
    if (!match) throw new Error("Not found");
    if (match.status !== "waiting" || match.players[1]) {
      throw new Error("Match unavailable");
    }
    if (match.players[0].id === playerId) throw new Error("Already joined");

    const grade = normalizeGrade(gradeInput || match.grade);

    match.players[1] = {
      id: playerId,
      name: validateName(name),
      portraitId: validateAvatar(portraitId),
      grade,
      score: 0,
      hp: 100,
      racePosition: 0,
      shieldActive: false,
      overclockActive: false,
      powerUpsAvailable: { shield: true, overclock: true, byteHack: true }
    };
    match.status = "playing";
    match.questionStartedAt = Date.now();
    return this.publicMatch(match, 2);
  }

  quickMatch(playerId: string, nameValue: unknown, portraitIdValue: unknown, gradeInput?: unknown, gameModeInput?: unknown) {
    const name = validateName(nameValue);
    const portraitId = validateAvatar(portraitIdValue);
    const grade = normalizeGrade(gradeInput);
    const miniGameMode = normalizeMiniGameMode(gameModeInput);

    // Clean stale queue members (older than 20 seconds)
    const now = Date.now();
    this.quickMatchQueue = this.quickMatchQueue.filter(q => (now - q.queuedAt) < 20000 && q.playerId !== playerId);

    // Look for a peer in the exact same grade!
    const opponentIndex = this.quickMatchQueue.findIndex(
      q => q.grade === grade && q.miniGameMode === miniGameMode
    );
    if (opponentIndex !== -1) {
      const [opponent] = this.quickMatchQueue.splice(opponentIndex, 1);
      const matchQuestions = generateMatchQuestions(grade);
      const code = randomBytes(4).toString("hex").toUpperCase();

      const match: OnlineMatch = {
        id: randomUUID(),
        code,
        grade,
        miniGameMode,
        players: [
          {
            id: opponent.playerId,
            name: opponent.name,
            portraitId: opponent.portraitId,
            grade: opponent.grade,
            score: 0,
            hp: 100,
            racePosition: 0,
            shieldActive: false,
            overclockActive: false,
            powerUpsAvailable: { shield: true, overclock: true, byteHack: true }
          },
          {
            id: playerId,
            name,
            portraitId,
            grade,
            score: 0,
            hp: 100,
            racePosition: 0,
            shieldActive: false,
            overclockActive: false,
            powerUpsAvailable: { shield: true, overclock: true, byteHack: true }
          }
        ],
        questions: matchQuestions,
        answers: [null, null],
        questionIndex: 0,
        questionStartedAt: Date.now(),
        status: "playing",
        winner: null,
        history: [],
        lastResolvedResult: null
      };

      this.matches.set(match.id, match);
      this.matchIdsByCode.set(code, match.id);
      return this.publicMatch(match, 2);
    }

    // Otherwise, create a waiting match and queue this player under their grade
    const created = this.create(playerId, name, portraitId, grade, miniGameMode);
    this.quickMatchQueue.push({ playerId, name, portraitId, grade, miniGameMode, queuedAt: Date.now() });

    // Schedule auto-pairing with a live simulated grade-peer if no human in this grade joins within 2.2 seconds
    const matchId = created.id;
    setTimeout(() => {
      const match = this.matches.get(matchId);
      if (match && match.status === "waiting" && !match.players[1]) {
        this.quickMatchQueue = this.quickMatchQueue.filter(q => q.playerId !== playerId);
        const nameList = PEER_NAMES_BY_GRADE[grade] || PEER_NAMES_BY_GRADE[7];
        const botName = nameList[Math.floor(Math.random() * nameList.length)];

        match.players[1] = {
          id: `peer-${randomUUID().slice(0, 8)}`,
          name: botName,
          portraitId: "kai",
          grade,
          score: 0,
          hp: 100,
          racePosition: 0,
          shieldActive: false,
          overclockActive: false,
          powerUpsAvailable: { shield: true, overclock: true, byteHack: true },
          isBot: true
        };
        match.status = "playing";
        match.questionStartedAt = Date.now();
      }
    }, 2200);

    return created;
  }

  getMatch(id: string, playerId: string) {
    const match = this.findMatch(id);
    const playerNumber = this.getPlayerNumber(match, playerId);

    // If opponent is a bot and hasn't answered yet, simulate response after realistic delay
    if (match.status === "playing" && match.players[1]?.isBot && match.answers[1] === null) {
      const elapsed = Date.now() - match.questionStartedAt;
      const currentQ = match.questions[match.questionIndex];
      if (elapsed > 4000) {
        const accuracy = 0.5 + (0.05 * currentQ.level);
        const botAnswersCorrectly = Math.random() < accuracy;
        const mode = getMiniGameForLevel(match.miniGameMode, currentQ.level);
        const botAnswer = getMiniGameBotAnswer(currentQ.id, currentQ.level, mode, botAnswersCorrectly);
        match.answers[1] = {
          answer: botAnswer,
          submittedAt: match.questionStartedAt + 3500 + Math.random() * 2000
        };

        if (match.answers[0] !== null) {
          this.resolveQuestion(match);
        }
      }
    }

    return this.publicMatch(match, playerNumber);
  }

  submitAnswer(
    id: string,
    playerId: string,
    questionId: string,
    answer: string,
    powerUpUsed?: TacticalPowerUp
  ) {
    const match = this.findMatch(id);
    if (match.status !== "playing") throw new Error("Battle not active");

    const playerNumber = this.getPlayerNumber(match, playerId);
    const player = match.players[playerNumber - 1];
    const answerIndex = playerNumber - 1;
    if (match.answers[answerIndex] !== null) {
      throw new Error("Already submitted");
    }

    const currentQuestion = match.questions[match.questionIndex];
    if (questionId !== currentQuestion.id) throw new Error("Question changed");

    const activeMiniGame = getMiniGameForLevel(match.miniGameMode, currentQuestion.level);
    if (activeMiniGame !== "memory-logic" && !currentQuestion.options.includes(answer)) {
      throw new Error("Invalid answer");
    }
    if (typeof answer !== "string" || answer.length > 200) throw new Error("Invalid answer");

    // Apply power-up if activated
    if (powerUpUsed && player && player.powerUpsAvailable[powerUpUsed]) {
      player.powerUpsAvailable[powerUpUsed] = false;
      if (powerUpUsed === "shield") player.shieldActive = true;
      if (powerUpUsed === "overclock") player.overclockActive = true;
    }

    match.answers[answerIndex] = {
      answer,
      submittedAt: Date.now(),
      powerUpUsed
    };

    // If opponent is bot and hasn't answered, trigger response
    if (match.players[1]?.isBot && match.answers[1] === null) {
      const accuracy = 0.58;
      const botAnswersCorrectly = Math.random() < accuracy;
      const botAnswer = getMiniGameBotAnswer(
        currentQuestion.id,
        currentQuestion.level,
        activeMiniGame,
        botAnswersCorrectly
      );
      const isPlayerFaster = Math.random() < 0.72;
      const botDelay = isPlayerFaster ? 1400 : -600;
      match.answers[1] = {
        answer: botAnswer,
        submittedAt: Math.max(match.questionStartedAt, Date.now() + botDelay)
      };
    }

    if (match.answers.every(submittedAnswer => submittedAnswer !== null)) {
      this.resolveQuestion(match);
    }

    return this.publicMatch(match, playerNumber);
  }

  private resolveQuestion(match: OnlineMatch) {
    const currentQ = match.questions[match.questionIndex];
    const p1Sub = match.answers[0];
    const p2Sub = match.answers[1];

    if (!p1Sub || !p2Sub) return;

    const activeMiniGame = getMiniGameForLevel(match.miniGameMode, currentQ.level);
    const p1Result = validateMiniGameAnswer(currentQ.id, currentQ.level, activeMiniGame, p1Sub.answer);
    const p2Result = validateMiniGameAnswer(currentQ.id, currentQ.level, activeMiniGame, p2Sub.answer);

    const player1 = match.players[0];
    const player2 = match.players[1];
    if (!player2) return;

    let firstAnswerer: "player1" | "player2" | null = null;
    if (p1Sub.submittedAt < p2Sub.submittedAt) {
      firstAnswerer = "player1";
    } else if (p2Sub.submittedAt < p1Sub.submittedAt) {
      firstAnswerer = "player2";
    }

    let p1Points = 0;
    let p2Points = 0;
    let p1Damage = 0;
    let p2Damage = 0;
    let p1ShieldBlocked = false;
    let p2ShieldBlocked = false;
    let roundWinner: "player1" | "player2" | "tie" | "both_missed" = "both_missed";

    // Base damage and overclock check
    let p1DamagePower = currentQ.damage;
    if (player1.overclockActive) {
      p1DamagePower = Math.floor(p1DamagePower * 1.8);
      player1.overclockActive = false;
    }

    let p2DamagePower = currentQ.damage;
    if (player2.overclockActive) {
      p2DamagePower = Math.floor(p2DamagePower * 1.8);
      player2.overclockActive = false;
    }

    // Combat logic
    if (p1Result.correct && p2Result.correct) {
      if (firstAnswerer === "player1") {
        p1Points = currentQ.points + 5;
        p2Points = Math.floor(currentQ.points * 0.5);
        if (player2.shieldActive) {
          p2ShieldBlocked = true;
          player2.shieldActive = false;
        } else {
          p1Damage = p1DamagePower;
          player2.hp = Math.max(0, player2.hp - p1Damage);
        }
        player1.racePosition = Math.min(5, player1.racePosition + 1);
        roundWinner = "player1";
      } else {
        p2Points = currentQ.points + 5;
        p1Points = Math.floor(currentQ.points * 0.5);
        if (player1.shieldActive) {
          p1ShieldBlocked = true;
          player1.shieldActive = false;
        } else {
          p2Damage = p2DamagePower;
          player1.hp = Math.max(0, player1.hp - p2Damage);
        }
        player2.racePosition = Math.min(5, player2.racePosition + 1);
        roundWinner = "player2";
      }
    } else if (p1Result.correct && !p2Result.correct) {
      p1Points = currentQ.points + 10;
      if (player2.shieldActive) {
        p2ShieldBlocked = true;
        player2.shieldActive = false;
      } else {
        p1Damage = p1DamagePower + 5;
        player2.hp = Math.max(0, player2.hp - p1Damage);
      }
      player1.racePosition = Math.min(5, player1.racePosition + 1);
      roundWinner = "player1";
    } else if (!p1Result.correct && p2Result.correct) {
      p2Points = currentQ.points + 10;
      if (player1.shieldActive) {
        p1ShieldBlocked = true;
        player1.shieldActive = false;
      } else {
        p2Damage = p2DamagePower + 5;
        player1.hp = Math.max(0, player1.hp - p2Damage);
      }
      player2.racePosition = Math.min(5, player2.racePosition + 1);
      roundWinner = "player2";
    } else {
      roundWinner = "both_missed";
    }

    player1.score += p1Points;
    player2.score += p2Points;

    const roundSummary: OnlineRoundResult = {
      questionNumber: match.questionIndex + 1,
      level: currentQ.level,
      levelName: currentQ.levelName,
      grade: match.grade,
      subject: currentQ.subject,
      firstAnswerer,
      player1Correct: p1Result.correct,
      player2Correct: p2Result.correct,
      player1Points: p1Points,
      player2Points: p2Points,
      player1DamageDealt: p1Damage,
      player2DamageDealt: p2Damage,
      player1ShieldBlocked: p1ShieldBlocked,
      player2ShieldBlocked: p2ShieldBlocked,
      player1Hp: player1.hp,
      player2Hp: player2.hp,
      correctAnswer: activeMiniGame === "memory-logic"
        ? "Replay the complete signal sequence."
        : currentQ.correctAnswer,
      explanation: p1Result.explanation,
      roundWinner
    };

    match.history.push(roundSummary);
    match.lastResolvedResult = roundSummary;

    match.questionIndex++;
    match.answers = [null, null];
    match.questionStartedAt = Date.now();

    if (match.questionIndex >= match.questions.length || player1.hp === 0 || player2.hp === 0) {
      match.status = "finished";
      if (player1.hp === 0 && player2.hp > 0) {
        match.winner = "player2";
      } else if (player2.hp === 0 && player1.hp > 0) {
        match.winner = "player1";
      } else {
        match.winner = player1.score === player2.score
          ? "draw"
          : player1.score > player2.score
            ? "player1"
            : "player2";
      }
    }
  }

  private findMatch(id: string) {
    const match = this.matches.get(id);
    if (!match) throw new Error("Not found");
    return match;
  }

  private getPlayerNumber(match: OnlineMatch, playerId: string): OnlinePlayerNumber {
    if (match.players[0].id === playerId) return 1;
    if (match.players[1]?.id === playerId) return 2;
    throw new Error("Forbidden");
  }

  public publicMatch(match: OnlineMatch, playerNumber: OnlinePlayerNumber) {
    const isFinished = match.status === "finished";
    const phase = match.status === "waiting"
      ? "waiting_for_opponent"
      : isFinished
        ? "finished"
        : match.answers[playerNumber - 1] !== null
          ? "waiting_for_opponent_answer"
          : "question";

    const rawQuestion = match.status === "playing" && match.questionIndex < match.questions.length
      ? getPublicQuestion(match.questions[match.questionIndex].id)
      : null;
    const currentLevel = rawQuestion?.level ?? match.lastResolvedResult?.level ?? 1;
    const activeMiniGame = getMiniGameForLevel(match.miniGameMode, currentLevel);
    const currentQuestion = rawQuestion && activeMiniGame === "memory-logic"
      ? { ...rawQuestion, options: [] }
      : rawQuestion;

    const maximumScore = match.questions.reduce((acc, q) => acc + q.points + 10, 0);

    return {
      id: match.id,
      inviteCode: match.code,
      grade: match.grade,
      gameMode: match.miniGameMode,
      activeMiniGame,
      status: match.status,
      phase,
      winner: match.winner,
      playerNumber,
      questionNumber: Math.min(match.questionIndex + 1, match.questions.length),
      totalQuestions: match.questions.length,
      level: currentQuestion?.level ?? (match.lastResolvedResult?.level || 1),
      levelName: currentQuestion?.levelName ?? (match.lastResolvedResult?.levelName || "Level 1: Novice"),
      progress: match.questionIndex,
      question: phase === "question" ? currentQuestion : null,
      questionStartedAt: match.questionStartedAt,
      players: match.players.map((player, index) => ({
        number: index + 1,
        name: player?.name ?? "Searching online...",
        portraitId: player?.portraitId ?? null,
        grade: player?.grade ?? match.grade,
        score: player?.score ?? 0,
        hp: player?.hp ?? 100,
        racePosition: player?.racePosition ?? 0,
        shieldActive: player?.shieldActive ?? false,
        overclockActive: player?.overclockActive ?? false,
        powerUpsAvailable: player?.powerUpsAvailable ?? { shield: true, overclock: true, byteHack: true },
        submitted: match.answers[index] !== null
      })),
      scores: {
        player1: match.players[0].score,
        player2: match.players[1]?.score ?? 0,
        maximum: maximumScore
      },
      lastResult: match.lastResolvedResult,
      history: match.history
    };
  }
}
