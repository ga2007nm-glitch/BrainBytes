const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001")
  .replace(/\/+$/, "");
const SESSION_KEY = "brainbytes.practice.session.v1";

class BackendError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

async function requestJson(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error(`Could not reach the BrainBytes backend at ${API_BASE_URL}.`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The backend returned an invalid response.");
  }

  if (!response.ok) {
    throw new BackendError(
      payload.error || `Backend request failed (${response.status}).`,
      response.status
    );
  }
  return payload;
}

async function getSession() {
  const saved = window.sessionStorage.getItem(SESSION_KEY);
  if (saved) {
    try {
      const session = JSON.parse(saved);
      if (typeof session.token === "string" && typeof session.playerId === "string") {
        return session;
      }
    } catch {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    window.sessionStorage.removeItem(SESSION_KEY);
  }

  const session = await requestJson("/session", { method: "POST" });
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

async function authenticatedRequest(path, method = "GET", body) {
  const send = (session) => {
    const headers = { Authorization: `Bearer ${session.token}` };
    const options = { method, headers };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    return requestJson(path, options);
  };

  let session = await getSession();
  try {
    return await send(session);
  } catch (error) {
    if (!(error instanceof BackendError) || error.status !== 401) throw error;
    window.sessionStorage.removeItem(SESSION_KEY);
    session = await getSession();
    return send(session);
  }
}

export function startPracticeBattle(grade = 7, gameMode = "mixed-arcade") {
  return authenticatedRequest("/practice/start", "POST", { grade, gameMode });
}

export function getPracticeBattle(battleId) {
  return authenticatedRequest(`/practice/${encodeURIComponent(battleId)}`);
}

export function submitPracticeAnswer(battleId, questionId, answer) {
  return authenticatedRequest(
    `/practice/${encodeURIComponent(battleId)}/answer`,
    "POST",
    { questionId, answer }
  );
}

export function startLocalPracticeBattle(player1Name, player2Name, gameMode = "mixed-arcade") {
  return authenticatedRequest("/local-practice/start", "POST", {
    player1Name,
    player2Name,
    gameMode
  });
}

export function submitLocalPracticeAnswer(
  battleId,
  playerNumber,
  questionId,
  answer
) {
  return authenticatedRequest(
    `/local-practice/${encodeURIComponent(battleId)}/answer`,
    "POST",
    { playerNumber, questionId, answer }
  );
}

export function continueLocalPracticeBattle(battleId) {
  return authenticatedRequest(
    `/local-practice/${encodeURIComponent(battleId)}/continue`,
    "POST",
    {}
  );
}

export function quickMatchOnline(name, portraitId, grade = 7, gameMode = "mixed-arcade") {
  return authenticatedRequest("/online-matches/quick-match", "POST", {
    name,
    portraitId,
    grade,
    gameMode
  });
}

export function createOnlineMatch(name, portraitId, grade = 7, gameMode = "mixed-arcade") {
  return authenticatedRequest("/online-matches/create", "POST", {
    name,
    portraitId,
    grade,
    gameMode
  });
}

export function joinOnlineMatch(inviteCode, name, portraitId, grade = 7) {
  return authenticatedRequest("/online-matches/join", "POST", {
    inviteCode,
    name,
    portraitId,
    grade
  });
}

export function getOnlineMatch(matchId) {
  return authenticatedRequest(`/online-matches/${encodeURIComponent(matchId)}`);
}

export function submitOnlineAnswer(matchId, questionId, answer, powerUp) {
  return authenticatedRequest(
    `/online-matches/${encodeURIComponent(matchId)}/answer`,
    "POST",
    { questionId, answer, powerUp }
  );
}

export async function getClassroomAnalytics() {
  const data = await authenticatedRequest("/analytics/classroom", "GET");
  const validPayload = data
    && typeof data.totalCompletedBattles === "number"
    && typeof data.totalAnswerAttempts === "number"
    && (typeof data.overallAccuracyPercent === "number" || data.overallAccuracyPercent === null)
    && Array.isArray(data.gradeBreakdowns)
    && data.gradeBreakdowns.every(cohort =>
      typeof cohort.grade === "number"
      && typeof cohort.label === "string"
      && typeof cohort.attempts === "number"
      && (typeof cohort.accuracyPercent === "number" || cohort.accuracyPercent === null)
      && Array.isArray(cohort.subjectBreakdowns)
      && cohort.subjectBreakdowns.every(subject =>
        typeof subject.subject === "string"
        && typeof subject.attempts === "number"
        && (typeof subject.accuracyPercent === "number" || subject.accuracyPercent === null)
      )
    );

  if (!validPayload) {
    throw new Error("The backend analytics API is outdated. Restart the backend and try again.");
  }
  return data;
}
