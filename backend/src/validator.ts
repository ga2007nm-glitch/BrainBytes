import { createHash, timingSafeEqual } from "node:crypto";

export type QuestionSubject = "math" | "science" | "logic" | "coding";

export interface Question {
  id: string;
  grade: number; // 7, 8, 9, 10, 11 (11 represents 11-12 & Advanced)
  level: number; // 1 to 5 (difficulty within that grade)
  levelName: string;
  subject: QuestionSubject;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
  damage: number;
}

export const LEVEL_NAMES = [
  "Level 1: Novice (Easy)",
  "Level 2: Apprentice (Medium)",
  "Level 3: Challenger (Intermediate)",
  "Level 4: Master (Advanced)",
  "Level 5: Grandmaster (Expert)"
] as const;

export const AVAILABLE_GRADES = [
  { grade: 7, label: "Class 7", description: "Integers, Basic Equations, Angles & Intro Logic" },
  { grade: 8, label: "Class 8", description: "Rational Numbers, Powers, Square Roots & Coding Basics" },
  { grade: 9, label: "Class 9", description: "Polynomials, Coordinate Geometry, Motion & Algorithms" },
  { grade: 10, label: "Class 10", description: "Quadratics, Trigonometry, Electricity & Data Structures" },
  { grade: 11, label: "Class 11-12 & Advanced", description: "Calculus, Permutations, Physics & High-Level CS" }
];

