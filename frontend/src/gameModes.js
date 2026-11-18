export const MINI_GAME_MODES = [
  { id: "mixed-arcade", name: "Mixed Arcade", description: "Rotate through all three mini-games." },
  { id: "code-runner", name: "Code Runner", description: "Pick the code gate and race onward." },
  { id: "math-defense", name: "Math Tower Defense", description: "Choose a defense to stop the incoming wave." },
  { id: "memory-logic", name: "Memory & Logic", description: "Memorize the signal and replay its pattern." }
];

export function getMemoryPattern(questionId, level) {
  let seed = 2166136261;
  for (const character of `${questionId}:${level}`) {
    seed ^= character.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }

  const sequence = [];
  const length = Math.min(6, level + 2);
  for (let index = 0; index < length; index += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    sequence.push((seed >>> 16) % 4);
  }
  return sequence;
}

export const MINI_GAME_LABELS = {
  "mixed-arcade": "Mixed Arcade",
  "code-runner": "Code Runner",
  "math-defense": "Math Tower Defense",
  "memory-logic": "Memory & Logic"
};
