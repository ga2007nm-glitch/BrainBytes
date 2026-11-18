
import { randomUUID } from "node:crypto";
import { getQuestionIds, validateAnswer } from "./validator.js";

export interface PlayerState {
  id: string;
  hp: number;
  correctAt?: number;
  submitted: boolean;
}

export interface Battle {
  id: string;
  players: [PlayerState, PlayerState];
  questionIndex: number;
  questionStartedAt: number;
  status: "playing" | "finished";
  winner: string | null;
  history: unknown[];
}

export class GameManager {
  private battles = new Map<string, Battle>();
  private questionIds = getQuestionIds();
  private readonly questionDuration = 20_000;
  private readonly totalQuestions = 10;

  createBattle(player1Id: string, player2Id: string): Battle {
    if (player1Id === player2Id) {
      throw new Error("Players must be different");
    }

    const battle: Battle = {
      id: randomUUID(),
      players: [
        { id: player1Id, hp: 100, submitted: false },
        { id: player2Id, hp: 100, submitted: false }
      ],
      questionIndex: 0,
      questionStartedAt: Date.now(),
      status: "playing",
      winner: null,
      history: []
    };

    this.battles.set(battle.id, battle);
    return battle;
  }

  getBattle(id: string): Battle | undefined {
    return this.battles.get(id);
  }

  getQuestionId(battle: Battle): string {
    return this.questionIds[
      battle.questionIndex % this.questionIds.length
    ];
  }

  submitAnswer(
    battleId: string,
    playerId: string,
    answer: string
  ) {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== "playing") {
      throw new Error("Battle not active");
    }

    const player = battle.players.find(p => p.id === playerId);
    if (!player) throw new Error("Player not in battle");
    if (player.submitted) throw new Error("Already submitted");

    const now = Date.now();
    if (now >= battle.questionStartedAt + this.questionDuration) {
      this.resolveQuestion(battleId);
      throw new Error("Question time expired");
    }

    const result = validateAnswer(this.getQuestionId(battle), answer);

    player.submitted = true;
    if (result.correct) player.correctAt = now;

    // Do not reveal correctness or explanations until resolution.
    if (battle.players.every(p => p.submitted)) {
      this.resolveQuestion(battleId);
    }

    return { accepted: true };
  }

  resolveQuestion(battleId: string) {
    const battle = this.battles.get(battleId);
    if (!battle || battle.status !== "playing") return null;

    const players = battle.players;
    const playerById = new Map(players.map(player => [player.id, player]));
    const correctPlayers = players
      .filter(player => player.correctAt !== undefined)
      .sort((a, b) => a.correctAt! - b.correctAt!);

    const attacks: Array<{
      attacker: string;
      defender: string;
      damage: number;
    }> = [];

    for (const [index, attacker] of correctPlayers.entries()) {
      const defenderId = attacker.id === players[0].id ? players[1].id : players[0].id;
      const defender = playerById.get(defenderId);

      if (!defender) continue;

      const damage = index === 0 ? 12 : 8;
      defender.hp = Math.max(0, defender.hp - damage);
      attacks.push({
        attacker: attacker.id,
        defender: defender.id,
        damage
      });
    }

    const completedQuestion = this.getQuestionId(battle);
    battle.history.push({
      questionId: completedQuestion,
      attacks,
      hp: players.map(p => ({ id: p.id, hp: p.hp }))
    });

    battle.questionIndex++;

    if (
      battle.questionIndex >= this.totalQuestions ||
      players.some(player => player.hp === 0)
    ) {
      battle.status = "finished";
      battle.winner =
        players[0].hp === players[1].hp
          ? null
          : players[0].hp > players[1].hp
            ? players[0].id
            : players[1].id;
    } else {
      for (const player of players) {
        player.submitted = false;
        player.correctAt = undefined;
      }
      battle.questionStartedAt = Date.now();
    }

    return {
      attacks,
      battleFinished: battle.status === "finished",
      winner: battle.winner,
      hp: players.map(p => ({ id: p.id, hp: p.hp }))
    };
  }
}