export const QUESTION_POOL: Question[] = [
  // ==========================================
  // CLASS 7 QUESTIONS
  // ==========================================
  {
    id: "g7-l1-01",
    grade: 7,
    level: 1,
    levelName: LEVEL_NAMES[0],
    subject: "math",
    prompt: "What is the value of: (-8) + 15 − (-5)?",
    options: ["12", "2", "28", "-12"],
    correctAnswer: "12",
    explanation: "Subtracting a negative number is equivalent to adding: (-8) + 15 = 7, then 7 − (-5) = 7 + 5 = 12.",
    points: 10,
    damage: 20
  },
  {
    id: "g7-l1-02",
    grade: 7,
    level: 1,
    levelName: LEVEL_NAMES[0],
    subject: "math",
    prompt: "What is 3/4 of 120?",
    options: ["90", "80", "100", "60"],
    correctAnswer: "90",
    explanation: "(3/4) × 120 = 3 × (120 / 4) = 3 × 30 = 90.",
    points: 10,
    damage: 20
  },
  {
    id: "g7-l2-01",
    grade: 7,
    level: 2,
    levelName: LEVEL_NAMES[1],
    subject: "math",
    prompt: "Solve for x: 3x + 7 = 28.",
    options: ["7", "8", "6", "9"],
    correctAnswer: "7",
    explanation: "Subtract 7 from both sides: 3x = 21. Divide by 3: x = 7.",
    points: 15,
    damage: 22
  },
  {
    id: "g7-l2-02",
    grade: 7,
    level: 2,
    levelName: LEVEL_NAMES[1],
    subject: "science",
    prompt: "Two angles on a straight line are supplementary. If one angle is 65°, what is the other?",
    options: ["115°", "125°", "105°", "25°"],
    correctAnswer: "115°",
    explanation: "Angles on a straight line add up to 180°. Other angle = 180° − 65° = 115°.",
    points: 15,
    damage: 22
  },
  {
    id: "g7-l3-01",
    grade: 7,
    level: 3,
    levelName: LEVEL_NAMES[2],
    subject: "coding",
    prompt: "In Python, what is the output of: print('Code' * 3)?",
    options: ["CodeCodeCode", "Code 3", "Code*3", "Error"],
    correctAnswer: "CodeCodeCode",
    explanation: "In Python, multiplying a string by an integer repeats the string that many times.",
    points: 20,
    damage: 25
  },
  {
    id: "g7-l3-02",
    grade: 7,
    level: 3,
    levelName: LEVEL_NAMES[2],
    subject: "math",
    prompt: "A triangle has angles in the ratio 2:3:4. What is the measure of the largest angle?",
    options: ["80°", "60°", "90°", "100°"],
    correctAnswer: "80°",
    explanation: "Total parts = 2 + 3 + 4 = 9 parts = 180°. Each part = 20°. Largest angle = 4 × 20° = 80°.",
    points: 20,
    damage: 25
  },
  {
    id: "g7-l4-01",
    grade: 7,
    level: 4,
    levelName: LEVEL_NAMES[3],
    subject: "math",
    prompt: "Calculate the Simple Interest on $500 at 6% per annum for 3 years.",
    options: ["$90", "$80", "$100", "$60"],
    correctAnswer: "$90",
    explanation: "Simple Interest = (P × R × T) / 100 = (500 × 6 × 3) / 100 = 9000 / 100 = $90.",
    points: 25,
    damage: 30
  },
  {
    id: "g7-l4-02",
    grade: 7,
    level: 4,
    levelName: LEVEL_NAMES[3],
    subject: "science",
    prompt: "A car travels 180 km in 3 hours. What is its average speed in m/s?",
    options: ["16.67 m/s", "60 m/s", "20 m/s", "15 m/s"],
    correctAnswer: "16.67 m/s",
    explanation: "Speed in km/h = 180 / 3 = 60 km/h. To convert to m/s, multiply by 5/18: 60 × (5/18) = 16.67 m/s.",
    points: 25,
    damage: 30
  },
  {
    id: "g7-l5-01",
    grade: 7,
    level: 5,
    levelName: LEVEL_NAMES[4],
    subject: "logic",
    prompt: "A train 100 meters long passes an electric pole in 5 seconds. What is the speed of the train in km/h?",
    options: ["72 km/h", "50 km/h", "60 km/h", "80 km/h"],
    correctAnswer: "72 km/h",
    explanation: "Speed in m/s = Distance / Time = 100 / 5 = 20 m/s. Convert to km/h by multiplying by 18/5: 20 × (18/5) = 72 km/h.",
    points: 30,
    damage: 35
  },
  {
    id: "g7-l5-02",
    grade: 7,
    level: 5,
    levelName: LEVEL_NAMES[4],
    subject: "coding",
    prompt: "What will this Python code output? x = [10, 20, 30]; x.append(40); print(len(x))",
    options: ["4", "3", "40", "Error"],
    correctAnswer: "4",
    explanation: "The list initially has 3 elements. x.append(40) adds a fourth element, so len(x) returns 4.",
    points: 30,
    damage: 35
  },

  // ==========================================
  // CLASS 8 QUESTIONS
  // ==========================================
  {
    id: "g8-l1-01",
    grade: 8,
    level: 1,
    levelName: LEVEL_NAMES[0],
    subject: "math",
    prompt: "What is the square root of 1.44?",
    options: ["1.2", "0.12", "12", "1.4"],
    correctAnswer: "1.2",
    explanation: "Since 12 × 12 = 144, 1.2 × 1.2 = 1.44. So √(1.44) = 1.2.",
    points: 10,
    damage: 20
  },
  {
    id: "g8-l2-01",
    grade: 8,
    level: 2,
    levelName: LEVEL_NAMES[1],
    subject: "math",
    prompt: "Solve the linear equation: 5x − 8 = 2x + 13.",
    options: ["7", "6", "8", "5"],
    correctAnswer: "7",
    explanation: "Subtract 2x from both sides: 3x − 8 = 13. Add 8: 3x = 21. Divide by 3: x = 7.",
    points: 15,
    damage: 22
  },
  {
    id: "g8-l3-01",
    grade: 8,
    level: 3,
    levelName: LEVEL_NAMES[2],
    subject: "math",
    prompt: "What is the value of (2⁻³ × 4²)?",
    options: ["2", "1", "4", "1/2"],
    correctAnswer: "2",
    explanation: "2⁻³ = 1/8. 4² = 16. (1/8) × 16 = 2.",
    points: 20,
    damage: 25
  },
  {
    id: "g8-l3-02",
    grade: 8,
    level: 3,
    levelName: LEVEL_NAMES[2],
    subject: "coding",
    prompt: "In Python, what is the output of: [i for i in range(5) if i % 2 == 0]?",
    options: ["[0, 2, 4]", "[2, 4]", "[1, 3]", "[0, 1, 2, 3, 4]"],
    correctAnswer: "[0, 2, 4]",
    explanation: "range(5) generates 0, 1, 2, 3, 4. The filter 'if i % 2 == 0' selects numbers divisible by 2: 0, 2, and 4.",
    points: 20,
    damage: 25
  },
  {
    id: "g8-l4-01",
    grade: 8,
    level: 4,
    levelName: LEVEL_NAMES[3],
    subject: "math",
    prompt: "A sum of $1,000 is invested at 10% compound interest per year for 2 years. What is the total amount?",
    options: ["$1,210", "$1,200", "$1,150", "$1,300"],
    correctAnswer: "$1,210",
    explanation: "A = P(1 + r/100)ⁿ = 1000 × (1.1)² = 1000 × 1.21 = $1,210.",
    points: 25,
    damage: 30
  },
  {
    id: "g8-l5-01",
    grade: 8,
    level: 5,
    levelName: LEVEL_NAMES[4],
    subject: "logic",
    prompt: "A cube of side 4 cm is painted red on all sides and cut into 1 cm unit cubes. How many unit cubes have NO sides painted?",
    options: ["8", "12", "16", "24"],
    correctAnswer: "8",
    explanation: "Cubes with no face painted form an inner cube of dimension (n − 2)³ = (4 − 2)³ = 2³ = 8 cubes.",
    points: 30,
    damage: 35
  },

  // ==========================================
  // CLASS 9 QUESTIONS
  // ==========================================
  {
    id: "g9-l1-01",
    grade: 9,
    level: 1,
    levelName: LEVEL_NAMES[0],
    subject: "math",
    prompt: "In which quadrant does the point (-4, 7) lie in the Cartesian plane?",
    options: ["Quadrant II", "Quadrant I", "Quadrant III", "Quadrant IV"],
    correctAnswer: "Quadrant II",
    explanation: "In Quadrant II, x-coordinates are negative and y-coordinates are positive.",
    points: 10,
    damage: 20
  },
  {
    id: "g9-l2-01",
    grade: 9,
    level: 2,
    levelName: LEVEL_NAMES[1],
    subject: "math",
    prompt: "Expand and simplify: (x + 3)(x − 5).",
    options: ["x² − 2x − 15", "x² + 2x − 15", "x² − 15", "x² − 8x − 15"],
    correctAnswer: "x² − 2x − 15",
    explanation: "Using FOIL: x² − 5x + 3x − 15 = x² − 2x − 15.",
    points: 15,
    damage: 22
  },
  {
    id: "g9-l3-01",
    grade: 9,
    level: 3,
    levelName: LEVEL_NAMES[2],
    subject: "science",
    prompt: "An object of mass 5 kg accelerates at 4 m/s². What is the net force acting on it?",
    options: ["20 N", "1.25 N", "9 N", "25 N"],
    correctAnswer: "20 N",
    explanation: "According to Newton's Second Law, Force F = m × a = 5 kg × 4 m/s² = 20 Newtons.",
    points: 20,
    damage: 25
  },
  {
    id: "g9-l4-01",
    grade: 9,
    level: 4,
    levelName: LEVEL_NAMES[3],
    subject: "math",
    prompt: "If the radius of a sphere is doubled, by what factor does its volume increase?",
    options: ["8 times", "4 times", "2 times", "16 times"],
    correctAnswer: "8 times",
    explanation: "Volume of a sphere V ∝ r³. If r becomes 2r, the new volume is (2r)³ = 8r³, so it increases by 8 times.",
    points: 25,
    damage: 30
  },
  {
    id: "g9-l5-01",
    grade: 9,
    level: 5,
    levelName: LEVEL_NAMES[4],
    subject: "coding",
    prompt: "What is the time complexity to find an element in an unsorted list of size N?",
    options: ["O(N)", "O(1)", "O(log N)", "O(N²)"],
    correctAnswer: "O(N)",
    explanation: "In an unsorted list, in the worst case you must inspect each element one by one (Linear Search), which takes O(N) time.",
    points: 30,
    damage: 35
  },

  // ==========================================
  // CLASS 10 QUESTIONS
  // ==========================================
  {
    id: "g10-l1-01",
    grade: 10,
    level: 1,
    levelName: LEVEL_NAMES[0],
    subject: "math",
    prompt: "If the HCF of two numbers is 6 and their product is 180, what is their LCM?",
    options: ["30", "60", "20", "15"],
    correctAnswer: "30",
    explanation: "Product of two numbers = HCF × LCM. Therefore, LCM = 180 / 6 = 30.",
    points: 10,
    damage: 20
  },
  {
    id: "g10-l2-01",
    grade: 10,
    level: 2,
    levelName: LEVEL_NAMES[1],
    subject: "math",
    prompt: "What are the roots of the quadratic equation: x² − 9x + 20 = 0?",
    options: ["4 and 5", "−4 and −5", "2 and 10", "1 and 20"],
    correctAnswer: "4 and 5",
    explanation: "(x − 4)(x − 5) = 0. The roots are x = 4 and x = 5.",
    points: 15,
    damage: 22
  },
  {
    id: "g10-l3-01",
    grade: 10,
    level: 3,
    levelName: LEVEL_NAMES[2],
    subject: "math",
    prompt: "What is the exact value of: sin²(30°) + cos²(30°)?",
    options: ["1", "0.5", "√3/2", "0"],
    correctAnswer: "1",
    explanation: "By the fundamental trigonometric identity, sin²(θ) + cos²(θ) = 1 for any angle θ.",
    points: 20,
    damage: 25
  },
  {
    id: "g10-l3-02",
    grade: 10,
    level: 3,
    levelName: LEVEL_NAMES[2],
    subject: "science",
    prompt: "According to Ohm's Law, if a 12V battery is connected across a 4Ω resistor, what is the current?",
    options: ["3 A", "48 A", "0.33 A", "8 A"],
    correctAnswer: "3 A",
    explanation: "V = I × R => I = V / R = 12 / 4 = 3 Amperes.",
    points: 20,
    damage: 25
  },
  {
    id: "g10-l4-01",
    grade: 10,
    level: 4,
    levelName: LEVEL_NAMES[3],
    subject: "math",
    prompt: "What is the 10th term of the Arithmetic Progression (AP): 3, 7, 11, 15...?",
    options: ["39", "43", "35", "40"],
    correctAnswer: "39",
    explanation: "First term a = 3, common difference d = 4. a₁₀ = a + (10 − 1)d = 3 + 9(4) = 3 + 36 = 39.",
    points: 25,
    damage: 30
  },
  {
    id: "g10-l5-01",
    grade: 10,
    level: 5,
    levelName: LEVEL_NAMES[4],
    subject: "coding",
    prompt: "Which data structure is optimal for evaluating postfix mathematical expressions?",
    options: ["Stack", "Queue", "Binary Tree", "Hash Map"],
    correctAnswer: "Stack",
    explanation: "Postfix evaluation uses a Stack (LIFO) because operators act on the most recently parsed operands.",
    points: 30,
    damage: 35
  },

  // ==========================================
  // CLASS 11-12 & ADVANCED / CODING
  // ==========================================
  {
    id: "g11-l1-01",
    grade: 11,
    level: 1,
    levelName: LEVEL_NAMES[0],
    subject: "math",
    prompt: "What is the derivative of f(x) = 4x³ − 5x + 7 with respect to x?",
    options: ["12x² − 5", "12x² + 7", "4x² − 5", "12x³ − 5"],
    correctAnswer: "12x² − 5",
    explanation: "Using the power rule: d/dx(4x³) = 12x², d/dx(-5x) = -5, d/dx(7) = 0. So f'(x) = 12x² − 5.",
    points: 10,
    damage: 20
  },
  {
    id: "g11-l2-01",
    grade: 11,
    level: 2,
    levelName: LEVEL_NAMES[1],
    subject: "math",
    prompt: "What is the value of i²⁴ where i = √(-1)?",
    options: ["1", "-1", "i", "-i"],
    correctAnswer: "1",
    explanation: "i⁴ = 1. Since 24 is a multiple of 4 (24 = 4 × 6), i²⁴ = (i⁴)⁶ = 1⁶ = 1.",
    points: 15,
    damage: 22
  },
  {
    id: "g11-l3-01",
    grade: 11,
    level: 3,
    levelName: LEVEL_NAMES[2],
    subject: "coding",
    prompt: "What is the output of this Python recursive function for fn(4)? def fn(n): return 1 if n <= 1 else n * fn(n-1)",
    options: ["24", "16", "10", "4"],
    correctAnswer: "24",
    explanation: "This is factorial 4! = 4 × 3 × 2 × 1 = 24.",
    points: 20,
    damage: 25
  },
  {
    id: "g11-l4-01",
    grade: 11,
    level: 4,
    levelName: LEVEL_NAMES[3],
    subject: "coding",
    prompt: "What is the average time complexity of QuickSort on an array of N elements?",
    options: ["O(N log N)", "O(N²)", "O(N)", "O(log N)"],
    correctAnswer: "O(N log N)",
    explanation: "On average, QuickSort divides the array into two halves at each recursive step, taking O(N log N) time.",
    points: 25,
    damage: 30
  },
  {
    id: "g11-l5-01",
    grade: 11,
    level: 5,
    levelName: LEVEL_NAMES[4],
    subject: "math",
    prompt: "How many 3-letter code words can be formed from the letters of 'MATHS' without repetition?",
    options: ["60", "120", "20", "15"],
    correctAnswer: "60",
    explanation: "Permutation of 5 distinct letters taken 3 at a time: ⁵P₃ = 5 × 4 × 3 = 60.",
    points: 30,
    damage: 35
  }
];

