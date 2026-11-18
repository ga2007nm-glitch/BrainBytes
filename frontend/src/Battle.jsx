import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import ThreeArena from "./ThreeArena";
import useFighterModels from "./useFighterModels";
import BrainBytesLogo from "./components/BrainBytesLogo";
import { playSound } from "./soundEffects";
import GameChallenge from "./GameChallenge";
import { MINI_GAME_MODES } from "./gameModes";
import {
  generateOpponent,
  getAvatarPreset,
  loadSavedAvatar
} from "./avatarModel";
import {
  getCompletedQuestionIds,
  markCompletedQuestionIds
} from "./questionProgress";
import {
  continueLocalPracticeBattle,
  createOnlineMatch,
  getOnlineMatch,
  joinOnlineMatch,
  quickMatchOnline,
  startLocalPracticeBattle,
  startPracticeBattle,
  submitLocalPracticeAnswer,
  submitOnlineAnswer,
  submitPracticeAnswer
} from "./practiceApi";

const GRADE_COHORTS = [
  { grade: 7, label: "Class 7", sub: "Integers, Equations & BODMAS" },
  { grade: 8, label: "Class 8", sub: "Square Roots, Powers & Loops" },
  { grade: 9, label: "Class 9", sub: "Polynomials, Motion & Algorithms" },
  { grade: 10, label: "Class 10", sub: "Quadratics, Trig & Ohm's Law" },
  { grade: 11, label: "Class 11-12+", sub: "Calculus, Logic & Big-O" }
];

