const STORAGE_KEY = "brainbytes.completedQuestionIds.v1";

export function getCompletedQuestionIds() {
  let stored;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error("Could not read completed-question history from this browser.");
  }

  if (!stored) return [];

  let questionIds;
  try {
    questionIds = JSON.parse(stored);
  } catch {
    throw new Error("Completed-question history is corrupted. Clear this browser's saved game progress to continue.");
  }

  if (!Array.isArray(questionIds) || questionIds.some(id => typeof id !== "string")) {
    throw new Error("Completed-question history has an invalid format. Clear this browser's saved game progress to continue.");
  }

  return [...new Set(questionIds)];
}

export function markCompletedQuestionIds(questionIds) {
  if (!Array.isArray(questionIds) || questionIds.some(id => typeof id !== "string")) {
    throw new Error("The backend did not return valid completed-question IDs.");
  }

  const completed = new Set(getCompletedQuestionIds());
  questionIds.forEach(id => completed.add(id));

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    throw new Error("Could not save completed-question history in this browser.");
  }
}
