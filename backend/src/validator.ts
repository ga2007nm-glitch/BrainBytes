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

const CURATED_QUESTION_POOL: Question[] = [
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

const GENERATED_VARIANTS_PER_LEVEL = 20;
const POINTS_BY_LEVEL = [10, 15, 20, 25, 30];
const DAMAGE_BY_LEVEL = [20, 22, 25, 30, 35];

function choiceOptions(correctAnswer: string, alternatives: string[], seed: number) {
  const options = [...new Set([correctAnswer, ...alternatives])];
  while (options.length < 4) {
    options.push(`Not ${correctAnswer} (${options.length})`);
  }
  const shift = seed % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

function numericOptions(correctAnswer: number, seed: number) {
  return choiceOptions(
    String(correctAnswer),
    [
      String(correctAnswer + seed + 1),
      String(correctAnswer - seed - 1),
      String(correctAnswer + seed + 3)
    ],
    seed
  );
}

function makeGeneratedQuestion(
  grade: number,
  subject: QuestionSubject,
  level: number,
  variant: number
): Question {
  const seed = grade * 17 + level * 11 + variant * 7;
  let prompt: string;
  let correctAnswer: string;
  let options: string[];
  let explanation: string;

  if (subject === "math") {
    if (level === 1) {
      const first = grade + variant * 3;
      const second = variant + 2;
      const answer = first + second * 2;
      prompt = `Calculate ${first} + ${second} × 2.`;
      correctAnswer = String(answer);
      options = numericOptions(answer, seed);
      explanation = `Use order of operations: multiply first, so ${second} × 2 = ${second * 2}. Then add ${first}: ${first} + ${second * 2} = ${answer}.`;
    } else if (level === 2) {
      const answer = grade + variant + 2;
      const offset = variant + 3;
      const total = answer + offset;
      prompt = `Solve for x: x + ${offset} = ${total}.`;
      correctAnswer = String(answer);
      options = numericOptions(answer, seed);
      explanation = `Subtract ${offset} from both sides: x = ${total} − ${offset} = ${answer}.`;
    } else if (level === 3) {
      const percent = [10, 20, 25, 50][variant % 4];
      const whole = (grade + variant + 5) * 20;
      const answer = whole * percent / 100;
      prompt = `What is ${percent}% of ${whole}?`;
      correctAnswer = String(answer);
      options = numericOptions(answer, seed);
      explanation = `Convert the percentage to a decimal and multiply: ${percent}% = ${percent / 100}, then ${whole} × ${percent / 100} = ${answer}.`;
    } else if (level === 4) {
      const length = grade + variant + 5;
      const width = variant + 3;
      const answer = length * width;
      prompt = `A rectangle is ${length} cm long and ${width} cm wide. What is its area?`;
      correctAnswer = String(answer);
      options = numericOptions(answer, seed);
      explanation = `Area of a rectangle = length × width. Substitute the measurements: ${length} × ${width} = ${answer} cm².`;
    } else {
      const time = variant + 2;
      const speed = grade + variant + 3;
      const distance = speed * time;
      prompt = `A cyclist travels ${distance} km in ${time} hours. What is the average speed?`;
      correctAnswer = String(speed);
      options = numericOptions(speed, seed);
      explanation = `Average speed = distance ÷ time. Divide ${distance} km by ${time} hours: ${distance} ÷ ${time} = ${speed} km/h.`;
    }
  } else if (subject === "coding") {
    if (level === 1) {
      const first = grade * 10 + variant;
      const second = variant + 2;
      const answer = first + second;
      prompt = `What does this Python code print?\nvalue = ${first}\nvalue += ${second}\nprint(value)`;
      correctAnswer = String(answer);
      options = numericOptions(answer, seed);
      explanation = `The assignment starts value at ${first}. The += statement adds ${second}, so value becomes ${first} + ${second} = ${answer}.`;
    } else if (level === 2) {
      const initialCount = 2 + (variant % 3);
      const addedCount = 1 + (variant % 2);
      const firstItem = grade * 10 + variant;
      const initialItems = Array.from({ length: initialCount }, (_, index) => firstItem + index);
      const addedItems = Array.from({ length: addedCount }, (_, index) => firstItem + initialCount + index);
      const answer = initialCount + addedCount;
      prompt = `What does this Python code print?\nitems = [${initialItems.join(", ")}]\nitems.extend([${addedItems.join(", ")}])\nprint(len(items))`;
      correctAnswer = String(answer);
      options = numericOptions(answer, seed);
      explanation = `The list begins with ${initialCount} items. extend adds ${addedCount} more, so len(items) returns ${initialCount} + ${addedCount} = ${answer}.`;
    } else if (level === 3) {
      const start = grade * 10 + variant;
      const end = start + 3 + variant;
      let answer = 0;
      for (let number = start; number < end; number++) answer += number;
      prompt = `What does this Python loop print?\ntotal = 0\nfor number in range(${start}, ${end}):\n    total += number\nprint(total)`;
      correctAnswer = String(answer);
      options = numericOptions(answer, seed);
      explanation = `range(${start}, ${end}) includes ${start} through ${end - 1}. Add those values into total to get ${answer}.`;
    } else if (level === 4) {
      const divisor = 2 + (variant % 4);
      const value = grade * 10 + variant;
      const divisible = value % divisor === 0;
      prompt = `What does this Python condition print?\nvalue = ${value}\nif value % ${divisor} == 0:\n    print("yes")\nelse:\n    print("no")`;
      correctAnswer = divisible ? "yes" : "no";
      options = choiceOptions(correctAnswer, [divisible ? "no" : "yes", "0", "Error"], seed);
      explanation = `${value} ÷ ${divisor} ${divisible ? "has no remainder, so the condition is true and the code prints yes" : `leaves a remainder of ${value % divisor}, so the code prints no`}.`;
    } else {
      const start = grade * 5 + variant;
      const end = start + 8;
      const divisor = 2 + (variant % 3);
      const remainder = variant % divisor;
      const answer = `[${Array.from({ length: 8 }, (_, index) => start + index).filter(value => value % divisor === remainder).join(", ")}]`;
      const alternatives = [
        `[${Array.from({ length: 8 }, (_, index) => start + index).filter(value => value % divisor !== remainder).join(", ")}]`,
        "[]",
        `[${remainder}]`
      ];
      prompt = `What list is printed by this Python code?\nprint([n for n in range(${start}, ${end}) if n % ${divisor} == ${remainder}])`;
      correctAnswer = answer;
      options = choiceOptions(answer, alternatives, seed);
      explanation = `range(${start}, ${end}) produces integers from ${start} to ${end - 1}. Keep only values whose remainder after division by ${divisor} is ${remainder}; the resulting list is ${answer}.`;
    }
  } else if (level === 1) {
    const first = grade * 10 + variant;
    const step = variant + 2;
    const answer = first + step * 4;
    prompt = `Find the next number: ${first}, ${first + step}, ${first + step * 2}, ${first + step * 3}, __.`;
    correctAnswer = String(answer);
    options = numericOptions(answer, seed);
    explanation = `Each term increases by ${step}. Add ${step} to ${first + step * 3} to get ${answer}.`;
  } else if (level === 2) {
    const offset = grade * 10 + variant;
    const first = offset + 1;
    const terms = [first, first + 1, first + 2, first + 3].map(value => value * value + offset);
    const answer = (first + 4) * (first + 4) + offset;
    prompt = `Find the next number: ${terms.join(", ")}, __.`;
    correctAnswer = String(answer);
    options = numericOptions(answer, seed);
    explanation = `The terms are consecutive squares plus ${offset}: ${first}² + ${offset}, (${first + 1})² + ${offset}, and so on. The next is (${first + 4})² + ${offset} = ${answer}.`;
  } else if (level === 3) {
    const first = grade * 10 + variant + 1;
    const second = variant + 2;
    const terms = [first, second];
    for (let index = 0; index < 3; index++) terms.push(terms[terms.length - 1] + terms[terms.length - 2]);
    const answer = terms[terms.length - 1] + terms[terms.length - 2];
    prompt = `Find the next number in the sequence: ${terms.join(", ")}, __.`;
    correctAnswer = String(answer);
    options = numericOptions(answer, seed);
    explanation = `Starting with ${first} and ${second}, each new term is the sum of the previous two. The next value is ${terms[terms.length - 1]} + ${terms[terms.length - 2]} = ${answer}.`;
  } else if (level === 4) {
    const first = grade * 10 + variant;
    const step = variant + 1;
    const terms = [first];
    let difference = step;
    for (let index = 0; index < 4; index++) {
      terms.push(terms[terms.length - 1] + difference);
      difference++;
    }
    const answer = terms[terms.length - 1] + difference;
    prompt = `Find the next number: ${terms.join(", ")}, __.`;
    correctAnswer = String(answer);
    options = numericOptions(answer, seed);
    explanation = `The gaps grow by 1 each time: ${step}, ${step + 1}, ${step + 2}, ${step + 3}. The next gap is ${difference}, so ${terms[terms.length - 1]} + ${difference} = ${answer}.`;
  } else {
    const first = grade * 10 + variant + 2;
    const step = variant + 2;
    const second = first + step;
    const third = second * 2;
    const fourth = third + step;
    const fifth = fourth * 2;
    const answer = fifth + step;
    prompt = `Find the next number: ${first}, ${second}, ${third}, ${fourth}, ${fifth}, __.`;
    correctAnswer = String(answer);
    options = numericOptions(answer, seed);
    explanation = `The operations alternate: add ${step}, multiply by 2, add ${step}, multiply by 2. The next step is to add ${step}: ${fifth} + ${step} = ${answer}.`;
  }

  return {
    id: `generated-g${grade}-${subject}-l${level}-v${variant}`,
    grade,
    level,
    levelName: LEVEL_NAMES[level - 1],
    subject,
    prompt: `Class ${grade} challenge: ${prompt}`,
    options,
    correctAnswer,
    explanation,
    points: POINTS_BY_LEVEL[level - 1],
    damage: DAMAGE_BY_LEVEL[level - 1]
  };
}

const generatedQuestions: Question[] = [];
for (const grade of [7, 8, 9, 10, 11]) {
  for (const subject of ["math", "coding", "logic"] as const) {
    for (let level = 1; level <= 5; level++) {
      for (let variant = 0; variant < GENERATED_VARIANTS_PER_LEVEL; variant++) {
        generatedQuestions.push(makeGeneratedQuestion(grade, subject, level, variant));
      }
    }
  }
}

export const QUESTION_POOL: Question[] = [...CURATED_QUESTION_POOL, ...generatedQuestions];
const KNOWN_QUESTION_IDS = new Set(QUESTION_POOL.map(question => question.id));

const SUBJECT_BY_MINI_GAME: Record<string, QuestionSubject> = {
  "code-runner": "coding",
  "math-defense": "math",
  "memory-logic": "logic"
};
const MIXED_ARCADE_SUBJECTS: QuestionSubject[] = ["math", "coding", "logic", "coding", "math"];

function subjectForMode(mode: string, level: number): QuestionSubject {
  return mode === "mixed-arcade"
    ? MIXED_ARCADE_SUBJECTS[level - 1]
    : SUBJECT_BY_MINI_GAME[mode] || "math";
}

export function normalizeCompletedQuestionIds(value: unknown = []): string[] {
  if (!Array.isArray(value) || value.length > QUESTION_POOL.length) {
    throw new Error("Invalid completed question history");
  }
  if (value.some(id => typeof id !== "string" || id.length > 100)) {
    throw new Error("Invalid completed question history");
  }
  return [...new Set(value.filter((id: string) => KNOWN_QUESTION_IDS.has(id)))];
}

/**
 * Return five grade- and mode-aligned questions, excluding questions completed by this browser profile.
 */
export function generateMatchQuestions(
  gradeInput: number = 7,
  gameModeInput: string = "mixed-arcade",
  completedQuestionIdsInput: unknown = []
): Question[] {
  const grade = Number(gradeInput);
  const targetGrade = !Number.isFinite(grade)
    ? 7
    : grade >= 11
      ? 11
      : Math.max(7, Math.min(10, Math.floor(grade)));
  const gameMode = ["mixed-arcade", "code-runner", "math-defense", "memory-logic"].includes(gameModeInput)
    ? gameModeInput
    : "mixed-arcade";
  const completedQuestionIds = new Set(normalizeCompletedQuestionIds(completedQuestionIdsInput));

  const matchQuestions: Question[] = [];

  for (let level = 1; level <= 5; level++) {
    const subject = subjectForMode(gameMode, level);
    const candidates = QUESTION_POOL.filter(question =>
      question.grade === targetGrade
      && question.level === level
      && question.subject === subject
      && !completedQuestionIds.has(question.id)
    );

    if (candidates.length === 0) {
      const subjectName = subject[0].toUpperCase() + subject.slice(1);
      const modeName = gameMode === "mixed-arcade"
        ? "Mixed Arcade"
        : gameMode === "code-runner"
          ? "Code Runner"
          : gameMode === "math-defense"
            ? "Math Tower Defense"
            : "Memory & Logic";
      throw new Error(`No unused ${subjectName} questions remain for Class ${targetGrade} in ${modeName}.`);
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    matchQuestions.push(candidates[randomIndex]);
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