export default function Battle() {
  const location = useLocation();
  const [saved] = useState(loadSavedAvatar);
  const [player] = useState(saved.avatar);
  const [opponent, setOpponent] = useState(() => generateOpponent(saved.avatar.name));
  const requestedGrade = location.state?.grade;
  const savedGrade = saved.avatar.grade;
  const initialGrade = GRADE_COHORTS.some(cohort => cohort.grade === requestedGrade)
    ? requestedGrade
    : GRADE_COHORTS.some(cohort => cohort.grade === savedGrade)
      ? savedGrade
      : 7;
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [miniGameMode, setMiniGameMode] = useState("mixed-arcade");
  const [gameMode, setGameMode] = useState("quick-online"); // "quick-online" | "invite-online" | "local" | "bot"
  const [onlineAction, setOnlineAction] = useState("create");
  const [playerOneName, setPlayerOneName] = useState(saved.avatar.name);
  const [playerTwoName, setPlayerTwoName] = useState("Player 2");
  const [onlineName, setOnlineName] = useState(saved.avatar.name);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [onlineNotice, setOnlineNotice] = useState("");
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [onlineBattle, setOnlineBattle] = useState(null);
  const [dismissedOnlineResult, setDismissedOnlineResult] = useState(0);
  const [botBattle, setBotBattle] = useState(null);
  const [localBattle, setLocalBattle] = useState(null);
  const [botFeedback, setBotFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [apiError, setApiError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [modelError, setModelError] = useState("");
  const [combatAlert, setCombatAlert] = useState(null);
  const [combatVisual, setCombatVisual] = useState(null);

  // Tactical Power-Ups State
  const [activePowerUp, setActivePowerUp] = useState(null); // "shield" | "overclock" | "byteHack"
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [powerUpInventory, setPowerUpInventory] = useState({
    shield: true,
    overclock: true,
    byteHack: true
  });

  const { models, storageError, upload } = useFighterModels();

  const battle = gameMode === "local"
    ? localBattle
    : gameMode === "bot"
      ? botBattle
      : onlineBattle;

  const isRunning = battle?.status === "playing";
  const question = battle?.question;
  const activeMiniGame = battle?.activeMiniGame || miniGameMode;

  // Feedback states
  const localFeedback = localBattle && (localBattle.phase === "resolved" || localBattle.phase === "finished")
    ? localBattle.lastResult
    : null;

  const onlineFeedback = onlineBattle?.lastResult && onlineBattle.lastResult.questionNumber > dismissedOnlineResult
    ? onlineBattle.lastResult
    : null;

  const feedback = gameMode === "local"
    ? localFeedback
    : gameMode === "bot"
      ? botFeedback
      : onlineFeedback;

  useEffect(() => {
    const completedQuestionIds = (battle?.history || [])
      .map(result => result.questionId);
    if (completedQuestionIds.length === 0) return;

    try {
      markCompletedQuestionIds(completedQuestionIds);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Could not save completed questions.");
    }
  }, [battle?.history]);

  // Names
  const localPlayerOneName = localBattle?.players[0].name || playerOneName;
  const localPlayerTwoName = localBattle?.players[1].name || playerTwoName;
  const onlinePlayerOneName = onlineBattle?.players[0].name || onlineName;
  const onlinePlayerTwoName = onlineBattle?.players[1].name || "Finding Opponent...";

  // HP and Scores
  const p1Hp = gameMode === "local"
    ? localBattle?.players[0].hp ?? 100
    : gameMode === "bot"
      ? botBattle?.scores.playerHp ?? 100
      : onlineBattle?.players[0].hp ?? 100;

  const p2Hp = gameMode === "local"
    ? localBattle?.players[1].hp ?? 100
    : gameMode === "bot"
      ? botBattle?.scores.botHp ?? 100
      : onlineBattle?.players[1]?.hp ?? 100;

  const playerOneScore = gameMode === "local"
    ? localBattle?.scores.player1 ?? 0
    : gameMode === "bot"
      ? botBattle?.scores.player ?? 0
      : onlineBattle?.scores.player1 ?? 0;

  const playerTwoScore = gameMode === "local"
    ? localBattle?.scores.player2 ?? 0
    : gameMode === "bot"
      ? botBattle?.scores.bot ?? 0
      : onlineBattle?.scores.player2 ?? 0;

  // Race track positions (0 to 5)
  const p1RacePos = gameMode === "local"
    ? localBattle?.players[0].racePosition ?? 0
    : gameMode === "bot"
      ? botBattle?.scores.playerRacePosition ?? 0
      : onlineBattle?.players[0].racePosition ?? 0;

  const p2RacePos = gameMode === "local"
    ? localBattle?.players[1].racePosition ?? 0
    : gameMode === "bot"
      ? botBattle?.scores.botRacePosition ?? 0
      : onlineBattle?.players[1]?.racePosition ?? 0;

  const playerOnePortrait = getAvatarPreset(player.portraitId);
  const playerTwoPortrait = getAvatarPreset(opponent.portraitId);

  const onlineSelf = onlineBattle?.players[(onlineBattle.playerNumber || 1) - 1] ?? null;
  const onlineOpponent = onlineBattle
    ? onlineBattle.players[onlineBattle.playerNumber === 1 ? 1 : 0]
    : null;

  const stagePlayerName = (gameMode === "quick-online" || gameMode === "invite-online")
    ? onlineSelf?.name || onlineName
    : gameMode === "local"
      ? localPlayerOneName
      : player.name;

  const stageOpponentName = (gameMode === "quick-online" || gameMode === "invite-online")
    ? onlineOpponent?.name || (isSearchingMatch ? `Scanning ${GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label}...` : "Waiting for Rival")
    : gameMode === "local"
      ? localPlayerTwoName
      : opponent.name;

  const stagePlayerHp = (gameMode === "quick-online" || gameMode === "invite-online")
    ? onlineSelf?.hp ?? 100
    : p1Hp;

  const stageOpponentHp = (gameMode === "quick-online" || gameMode === "invite-online")
    ? onlineOpponent?.hp ?? 100
    : p2Hp;

  const stagePlayerScore = (gameMode === "quick-online" || gameMode === "invite-online")
    ? onlineSelf?.score ?? 0
    : playerOneScore;

  const stageOpponentScore = (gameMode === "quick-online" || gameMode === "invite-online")
    ? onlineOpponent?.score ?? 0
    : playerTwoScore;

  // Real-time synchronization
  useEffect(() => {
    if (
      (gameMode !== "quick-online" && gameMode !== "invite-online") ||
      !onlineBattle ||
      onlineBattle.status === "finished"
    ) {
      return undefined;
    }

    let active = true;
    let timerId;

    async function refreshMatch() {
      try {
        const latest = await getOnlineMatch(onlineBattle.id);
        if (!active) return;
        setOnlineBattle(latest);
        setApiError("");

        if (latest.status === "playing" && isSearchingMatch) {
          setIsSearchingMatch(false);
          playSound("powerup");
        }

        // Trigger combat alerts, actions & sounds on new round resolution
        if (latest.lastResult && latest.lastResult.questionNumber > dismissedOnlineResult) {
          const res = latest.lastResult;
          const isPlayer1 = latest.playerNumber === 1;
          const youHit = (isPlayer1 && res.roundWinner === "player1") || (!isPlayer1 && res.roundWinner === "player2");
          const oppHit = (isPlayer1 && res.roundWinner === "player2") || (!isPlayer1 && res.roundWinner === "player1");
          const youBlocked = (isPlayer1 && res.player1ShieldBlocked) || (!isPlayer1 && res.player2ShieldBlocked);
          const oppBlocked = (isPlayer1 && res.player2ShieldBlocked) || (!isPlayer1 && res.player1ShieldBlocked);

          if (youBlocked) {
            playSound("shield");
            setCombatVisual({ attacker: "opponent", defender: "player", damage: 0, type: "blocked", id: Date.now() });
            setCombatAlert({ type: "hit", message: `🛡️ QUANTUM SHIELD BLOCKED! Opponent's attack was absorbed completely!` });
          } else if (oppBlocked) {
            playSound("shield");
            setCombatVisual({ attacker: "player", defender: "opponent", damage: 0, type: "blocked", id: Date.now() });
            setCombatAlert({ type: "damage", message: `🛡️ Opponent used Quantum Shield! Your attack was absorbed.` });
          } else if (youHit) {
            playSound("hit");
            const dmg = isPlayer1 ? res.player1DamageDealt : res.player2DamageDealt;
            setCombatVisual({ attacker: "player", defender: "opponent", damage: dmg, type: "hit", id: Date.now() });
            setCombatAlert({ type: "hit", message: `⚡ DIRECT HIT! You answered first & dealt ${dmg} damage! (+${isPlayer1 ? res.player1Points : res.player2Points} PTS)` });
          } else if (oppHit) {
            playSound("damage");
            const dmg = isPlayer1 ? res.player2DamageDealt : res.player1DamageDealt;
            setCombatVisual({ attacker: "opponent", defender: "player", damage: dmg, type: "hit", id: Date.now() });
            setCombatAlert({ type: "damage", message: `💥 OPPONENT STRUCK! You took ${dmg} damage! Check the concept breakdown below.` });
          } else {
            setCombatAlert({ type: "tie", message: `⚔️ ROUND CONCLUDED! Both players missed or tied.` });
          }
        }

        if (latest.status === "finished") {
          playSound("victory");
        }

        if (latest.status !== "finished") {
          timerId = window.setTimeout(refreshMatch, 850);
        }
      } catch (error) {
        if (!active) return;
        setApiError(error instanceof Error ? error.message : "Could not sync match state.");
        timerId = window.setTimeout(refreshMatch, 1800);
      }
    }

    timerId = window.setTimeout(refreshMatch, 850);
    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [gameMode, onlineBattle?.id, onlineBattle?.status, dismissedOnlineResult, isSearchingMatch]);

  function chooseMode(mode) {
    if (isRunning || isSearchingMatch || battle?.status === "waiting") return;
    playSound("click");
    setGameMode(mode);
    setApiError("");
    setOnlineNotice("");
    setSelectedAnswer("");
    setBotFeedback(null);
    setCombatAlert(null);
  }

  // Trigger Power-Up
  function activatePowerUp(powerUpType) {
    if (!powerUpInventory[powerUpType] || !isRunning || isSubmitting || feedback) return;

    playSound("powerup");

    if (powerUpType === "byteHack") {
      // Eliminate 2 wrong answers on the client immediately
      if (activeMiniGame !== "memory-logic" && question && question.options) {
        const correct = question.correctAnswer || "";
        const wrongOpts = question.options.filter(o => o !== correct);
        const toEliminate = wrongOpts.slice(0, 2);
        setEliminatedOptions(toEliminate);
      }
      setPowerUpInventory(prev => ({ ...prev, byteHack: false }));
      setCombatAlert({ type: "hit", message: "💡 50/50 BYTE HACK: Two incorrect choices eliminated!" });
    } else {
      setActivePowerUp(powerUpType);
      setPowerUpInventory(prev => ({ ...prev, [powerUpType]: false }));
      const label = powerUpType === "shield" ? "🛡️ QUANTUM SHIELD ARMED: Next hit will be absorbed!" : "⚡ OVERCLOCK ACTIVATED: Next correct hit deals 1.8x damage!";
      setCombatAlert({ type: "hit", message: label });
    }
  }

  // Start 1v1 match
  async function beginBattle() {
    playSound("click");
    setIsStarting(true);
    setApiError("");
    setOnlineNotice("");
    setSelectedAnswer("");
    setBotFeedback(null);
    setCombatAlert(null);
    setActivePowerUp(null);
    setEliminatedOptions([]);

    try {
      const completedQuestionIds = getCompletedQuestionIds();

      if (gameMode === "quick-online") {
        setIsSearchingMatch(true);
        const match = await quickMatchOnline(
          onlineName,
          player.portraitId,
          selectedGrade,
          miniGameMode,
          completedQuestionIds
        );
        setOnlineBattle(match);
        setLocalBattle(null);
        setBotBattle(null);
        setDismissedOnlineResult(0);

        if (match.status === "playing") {
          setIsSearchingMatch(false);
          playSound("powerup");
          setOnlineNotice(`Match found in ${GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label}! Dual battle initiated!`);
        } else {
          setOnlineNotice(`Scanning active lobby for ${GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label} students...`);
        }
      } else if (gameMode === "invite-online") {
        if (onlineAction === "create") {
          const newMatch = await createOnlineMatch(
            onlineName,
            player.portraitId,
            selectedGrade,
            miniGameMode,
            completedQuestionIds
          );
          setOnlineBattle(newMatch);
          setLocalBattle(null);
          setBotBattle(null);
          setDismissedOnlineResult(0);
          setOnlineNotice("Share this Room Code with your classmate!");
        } else {
          const newMatch = await joinOnlineMatch(
            inviteCodeInput,
            onlineName,
            player.portraitId,
            selectedGrade,
            completedQuestionIds
          );
          setOnlineBattle(newMatch);
          setLocalBattle(null);
          setBotBattle(null);
          setDismissedOnlineResult(0);
          setOnlineNotice("Joined duel room!");
        }
      } else if (gameMode === "local") {
        const newBattle = await startLocalPracticeBattle(
          playerOneName,
          playerTwoName,
          miniGameMode,
          selectedGrade,
          completedQuestionIds
        );
        setLocalBattle(newBattle);
        setBotBattle(null);
        setOnlineBattle(null);
      } else if (gameMode === "bot") {
        const newBattle = await startPracticeBattle(
          selectedGrade,
          miniGameMode,
          completedQuestionIds
        );
        setBotBattle(newBattle);
        setLocalBattle(null);
        setOnlineBattle(null);
      }
    } catch (error) {
      setIsSearchingMatch(false);
      setApiError(error instanceof Error ? error.message : "Failed to start match.");
    } finally {
      setIsStarting(false);
    }
  }

  async function answerQuestion(answer) {
    if (!battle || !question || isSubmitting || feedback) return;

    playSound("click");
    setSelectedAnswer(answer);
    setIsSubmitting(true);
    setApiError("");

    try {
      if (gameMode === "quick-online" || gameMode === "invite-online") {
        const updated = await submitOnlineAnswer(onlineBattle.id, question.id, answer, activePowerUp);
        setOnlineBattle(updated);
        setSelectedAnswer("");
        setActivePowerUp(null);
      } else if (gameMode === "local") {
        const updated = await submitLocalPracticeAnswer(localBattle.id, localBattle.activePlayer, question.id, answer);
        setLocalBattle(updated);
        setSelectedAnswer("");
        if (updated.lastResult) {
          if (updated.lastResult.player1Correct && !updated.lastResult.player2Correct) {
            playSound("hit");
            setCombatVisual({ attacker: "player", defender: "opponent", damage: updated.lastResult.player1Damage, type: "hit", id: Date.now() });
          } else if (!updated.lastResult.player1Correct && updated.lastResult.player2Correct) {
            playSound("damage");
            setCombatVisual({ attacker: "opponent", defender: "player", damage: updated.lastResult.player2Damage, type: "hit", id: Date.now() });
          }
        }
      } else if (gameMode === "bot") {
        const updated = await submitPracticeAnswer(botBattle.id, question.id, answer);
        setBotBattle(updated);
        setBotFeedback(updated.lastResult);

        if (updated.lastResult) {
          if (updated.lastResult.playerCorrect && updated.lastResult.playerFirst) {
            playSound("hit");
            setCombatVisual({ attacker: "player", defender: "opponent", damage: updated.lastResult.playerDamage, type: "hit", id: Date.now() });
            setCombatAlert({ type: "hit", message: `⚡ FIRST STRIKE! You answered correctly & hit the bot! (-${updated.lastResult.playerDamage} HP)` });
          } else if (!updated.lastResult.playerCorrect && updated.lastResult.botCorrect) {
            playSound("damage");
            setCombatVisual({ attacker: "opponent", defender: "player", damage: updated.lastResult.botDamage, type: "hit", id: Date.now() });
            setCombatAlert({ type: "damage", message: `💥 BOT HIT YOU! You took ${updated.lastResult.botDamage} damage. Review the concept breakdown below.` });
          } else {
            setCombatAlert({ type: "tie", message: `Round resolved.` });
          }
        }
      }
    } catch (error) {
      setSelectedAnswer("");
      setApiError(error instanceof Error ? error.message : "Error submitting answer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function continueBattle() {
    playSound("click");
    setApiError("");
    setSelectedAnswer("");
    setCombatAlert(null);
    setEliminatedOptions([]);

    if (gameMode === "local") {
      setIsSubmitting(true);
      try {
        setLocalBattle(await continueLocalPracticeBattle(localBattle.id));
      } catch (error) {
        setApiError(error instanceof Error ? error.message : "Could not continue.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (gameMode === "quick-online" || gameMode === "invite-online") {
      if (onlineBattle?.lastResult) {
        setDismissedOnlineResult(onlineBattle.lastResult.questionNumber);
      }
      return;
    }

    setBotFeedback(null);
  }

  async function copyInviteCode() {
    try {
      await navigator.clipboard.writeText(onlineBattle.inviteCode);
      setOnlineNotice("Room Code copied to clipboard!");
    } catch {
      setOnlineNotice("Select and copy the room code.");
    }
  }

  const showSetup = !battle || battle.status === "finished";

  return (
    <main className="battle-page neon-battle-page">
      {/* HEADER WITH BRAINBYTES LOGO & TEACHER/JUDGE LINK */}
      <header className="neon-battle-header" style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link className="arena-back-link" to="/" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span>←</span> Dashboard
        </Link>
        <BrainBytesLogo size="default" />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            to="/teacher"
            style={{
              background: "rgba(255, 209, 102, 0.15)",
              color: "#FFD166",
              border: "1px solid rgba(255, 209, 102, 0.4)",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <span>📊</span> Judge / Edu Radar
          </Link>
          <Link className="edit-fighter-link" to="/avatar">
            ◉ <span>Avatars</span>
          </Link>
        </div>
      </header>

      {/* COMBAT LIVE ALERT */}
      {combatAlert && (
        <aside
          role="status"
          aria-live="polite"
          className={`combat-alert-banner ${combatAlert.type}`}
          style={{
            maxWidth: "960px",
            margin: "0 auto 12px auto",
            padding: "10px 18px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: 700,
            fontSize: "0.95rem",
            letterSpacing: "0.02em",
            animation: "pulse 1.5s infinite alternate",
            border: combatAlert.type === "hit" ? "1px solid #00F2FE" : combatAlert.type === "damage" ? "1px solid #FF0055" : "1px solid #9D4EDD",
            background: combatAlert.type === "hit" ? "rgba(0, 242, 254, 0.15)" : combatAlert.type === "damage" ? "rgba(255, 0, 85, 0.18)" : "rgba(157, 78, 221, 0.15)",
            color: combatAlert.type === "hit" ? "#00F2FE" : combatAlert.type === "damage" ? "#FF4D79" : "#E2D9F3"
          }}
        >
          {combatAlert.message}
        </aside>
      )}

      {/* 1v1 REAL-TIME SPLIT SCREEN HEAD-TO-HEAD DISPLAY */}
      <section className="split-screen-arena-container" aria-label="1v1 Split Screen Battle Arena">
        <div className="split-hud-grid">
          {/* PLAYER 1 PANE (LEFT) */}
          <div className={`split-player-box player-1-box ${stagePlayerHp < 30 ? "critical-hp" : ""}`}>
            <div className="player-meta-row">
              <span className="player-tag">
                YOU · {GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label}
              </span>
              <span className="player-score-tag">{stagePlayerScore} PTS</span>
            </div>
            <div className="player-identity">
              <span className="avatar-orb p1-orb">
                <img src={playerOnePortrait.src} alt={stagePlayerName} />
              </span>
              <div>
                <h2 className="player-name">{stagePlayerName}</h2>
                <span className="player-status-badge">
                  {selectedAnswer ? "⚡ ANSWER LOCKED" : isRunning ? "🤔 THINKING..." : "READY"}
                </span>
              </div>
            </div>
            {/* HP BAR */}
            <div className="hp-bar-wrapper">
              <div className="hp-label-row">
                <span>HEALTH</span>
                <strong>{stagePlayerHp} / 100 HP</strong>
              </div>
              <div className="hp-track">
                <div
                  className="hp-fill p1-fill"
                  style={{ width: `${Math.max(0, stagePlayerHp)}%` }}
                />
              </div>
            </div>
            {/* RACE TRACK POSITION */}
            <div className="race-track-indicator">
              <span>Race Progress:</span>
              <div className="sector-dots">
                {[1, 2, 3, 4, 5].map((sector) => (
                  <span
                    key={sector}
                    className={`sector-dot ${p1RacePos >= sector ? "active" : ""}`}
                    title={`Sector ${sector}`}
                  />
                ))}
              </div>
              <small>{p1RacePos >= 5 ? "🏁 FINISH" : `L${p1RacePos}`}</small>
            </div>
          </div>

          {/* CENTER VS BADGE & LEVEL ROUND TRACKER */}
          <div className="arena-center-pillar">
            <div className="vs-emblem">VS</div>
            <div className="round-badge">
              <small>QUESTION</small>
              <strong>{battle ? `${battle.questionNumber}/5` : "1v1"}</strong>
              <span className="difficulty-pill">
                {battle ? battle.levelName : GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label}
              </span>
            </div>
          </div>

          {/* OPPONENT PANE (RIGHT) */}
          <div className={`split-player-box player-2-box ${stageOpponentHp < 30 ? "critical-hp" : ""}`}>
            <div className="player-meta-row">
              <span className="player-tag rival-tag">
                RIVAL · {GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label}
              </span>
              <span className="player-score-tag rival-score">{stageOpponentScore} PTS</span>
            </div>
            <div className="player-identity">
              <span className="avatar-orb p2-orb">
                <img src={playerTwoPortrait.src} alt={stageOpponentName} />
              </span>
              <div>
                <h2 className="player-name">{stageOpponentName}</h2>
                <span className="player-status-badge rival-status">
                  {isSearchingMatch
                    ? "🔍 SCANNING COHORT..."
                    : onlineBattle?.players[1]?.submitted
                      ? "⚡ ANSWER LOCKED"
                      : isRunning
                        ? "🤔 COMPETING..."
                        : "READY"}
                </span>
              </div>
            </div>
            {/* HP BAR */}
            <div className="hp-bar-wrapper">
              <div className="hp-label-row">
                <span>HEALTH</span>
                <strong>{stageOpponentHp} / 100 HP</strong>
              </div>
              <div className="hp-track">
                <div
                  className="hp-fill p2-fill"
                  style={{ width: `${Math.max(0, stageOpponentHp)}%` }}
                />
              </div>
            </div>
            {/* RACE TRACK POSITION */}
            <div className="race-track-indicator">
              <span>Race Progress:</span>
              <div className="sector-dots">
                {[1, 2, 3, 4, 5].map((sector) => (
                  <span
                    key={sector}
                    className={`sector-dot rival-dot ${p2RacePos >= sector ? "active" : ""}`}
                    title={`Opponent Sector ${sector}`}
                  />
                ))}
              </div>
              <small>{p2RacePos >= 5 ? "🏁 FINISH" : `L${p2RacePos}`}</small>
            </div>
          </div>
        </div>
      </section>

      {/* 3D VISUAL BATTLE ARENA */}
      <section className={`three-battle-stage ${isRunning ? "is-fighting" : ""}`} aria-label="3D battle arena">
        <ThreeArena
          models={models}
          playerName={stagePlayerName}
          opponentName={stageOpponentName}
          playerAvatar={playerOnePortrait}
          opponentAvatar={playerTwoPortrait}
          isRunning={isRunning}
          onModelError={setModelError}
          combatVisual={combatVisual}
        />
      </section>

      {/* BATTLE INTERACTION PANEL */}
      <section className="practice-quiz-panel" aria-label="5-Level Real-Time Duel Panel">
        {apiError && <p className="practice-api-error" role="alert">{apiError}</p>}

        {/* SEARCHING ONLINE RADAR ANIMATION */}
        {isSearchingMatch && (
          <div className="match-radar-card" role="status" aria-live="polite">
            <div className="radar-spinner" />
            <p className="dashboard-eyebrow">GRADE-SPECIFIC MATCHMAKING</p>
            <h2>Finding a {GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label} Student Rival...</h2>
            <p>Filtering active online students to pair you with classmates studying the same syllabus!</p>
          </div>
        )}

        {/* PRE-GAME SETUP & GRADE SELECTOR */}
        {showSetup && !isSearchingMatch && (
          <div className="practice-intro">
            {/* CLASS / GRADE SELECTOR */}
            <div style={{ marginBottom: "20px", background: "rgba(0, 242, 254, 0.05)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0, 242, 254, 0.25)" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em", color: "#00F2FE", textTransform: "uppercase" }}>
                1. SELECT YOUR CLASS (CURRICULUM ALIGNMENT)
              </span>
              <p style={{ margin: "4px 0 12px 0", fontSize: "0.85rem", color: "#A0AEC0" }}>
                You will be matched exclusively with students in your cohort, answering questions strictly from your class syllabus!
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
                {GRADE_COHORTS.map(cohort => (
                  <button
                    key={cohort.grade}
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setSelectedGrade(cohort.grade);
                    }}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: selectedGrade === cohort.grade ? "2px solid #00F2FE" : "1px solid rgba(255,255,255,0.1)",
                      background: selectedGrade === cohort.grade ? "rgba(0, 242, 254, 0.2)" : "rgba(255,255,255,0.03)",
                      color: selectedGrade === cohort.grade ? "#00F2FE" : "#FFFFFF",
                      cursor: "pointer",
                      textAlign: "left"
                    }}
                  >
                    <strong style={{ display: "block", fontSize: "0.95rem" }}>{cohort.label}</strong>
                    <small style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>{cohort.sub}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="mini-game-mode-selector" aria-label="Choose mini-game">
              <span className="mini-game-selector-title">2. CHOOSE YOUR MINI-GAME</span>
              <div className="mini-game-mode-grid">
                {MINI_GAME_MODES.map((mode) => (
                  <button
                    type="button"
                    className={`mini-game-mode-card ${miniGameMode === mode.id ? "selected" : ""}`}
                    key={mode.id}
                    onClick={() => {
                      playSound("click");
                      setMiniGameMode(mode.id);
                    }}
                    aria-pressed={miniGameMode === mode.id}
                  >
                    <strong>{mode.name}</strong>
                    <small>{mode.description}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* BATTLE MODE PICKER */}
            <div className="practice-mode-picker" aria-label="Choose battle mode">
              <button
                type="button"
                className={gameMode === "quick-online" ? "selected" : ""}
                onClick={() => chooseMode("quick-online")}
              >
                ⚡ Quick 1v1 Match
              </button>
              <button
                type="button"
                className={gameMode === "invite-online" ? "selected" : ""}
                onClick={() => chooseMode("invite-online")}
              >
                🗝️ Private Room
              </button>
              <button
                type="button"
                className={gameMode === "local" ? "selected" : ""}
                onClick={() => chooseMode("local")}
              >
                👥 Split Screen 2P
              </button>
              <button
                type="button"
                className={gameMode === "bot" ? "selected" : ""}
                onClick={() => chooseMode("bot")}
              >
                🤖 Practice AI
              </button>
            </div>

            {gameMode === "quick-online" && (
              <div className="mode-desc-card">
                <span className="hero-kicker">CURRICULUM-MATCHED 1v1</span>
                <h3>Instant Duel in {GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label}</h3>
                <p>
                  Press Start to pair with an active online peer. 5 escalating questions (Levels 1 to 5).
                  Who answers first lands the hit! Tactical power-ups enabled.
                </p>
                <div className="practice-name-fields">
                  <label>
                    Your Duel Handle
                    <input
                      value={onlineName}
                      maxLength={20}
                      onChange={(e) => setOnlineName(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {gameMode === "invite-online" && (
              <div className="mode-desc-card">
                <div className="practice-online-action">
                  <button
                    type="button"
                    className={onlineAction === "create" ? "selected" : ""}
                    onClick={() => setOnlineAction("create")}
                  >
                    Create Room Code
                  </button>
                  <button
                    type="button"
                    className={onlineAction === "join" ? "selected" : ""}
                    onClick={() => setOnlineAction("join")}
                  >
                    Join with Room Code
                  </button>
                </div>
                <div className="practice-name-fields online-name-fields">
                  <label>
                    Your Duel Handle
                    <input
                      value={onlineName}
                      maxLength={20}
                      onChange={(e) => setOnlineName(e.target.value)}
                    />
                  </label>
                  {onlineAction === "join" && (
                    <label>
                      Room Code
                      <input
                        value={inviteCodeInput}
                        maxLength={8}
                        placeholder="8-char code"
                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {gameMode === "local" && (
              <div className="mode-desc-card">
                <p>Share this screen with a classmate. Take turns answering the 5 levels of questions.</p>
                <div className="practice-name-fields">
                  <label>
                    Player 1 Name
                    <input
                      value={playerOneName}
                      maxLength={20}
                      onChange={(e) => setPlayerOneName(e.target.value)}
                    />
                  </label>
                  <label>
                    Player 2 Name
                    <input
                      value={playerTwoName}
                      maxLength={20}
                      onChange={(e) => setPlayerTwoName(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {gameMode === "bot" && (
              <div className="mode-desc-card">
                <p>Train against the BrainBytes AI tuned to {GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label} difficulty.</p>
              </div>
            )}

            <button
              className="dashboard-primary-btn practice-start-button"
              type="button"
              onClick={beginBattle}
              disabled={isStarting || !onlineName.trim()}
              style={{ marginTop: "16px" }}
            >
              {isStarting
                ? "Connecting to Arena..."
                : gameMode === "quick-online"
                  ? `⚡ Enter ${GRADE_COHORTS.find(c => c.grade === selectedGrade)?.label} Arena`
                  : gameMode === "invite-online"
                    ? onlineAction === "create" ? "Generate Room Code" : "Join Duel Room"
                    : "Enter 1v1 Battle Arena"}
              <span aria-hidden="true"> →</span>
            </button>
          </div>
        )}

        {/* WAITING FOR OPPONENT IN ROOM */}
        {onlineBattle?.status === "waiting" && (
          <div className="practice-invite-panel" role="status" aria-live="polite">
            <p className="dashboard-eyebrow">ROOM CREATED · WAITING FOR OPPONENT</p>
            <h2>Share this Room Code with your Classmate</h2>
            <button
              className="practice-invite-code"
              type="button"
              onClick={copyInviteCode}
              title="Click to copy room code"
            >
              {onlineBattle.inviteCode}
            </button>
            <p>{onlineNotice || "The duel begins automatically the moment your classmate joins."}</p>
          </div>
        )}

        {/* ACTIVE QUESTION PANEL WITH TACTICAL POWER-UPS */}
        {isRunning && question && !feedback && (
          <div className="practice-question">
            {/* TACTICAL POWER-UPS DOCK */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.4)", padding: "10px 16px", borderRadius: "10px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FFD166", letterSpacing: "0.08em" }}>
                TACTICAL POWER-UPS:
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => activatePowerUp("shield")}
                  disabled={!powerUpInventory.shield || activePowerUp === "shield"}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: activePowerUp === "shield" ? "2px solid #00F2FE" : "1px solid rgba(255,255,255,0.15)",
                    background: activePowerUp === "shield" ? "rgba(0, 242, 254, 0.25)" : powerUpInventory.shield ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.01)",
                    color: powerUpInventory.shield ? "#00F2FE" : "#4B5563",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: powerUpInventory.shield ? "pointer" : "not-allowed"
                  }}
                  title="Absorbs 1 incoming enemy hit"
                >
                  🛡️ Shield {activePowerUp === "shield" ? "(Armed)" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => activatePowerUp("overclock")}
                  disabled={!powerUpInventory.overclock || activePowerUp === "overclock"}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: activePowerUp === "overclock" ? "2px solid #FF0055" : "1px solid rgba(255,255,255,0.15)",
                    background: activePowerUp === "overclock" ? "rgba(255, 0, 85, 0.25)" : powerUpInventory.overclock ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.01)",
                    color: powerUpInventory.overclock ? "#FF0055" : "#4B5563",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: powerUpInventory.overclock ? "pointer" : "not-allowed"
                  }}
                  title="Next correct hit deals 1.8x damage"
                >
                  ⚡ Overclock {activePowerUp === "overclock" ? "(Armed)" : ""}
                </button>
                <button
                  type="button"
                  onClick={() => activatePowerUp("byteHack")}
                  disabled={!powerUpInventory.byteHack || activeMiniGame === "memory-logic"}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: powerUpInventory.byteHack ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.01)",
                    color: powerUpInventory.byteHack && activeMiniGame !== "memory-logic" ? "#FFD166" : "#4B5563",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: powerUpInventory.byteHack ? "pointer" : "not-allowed"
                  }}
                  title={activeMiniGame === "memory-logic" ? "Not available in memory mode" : "Eliminates 2 wrong options"}
                >
                  💡 50/50 Hack
                </button>
              </div>
            </div>

            <div className="practice-question-meta">
              <span className="subject-tag">{question.subject ? question.subject.toUpperCase() : "STEM"}</span>
              <span className="level-badge-pill">{battle.levelName}</span>
              <span className="points-badge">💥 {question.damage || 20} DAMAGE · {question.points} PTS</span>
            </div>

            <GameChallenge
              question={question}
              gameMode={activeMiniGame}
              level={battle.level}
              onAnswer={answerQuestion}
              disabled={isSubmitting}
            />

            {isSubmitting && (
              <p className="practice-submitting" role="status">
                ⚡ Submitting your strike... Waiting for round resolution!
              </p>
            )}
          </div>
        )}

        {/* EDUCATIONAL EXPLANATION & MISCONCEPTION CARD */}
        {feedback && (
          <div
            className="round-resolution-card"
            role="status"
            aria-live="polite"
            style={{
              background: "rgba(13, 17, 30, 0.95)",
              border: "1.5px solid rgba(0, 242, 254, 0.35)",
              borderRadius: "16px",
              padding: "24px",
              marginTop: "20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "0.85rem", letterSpacing: "0.1em", color: "#00F2FE", fontWeight: 700 }}>
                ROUND {feedback.questionNumber} REVIEW · {feedback.levelName}
              </span>
              <span style={{ color: "#FFD166", fontWeight: 800 }}>
                Correct Answer: {feedback.correctAnswer}
              </span>
            </div>

            {/* CONCEPT BREAKDOWN */}
            <div
              style={{
                background: "rgba(0, 242, 254, 0.08)",
                borderLeft: "4px solid #00F2FE",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "20px"
              }}
            >
              <h3 style={{ margin: "0 0 6px 0", color: "#FFFFFF", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🧠</span> Concept Explanation &amp; Common Pitfalls
              </h3>
              <p style={{ margin: 0, color: "#D1D5DB", lineHeight: 1.55, fontSize: "0.95rem" }}>
                {feedback.explanation}
              </p>
            </div>

            {isRunning && (
              <button
                className="dashboard-primary-btn"
                type="button"
                onClick={continueBattle}
                style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
              >
                Continue to Next Level Challenge <span>→</span>
              </button>
            )}
          </div>
        )}

        {/* FINAL RESULT / VICTORY BANNER */}
        {battle?.status === "finished" && (
          <div
            className="practice-final-result"
            role="status"
            aria-live="polite"
            style={{
              background: "linear-gradient(180deg, rgba(18, 24, 40, 0.95) 0%, rgba(9, 13, 24, 0.98) 100%)",
              border: "2px solid #00F2FE",
              borderRadius: "18px",
              padding: "32px",
              textAlign: "center",
              marginTop: "24px",
              boxShadow: "0 0 40px rgba(0, 242, 254, 0.25)"
            }}
          >
            <p className="dashboard-eyebrow" style={{ color: "#FFD166" }}>MATCH FINISHED</p>
            <h2 style={{ fontSize: "2rem", margin: "10px 0 20px 0" }}>
              {battle.winner === "player1" || battle.winner === "player"
                ? "🏆 VICTORY! YOU WON THE DUEL!"
                : battle.winner === "draw"
                  ? "🤝 EPIC DRAW! EQUAL BRAIN POWER!"
                  : "⚔️ DEFEAT! REVIEW YOUR STEPS & RETRY!"}
            </h2>

            <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginBottom: "24px" }}>
              <div style={{ padding: "16px 24px", background: "rgba(0, 242, 254, 0.1)", borderRadius: "12px", border: "1px solid #00F2FE" }}>
                <span style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>{stagePlayerName}</span>
                <p style={{ fontSize: "1.8rem", fontWeight: 800, margin: "4px 0", color: "#00F2FE" }}>{stagePlayerScore} PTS</p>
                <small>{stagePlayerHp} HP Remaining</small>
              </div>
              <div style={{ padding: "16px 24px", background: "rgba(157, 78, 221, 0.1)", borderRadius: "12px", border: "1px solid #9D4EDD" }}>
                <span style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>{stageOpponentName}</span>
                <p style={{ fontSize: "1.8rem", fontWeight: 800, margin: "4px 0", color: "#9D4EDD" }}>{stageOpponentScore} PTS</p>
                <small>{stageOpponentHp} HP Remaining</small>
              </div>
            </div>

            <section
              aria-labelledby="match-review-heading"
              style={{ textAlign: "left", margin: "0 auto 24px", maxWidth: "820px" }}
            >
              <h3 id="match-review-heading" style={{ color: "#00F2FE", marginBottom: "8px" }}>
                Match Review: Questions, Answers &amp; Explanations
              </h3>
              <p style={{ color: "#A0AEC0", lineHeight: 1.6 }}>
                Revisit every completed round to see the challenge, correct answer, and reasoning.
              </p>
              <ol style={{ display: "grid", gap: "12px", paddingLeft: "24px" }}>
                {battle.history.map(result => (
                  <li
                    key={result.questionId}
                    style={{
                      padding: "16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(0,242,254,0.2)",
                      borderRadius: "10px",
                      color: "#D1D5DB",
                      lineHeight: 1.6
                    }}
                  >
                    <strong style={{ color: "#FFFFFF" }}>
                      {result.levelName} · {result.subject.toUpperCase()}
                    </strong>
                    <p style={{ margin: "8px 0" }}>{result.prompt}</p>
                    <p style={{ margin: "8px 0", color: "#FFD166" }}>
                      Correct answer: {result.correctAnswer}
                    </p>
                    <p style={{ margin: "8px 0 0" }}>
                      <strong style={{ color: "#00F2FE" }}>Why:</strong> {result.explanation}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                className="dashboard-primary-btn"
                type="button"
                onClick={beginBattle}
                style={{ padding: "14px 28px", fontSize: "1.05rem" }}
              >
                Play Again with Fresh Questions <span>↻</span>
              </button>
              <Link
                to="/teacher"
                style={{
                  background: "rgba(255, 209, 102, 0.15)",
                  color: "#FFD166",
                  border: "1px solid #FFD166",
                  borderRadius: "10px",
                  padding: "14px 22px",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center"
                }}
              >
                View Diagnostic Radar 📊
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* AVATAR DOCK */}
      <section className="three-model-panel">
        <div className="three-model-heading">
          <div>
            <p className="dashboard-eyebrow">FIGHTER CUSTOMIZATION</p>
            <h2>Select Illustrated or 3D VRM/GLB Characters</h2>
          </div>
          <span className="model-format-badge">CLASS 7+ ARENA</span>
        </div>
        <p className="model-help">
          Custom anime fighters and uploaded 3D models give you a real-time gaming presence in the BrainBytes 1v1 arena.
        </p>
      </section>
    </main>
  );
}
