import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThreeArena from "./ThreeArena";
import useFighterModels from "./useFighterModels";
import { generateOpponent, loadSavedAvatar } from "./avatarModel";

const ROUND_LENGTH = 60;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function Battle() {
  const [saved] = useState(loadSavedAvatar);
  const [player] = useState(saved.avatar);
  const [opponent, setOpponent] = useState(() => generateOpponent(saved.avatar.name));
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_LENGTH);
  const [uploadStatus, setUploadStatus] = useState("");
  const [modelError, setModelError] = useState("");
  const { models, storageError, upload } = useFighterModels();

  useEffect(() => {
    if (!isRunning) return undefined;
    const intervalId = window.setInterval(() => {
      setTimeLeft((remaining) => Math.max(remaining - 1, 0));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft === 0) setIsRunning(false);
  }, [timeLeft]);

  function findOpponent() {
    setOpponent((current) => generateOpponent(current.name));
    setTimeLeft(ROUND_LENGTH);
    setIsRunning(false);
  }

  function togglePreview() {
    if (isRunning) {
      setIsRunning(false);
      setTimeLeft(ROUND_LENGTH);
      return;
    }
    setTimeLeft(ROUND_LENGTH);
    setIsRunning(true);
  }

  async function handleModelUpload(slot, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const label = slot === "player" ? "Your fighter" : "Rival fighter";
    setModelError("");
    setUploadStatus(`Loading ${label.toLowerCase()}...`);
    try {
      await upload(slot, file);
      setUploadStatus(`${label} model saved on this device.`);
    } catch (error) {
      setUploadStatus("");
      setModelError(error instanceof Error ? error.message : `${label} model could not be uploaded.`);
    } finally {
      event.target.value = "";
    }
  }

  const status = isRunning
    ? "Practice round in progress — your 3D fighter is ready!"
    : timeLeft === 0
      ? "Preview round complete. Live multiplayer and scoring are not connected yet."
      : "Upload your 3D fighter models, then start the arena preview.";

  return (
    <main className="battle-page neon-battle-page">
      <header className="neon-battle-header">
        <Link className="arena-back-link" to="/">← <span>Dashboard</span></Link>
        <div className="battle-brand"><span className="brand-mark">B</span><span>BRAINBYTES<small>3D DUEL ARENA</small></span></div>
        <Link className="edit-fighter-link" to="/avatar">◉ <span>Avatar studio</span></Link>
      </header>

      <section className={`three-battle-stage ${isRunning ? "is-fighting" : ""}`} aria-label="3D practice arena">
        <ThreeArena
          models={models}
          playerName={player.name}
          opponentName={opponent.name}
          isRunning={isRunning}
          onModelError={setModelError}
        />
        <div className="three-battle-hud">
          <div className="three-health-widget">
            <strong>{player.name}</strong><span>PLAYER 01</span>
            <i><b /></i>
          </div>
          <div className="three-round-clock" role="timer" aria-label="Round time">
            <small>ROUND TIME</small><strong>{formatTime(timeLeft)}</strong><small>{isRunning ? "PREVIEW LIVE" : "READY"}</small>
          </div>
          <div className="three-health-widget rival-widget">
            <strong>{opponent.name}</strong><span>PRACTICE BOT</span>
            <i><b /></i>
          </div>
        </div>
        <div className="three-versus" aria-hidden="true">VS</div>
      </section>

      <section className="three-model-panel">
        <div className="three-model-heading">
          <div><p className="dashboard-eyebrow">YOUR CUSTOM FIGHTERS</p><h1>Bring your 3D avatars</h1></div>
          <span className="model-format-badge">GLB · VRM</span>
        </div>
        <p className="model-help">Upload original character models to see them rendered in the 3D arena. Models are stored in this browser only.</p>
        <div className="model-upload-actions">
          <label className="model-upload-control">
            <span>＋ <b>{models.player ? "Replace your model" : "Upload your model"}</b></span>
            <small>{models.player ? models.player.name : ".glb or .vrm · max 50 MB"}</small>
            <input type="file" accept=".glb,.vrm,model/gltf-binary,model/vrm" onChange={(event) => handleModelUpload("player", event)} />
          </label>
          <label className="model-upload-control rival-upload-control">
            <span>＋ <b>{models.opponent ? "Replace rival model" : "Upload rival model"}</b></span>
            <small>{models.opponent ? models.opponent.name : ".glb or .vrm · max 50 MB"}</small>
            <input type="file" accept=".glb,.vrm,model/gltf-binary,model/vrm" onChange={(event) => handleModelUpload("opponent", event)} />
          </label>
          <button className="rival-button three-rival-button" type="button" onClick={findOpponent}>↻ <span>New rival name</span></button>
          <button className="dashboard-primary-btn battle-start-button" type="button" onClick={togglePreview}>
            {isRunning ? "End preview" : timeLeft === 0 ? "Run it again" : "Start battle preview"} <span>{isRunning ? "×" : "→"}</span>
          </button>
        </div>
        {storageError && <p className="model-error" role="alert">{storageError}</p>}
        {modelError && <p className="model-error" role="alert">{modelError}</p>}
        {uploadStatus && <p className="model-status" role="status" aria-live="polite">{uploadStatus}</p>}
        {saved.error && <p className="model-error" role="alert">{saved.error}</p>}
      </section>
      <p className="battle-note neon-battle-note">The 3D arena is local practice only — no live matchmaking or scoring is connected.</p>
    </main>
  );
}
