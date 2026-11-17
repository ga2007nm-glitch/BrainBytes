
export interface QueuedPlayer {
  id: string;
  rating: number;
  joinedAt: number;
}

export interface MatchPair {
  player1: QueuedPlayer;
  player2: QueuedPlayer;
}

export class MatchmakingQueue {
  private queue: QueuedPlayer[] = [];

  join(id: string, rating: number): MatchPair | null {
    if (!id || !Number.isFinite(rating) || rating < 0) {
      throw new Error("Invalid player");
    }

    this.leave(id);

    const player: QueuedPlayer = {
      id,
      rating,
      joinedAt: Date.now()
    };

    this.queue.push(player);
    return this.findMatch(id);
  }

  findMatch(playerId: string): MatchPair | null {
    const player = this.queue.find(p => p.id === playerId);
    if (!player) return null;

    const now = Date.now();

    const candidates = this.queue
      .filter(p => p.id !== playerId)
      .filter(p => {
        const waitingSeconds =
          Math.max(now - player.joinedAt, now - p.joinedAt) / 1000;

        const allowedDifference =
          Math.min(500, 100 + Math.floor(waitingSeconds / 10) * 50);

        return Math.abs(player.rating - p.rating) <= allowedDifference;
      })
      .sort((a, b) =>
        Math.abs(a.rating - player.rating) -
        Math.abs(b.rating - player.rating)
      );

    const opponent = candidates[0];
    if (!opponent) return null;

    this.leave(player.id);
    this.leave(opponent.id);

    return { player1: player, player2: opponent };
  }

  matchWaitingPlayers(): MatchPair[] {
    const matches: MatchPair[] = [];

    for (const player of [...this.queue]) {
      const match = this.findMatch(player.id);
      if (match) matches.push(match);
    }

    return matches;
  }

  leave(id: string): void {
    this.queue = this.queue.filter(p => p.id !== id);
  }

  getWaitingPlayers(): number {
    return this.queue.length;
  }
}
