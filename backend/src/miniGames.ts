import { getPracticeBotAnswer, QUESTION_POOL, validateAnswer } from "./validator.js";

export const MINI_GAME_MODES = [
  "mixed-arcade",
  "code-runner",
  "math-defense",
  "memory-logic"
] as const;

export type MiniGameMode = typeof MINI_GAME_MODES[number];

export function normalizeMiniGameMode(value: unknown): MiniGameMode {
  return MINI_GAME_MODES.includes(value as MiniGameMode)
    ? value as MiniGameMode
    : "mixed-arcade";
}

export function getMiniGameForLevel(mode: MiniGameMode, level: number): MiniGameMode {
  if (mode !== "mixed-arcade") return mode;
  const rotation: MiniGameMode[] = [
    "math-defense",
    "code-runner",
    "memory-logic",
    "code-runner",
    "math-defense"
  ];
  return rotation[Math.max(0, Math.min(rotation.length - 1, level - 1))];
}

export function getMemoryPattern(questionId: string, level: number): number[] {
  let seed = 2166136261;
  for (const character of `${questionId}:${level}`) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }

  const sequence: number[] = [];
  const length = Math.min(6, level + 2);
  for (let index = 0; index < length; index++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    sequence.push((seed >>> 16) % 4);
  }
  return sequence;
}

export function validateMiniGameAnswer(
  questionId: string,
  level: number,
  mode: MiniGameMode,
  submittedAnswer: string
) {
  if (mode !== "memory-logic") {
    return validateAnswer(questionId, submittedAnswer);
  }

  const question = QUESTION_POOL.find(item => item.id === questionId);
  if (!question) throw new Error("Question not found");
  if (typeof submittedAnswer !== "string" || submittedAnswer.length > 200) {
    throw new Error("Invalid answer");
  }

  let submittedSequence: unknown;
  try {
    submittedSequence = JSON.parse(submittedAnswer);
  } catch {
    throw new Error("Invalid answer");
  }

  const expected = getMemoryPattern(questionId, level);
  const correct = Array.isArray(submittedSequence)
    && submittedSequence.length === expected.length
    && submittedSequence.every((value, index) => value === expected[index]);

  return {
    correct,
    explanation: `The signal had ${expected.length} tiles and must be replayed from left to right. Group nearby tiles into smaller chunks, rehearse each chunk once, then join the chunks in order to reduce memory errors.`,
    points: correct ? question.points : 0,
    damage: correct ? question.damage : 0
  };
}

export function getMiniGameBotAnswer(
  questionId: string,
  level: number,
  mode: MiniGameMode,
  answerCorrectly: boolean
) {
  if (mode !== "memory-logic") {
    return getPracticeBotAnswer(questionId, answerCorrectly);
  }

  const expected = getMemoryPattern(questionId, level);
  if (answerCorrectly) return JSON.stringify(expected);
  const wrong = [...expected];
  wrong[wrong.length - 1] = (wrong[wrong.length - 1] + 1) % 4;
  return JSON.stringify(wrong);
}
