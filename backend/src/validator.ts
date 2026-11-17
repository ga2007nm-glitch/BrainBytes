
import { createHash, timingSafeEqual } from "node:crypto";

export type QuestionType =
  | "python"
  | "math"
  | "logic"
  | "debugging";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const questions: Question[] = [
  {
    id: "py-1",
    type: "python",
    prompt: "What is the output of: print(5 + 3 * 2)?",
    options: ["16", "11", "13", "8"],
    correctAnswer: "11",
    explanation: "Multiplication happens before addition."
  },
  {
    id: "math-1",
    type: "math",
    prompt: "What is 12 * 8?",
    options: ["86", "96", "108", "88"],
    correctAnswer: "96",
    explanation: "12 multiplied by 8 equals 96."
  },
  {
    id: "logic-1",
    type: "logic",
    prompt: "Complete the sequence: 2, 4, 8, 16, ?",
    options: ["18", "24", "32", "30"],
    correctAnswer: "32",
    explanation: "Each number is doubled."
  },
  {
    id: "debug-1",
    type: "debugging",
    prompt: "Which keyword correctly starts a Python function?",
    options: ["func", "define", "def", "function"],
    correctAnswer: "def",
    explanation: "Python uses the def keyword."
  }
];

export function getPublicQuestion(id: string) {
  const question = questions.find(q => q.id === id);
  if (!question) return null;

  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    options: question.options
  };
}

export function validateAnswer(
  questionId: string,
  submittedAnswer: string
): { correct: boolean; explanation: string } {
  const question = questions.find(q => q.id === questionId);
  if (!question) throw new Error("Question not found");

  if (typeof submittedAnswer !== "string" ||
      submittedAnswer.length > 200) {
    throw new Error("Invalid answer");
  }

  const normalize = (value: string) =>
    value.trim().normalize("NFKC");

  const actual = createHash("sha256")
    .update(normalize(submittedAnswer))
    .digest();

  const expected = createHash("sha256")
    .update(normalize(question.correctAnswer))
    .digest();

  return {
    correct: timingSafeEqual(actual, expected),
    explanation: question.explanation
  };
}

export function getQuestionIds(): string[] {
  return questions.map(q => q.id);
}
