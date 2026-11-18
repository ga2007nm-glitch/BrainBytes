import assert from "node:assert/strict";
import test from "node:test";
import { OnlineMatchManager } from "../src/onlineMatch.js";
import {
  getQuestionIds,
  generateMatchQuestions,
  QUESTION_POOL
} from "../src/validator.js";

const expectedSubjectsByMode: Record<string, string[]> = {
  "mixed-arcade": ["math", "coding", "logic", "coding", "math"],
  "code-runner": ["coding", "coding", "coding", "coding", "coding"],
  "math-defense": ["math", "math", "math", "math", "math"],
  "memory-logic": ["logic", "logic", "logic", "logic", "logic"]
};

test("selects five grade- and mode-aligned questions with valid answers", () => {
  for (const grade of [7, 8, 9, 10, 11]) {
    for (const [mode, expectedSubjects] of Object.entries(expectedSubjectsByMode)) {
      const questions = generateMatchQuestions(grade, mode);

      assert.equal(questions.length, 5);
      assert.equal(new Set(questions.map(question => question.id)).size, 5);
      assert.deepEqual(questions.map(question => question.subject), expectedSubjects);
      assert.deepEqual(questions.map(question => question.level), [1, 2, 3, 4, 5]);
      assert.ok(questions.every(question => question.grade === grade));
      assert.ok(questions.every(question => question.options.includes(question.correctAnswer)));
    }
  }
});

test("excludes completed questions across game modes and grades", () => {
  const completed = generateMatchQuestions(7, "code-runner").map(question => question.id);
  const nextMatch = generateMatchQuestions(7, "code-runner", completed);
  const anotherDomain = generateMatchQuestions(7, "mixed-arcade", completed);

  assert.ok(nextMatch.every(question => !completed.includes(question.id)));
  assert.ok(anotherDomain.every(question => !completed.includes(question.id)));
});

test("provides at least 20 non-repeating matches per grade and game mode", () => {
  const prompts = QUESTION_POOL.map(question => question.prompt.trim().replace(/\s+/g, " ").toLowerCase());
  assert.equal(new Set(prompts).size, prompts.length);

  for (const grade of [7, 8, 9, 10, 11]) {
    for (const mode of Object.keys(expectedSubjectsByMode)) {
      const completed = new Set<string>();
      for (let matchNumber = 0; matchNumber < 20; matchNumber++) {
        const questions = generateMatchQuestions(grade, mode, [...completed]);
        assert.equal(questions.length, 5);
        for (const question of questions) {
          assert.ok(!completed.has(question.id));
          completed.add(question.id);
        }
      }
    }
  }
});

test("reports exhaustion instead of reusing completed questions", () => {
  assert.throws(
    () => generateMatchQuestions(7, "code-runner", getQuestionIds()),
    /No unused Coding questions remain/
  );
});

test("online invite matches exclude questions completed by either participant", () => {
  const manager = new OnlineMatchManager();
  const firstPlayerUsed = generateMatchQuestions(7, "code-runner").map(question => question.id);
  const secondPlayerUsed = generateMatchQuestions(7, "code-runner", firstPlayerUsed)
    .map(question => question.id);
  const created = manager.create("player-1", "One", "nova", 7, "code-runner", firstPlayerUsed);
  const joined = manager.join(
    "player-2",
    created.inviteCode,
    "Two",
    "kai",
    7,
    secondPlayerUsed
  );
  const completed = new Set([...firstPlayerUsed, ...secondPlayerUsed]);

  assert.equal(joined.status, "playing");
  assert.ok(joined.question);
  assert.ok(!completed.has(joined.question.id));
});

test("quick-match pairing updates the waiting match returned to the first player", () => {
  const manager = new OnlineMatchManager();
  const first = manager.quickMatch("player-1", "One", "nova", 7, "math-defense");
  const second = manager.quickMatch("player-2", "Two", "kai", 7, "math-defense");
  const firstPlayerView = manager.getMatch(first.id, "player-1");

  assert.equal(second.id, first.id);
  assert.equal(second.status, "playing");
  assert.equal(firstPlayerView.status, "playing");
});
