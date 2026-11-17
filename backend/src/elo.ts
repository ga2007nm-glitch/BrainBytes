
export interface EloResult {
  player1NewRating: number;
  player2NewRating: number;
  player1Change: number;
  player2Change: number;
}

export function calculateElo(
  player1Rating: number,
  player2Rating: number,
  result: "player1" | "player2" | "draw",
  kFactor = 32
): EloResult {
  if (
    !Number.isFinite(player1Rating) ||
    !Number.isFinite(player2Rating) ||
    player1Rating < 0 ||
    player2Rating < 0 ||
    !Number.isFinite(kFactor) ||
    kFactor <= 0
  ) {
    throw new Error("Invalid Elo parameters");
  }

  const expected1 =
    1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));

  const expected2 = 1 - expected1;

  const score1 = result === "player1" ? 1 :
                 result === "draw" ? 0.5 : 0;

  const score2 = 1 - score1;

  const change1 = Math.round(kFactor * (score1 - expected1));
  const change2 = Math.round(kFactor * (score2 - expected2));

  return {
    player1NewRating: Math.max(0, player1Rating + change1),
    player2NewRating: Math.max(0, player2Rating + change2),
    player1Change: change1,
    player2Change: change2
  };
}