/**
 * Return 5 questions specifically tailored for the student's chosen class/grade.
 * Exactly one question from Level 1, Level 2, Level 3, Level 4, and Level 5.
 */
export function generateMatchQuestions(grade: number = 7): Question[] {
  // Normalize grade to known cohorts (7, 8, 9, 10, 11)
  const targetGrade = grade >= 11 ? 11 : Math.max(7, Math.min(10, grade));

  const matchQuestions: Question[] = [];

  for (let lvl = 1; lvl <= 5; lvl++) {
    // Look for questions matching this grade and difficulty level
    let candidates = QUESTION_POOL.filter(q => q.grade === targetGrade && q.level === lvl);

    // Fallback to any question of that level if specific grade pool is empty
    if (candidates.length === 0) {
      candidates = QUESTION_POOL.filter(q => q.level === lvl);
    }

    if (candidates.length > 0) {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      matchQuestions.push(candidates[randomIndex]);
    }
  }

  return matchQuestions;
}

export function getPublicQuestion(id: string) {
  const question = QUESTION_POOL.find(q => q.id === id);
  if (!question) return null;

  return {
    id: question.id,
    grade: question.grade,
    level: question.level,
    levelName: question.levelName,
    subject: question.subject,
    prompt: question.prompt,
    options: question.options,
    points: question.points,
    damage: question.damage
  };
}

export function validateAnswer(
  questionId: string,
  submittedAnswer: string
): { correct: boolean; explanation: string; points: number; damage: number } {
  const question = QUESTION_POOL.find(q => q.id === questionId);
  if (!question) throw new Error("Question not found");

  if (typeof submittedAnswer !== "string" || submittedAnswer.length > 200) {
    throw new Error("Invalid answer");
  }

  const normalize = (value: string) => value.trim().normalize("NFKC");
  const actual = createHash("sha256").update(normalize(submittedAnswer)).digest();
  const expected = createHash("sha256").update(normalize(question.correctAnswer)).digest();

  const correct = timingSafeEqual(actual, expected);

  return {
    correct,
    explanation: question.explanation,
    points: correct ? question.points : 0,
    damage: correct ? question.damage : 0
  };
}

export function getQuestionIds(): string[] {
  return QUESTION_POOL.map(q => q.id);
}

export function getPracticeBotAnswer(questionId: string, answerCorrectly: boolean): string {
  const question = QUESTION_POOL.find(q => q.id === questionId);
  if (!question) throw new Error("Question not found");

  if (answerCorrectly) return question.correctAnswer;

  const wrongOptions = question.options.filter(
    option => option !== question.correctAnswer
  );
  return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
}
