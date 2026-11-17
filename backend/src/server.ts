
import http from "node:http";
import { randomUUID } from "node:crypto";
import { MatchmakingQueue } from "./matchmaking.js";
import { calculateElo } from "./elo.js";
import { GameManager } from "./game.js";
import { getPublicQuestion } from "./validator.js";

const queue = new MatchmakingQueue();
const games = new GameManager();

const ratings = new Map<string, number>();
const settled = new Set<string>();
const matchTimers = new Map<string, ReturnType<typeof setTimeout>>();
const sessions = new Map<string, string>();

const PORT = Number(process.env.PORT || 3001);

function send(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

async function readBody(req: http.IncomingMessage): Promise<any> {
  let body = "";

  for await (const chunk of req) {
    body += chunk.toString();
    if (body.length > 10_000) throw new Error("Request too large");
  }

  return body ? JSON.parse(body) : {};
}

function authenticatedPlayer(req: http.IncomingMessage): string {
  const token = req.headers.authorization?.replace(/^Bearer /i, "");
  const playerId = token ? sessions.get(token) : undefined;
  if (!playerId) throw new Error("Unauthorized");
  return playerId;
}

function publicBattle(battle: NonNullable<ReturnType<typeof games.getBattle>>) {
  const questionId = games.getQuestionId(battle);
  const active = battle.status === "playing";

  return {
    id: battle.id,
    status: battle.status,
    winner: battle.winner,
    round: active ? Math.floor(battle.questionIndex / 3) + 1 : 3,
    questionNumber: battle.questionIndex + 1,
    questionEndsAt: active ? battle.questionStartedAt + 20_000 : null,
    question: active ? getPublicQuestion(questionId) : null,
    players: battle.players.map(p => ({
      id: p.id,
      hp: p.hp,
      submitted: p.submitted
    })),
    history: battle.history
  };
}

function settleBattle(battleId: string) {
  const battle = games.getBattle(battleId);
  if (!battle || battle.status !== "finished" || settled.has(battleId)) {
    return;
  }

  settled.add(battleId);
  const [p1, p2] = battle.players;
  const r1 = ratings.get(p1.id) ?? 1200;
  const r2 = ratings.get(p2.id) ?? 1200;

  const result = battle.winner === null ? "draw" :
    battle.winner === p1.id ? "player1" : "player2";

  const elo = calculateElo(r1, r2, result);
  ratings.set(p1.id, elo.player1NewRating);
  ratings.set(p2.id, elo.player2NewRating);
}

const QUESTION_DURATION_MS = 20_000;

function scheduleQuestion(battleId: string) {
  const previous = matchTimers.get(battleId);
  if (previous) clearTimeout(previous);

  const battle = games.getBattle(battleId);
  if (!battle) return;

  if (battle.status === "finished") {
    settleBattle(battleId);
    matchTimers.delete(battleId);
    return;
  }

  const currentIndex = battle.questionIndex;
  const delay = Math.max(0, battle.questionStartedAt + QUESTION_DURATION_MS - Date.now());

  const timer = setTimeout(() => {
    const current = games.getBattle(battleId);

    if (current?.status === "playing" && current.questionIndex === currentIndex) {
      games.resolveQuestion(battleId);
    }

    scheduleQuestion(battleId);
  }, delay);

  matchTimers.set(battleId, timer);
}

function createMatch(player1Id: string, player2Id: string) {
  const battle = games.createBattle(player1Id, player2Id);
  scheduleQuestion(battle.id);
  return battle;
}

function processWaitingQueue() {
  for (const pair of queue.matchWaitingPlayers()) {
    createMatch(pair.player1.id, pair.player2.id);
  }
}

// Check the waiting queue frequently so matches start with minimal delay.
setInterval(processWaitingQueue, 250);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const path = url.pathname;

    if (req.method === "GET" && path === "/health") {
      return send(res, 200, { status: "ok", game: "CODE DUELS" });
    }

    // Demo-only session creation. Replace with real login in production.
    if (req.method === "POST" && path === "/session") {
      const token = randomUUID();
      const playerId = randomUUID();
      sessions.set(token, playerId);
      ratings.set(playerId, 1200);
      return send(res, 201, { token, playerId, rating: 1200 });
    }

    const playerId = authenticatedPlayer(req);

    if (req.method === "POST" && path === "/queue/join") {
      const rating = ratings.get(playerId) ?? 1200;
      const match = queue.join(playerId, rating);

      if (match) {
        const battle = createMatch(match.player1.id, match.player2.id);
        return send(res, 200, {
          status: "matched",
          battleId: battle.id
        });
      }

      return send(res, 200, { status: "queued" });
    }

    if (req.method === "POST" && path === "/queue/leave") {
      queue.leave(playerId);
      return send(res, 200, { status: "left" });
    }

    if (req.method === "GET" && path === "/profile") {
      return send(res, 200, {
        playerId,
        rating: ratings.get(playerId) ?? 1200
      });
    }

    if (req.method === "GET" && path === "/battles") {
      return send(res, 200, {
        // Starter implementation: no battle listing yet.
        message: "Use your battle ID to view a match"
      });
    }

    const battleMatch = path.match(/^\/battles\/([^/]+)$/);
    if (req.method === "GET" && battleMatch) {
      const battle = games.getBattle(battleMatch[1]);
      if (!battle) return send(res, 404, { error: "Not found" });
      if (!battle.players.some(p => p.id === playerId)) {
        return send(res, 403, { error: "Forbidden" });
      }
      return send(res, 200, publicBattle(battle));
    }

    const answerMatch = path.match(/^\/battles\/([^/]+)\/answer$/);
    if (req.method === "POST" && answerMatch) {
      const body = await readBody(req);
      const battle = games.getBattle(answerMatch[1]);

      if (!battle) return send(res, 404, { error: "Not found" });
      if (!battle.players.some(p => p.id === playerId)) {
        return send(res, 403, { error: "Forbidden" });
      }

      const result = games.submitAnswer(
        battle.id,
        playerId,
        body.answer
      );

      if (battle.status === "finished") {
        settleBattle(battle.id);
      } else {
        scheduleQuestion(battle.id);
      }

      return send(res, 200, result);
    }

    return send(res, 404, { error: "Route not found" });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 :
      message === "Forbidden" ? 403 :
      message === "Request too large" ? 413 :
      message === "Invalid answer" ? 400 :
      message === "Invalid player" ? 400 :
      message === "Already submitted" ? 409 :
      message === "Question time expired" ? 409 :
      message === "Battle not active" ? 409 : 400;

    send(res, status, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`CODE DUELS backend running on http://localhost:${PORT}`);
});
