export type LearningAttempt = {
  grade: number;
  subject: string;
  correct: boolean;
};

export type LearningAnalyticsSource = {
  completedBattles: number;
  attempts: LearningAttempt[];
};

export function buildLearningAnalytics(sources: LearningAnalyticsSource[]) {
  const grades = new Map<number, {
    attempts: number;
    correct: number;
    subjects: Map<string, { label: string; attempts: number; correct: number }>;
  }>();
  let totalAnswerAttempts = 0;
  let totalCorrect = 0;
  const totalCompletedBattles = sources.reduce(
    (total, source) => total + source.completedBattles,
    0
  );

  for (const source of sources) {
    for (const attempt of source.attempts) {
      const grade = Number.isFinite(attempt.grade) ? attempt.grade : 7;
      const subject = attempt.subject.trim() || "Uncategorized";
      let gradeStats = grades.get(grade);
      if (!gradeStats) {
        gradeStats = { attempts: 0, correct: 0, subjects: new Map() };
        grades.set(grade, gradeStats);
      }

      const subjectKey = subject.toLocaleLowerCase();
      let subjectStats = gradeStats.subjects.get(subjectKey);
      if (!subjectStats) {
        subjectStats = { label: subject, attempts: 0, correct: 0 };
        gradeStats.subjects.set(subjectKey, subjectStats);
      }

      gradeStats.attempts++;
      subjectStats.attempts++;
      totalAnswerAttempts++;
      if (attempt.correct) {
        gradeStats.correct++;
        subjectStats.correct++;
        totalCorrect++;
      }
    }
  }

  const accuracy = (correct: number, attempts: number) =>
    attempts > 0 ? Math.round((correct / attempts) * 100) : null;

  return {
    dataScope: "since-backend-start",
    totalCompletedBattles,
    totalAnswerAttempts,
    overallAccuracyPercent: accuracy(totalCorrect, totalAnswerAttempts),
    gradeBreakdowns: [...grades.entries()]
      .sort(([gradeA], [gradeB]) => gradeA - gradeB)
      .map(([grade, stats]) => ({
        grade,
        label: grade >= 11 ? "Class 11-12+" : `Class ${grade}`,
        attempts: stats.attempts,
        accuracyPercent: accuracy(stats.correct, stats.attempts),
        subjectBreakdowns: [...stats.subjects.entries()]
          .sort(([, a], [, b]) => b.attempts - a.attempts)
          .map(([, subjectStats]) => ({
            subject: subjectStats.label,
            attempts: subjectStats.attempts,
            accuracyPercent: accuracy(subjectStats.correct, subjectStats.attempts)
          }))
      }))
  };
}
