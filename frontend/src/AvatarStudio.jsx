import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThreeArena from "./ThreeArena";
import useFighterModels from "./useFighterModels";
import {
  AVATAR_PRESETS,
  DEFAULT_AVATAR,
  getAvatarPreset,
  getOpponentPreset,
  loadSavedAvatar,
  saveAvatar
} from "./avatarModel";

export default function AvatarStudio() {
  const navigate = useNavigate();
  const [saved] = useState(loadSavedAvatar);
  const [avatar, setAvatar] = useState(saved.avatar || DEFAULT_AVATAR);
  const [message, setMessage] = useState(saved.error);
  const [messageType, setMessageType] = useState(saved.error ? "error" : "status");
  const [modelError, setModelError] = useState("");
  const { models, storageError, upload } = useFighterModels();
  const playerPortrait = getAvatarPreset(avatar.portraitId);
  const opponentPortrait = getOpponentPreset(avatar.portraitId);

  async function handleModelUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessageType("status");
    setModelError("");
    setMessage("Loading your 3D character...");
    try {
      await upload("player", file);
      setMessage(`${file.name} is ready in your 3D arena.`);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "The 3D character could not be uploaded.");
    } finally {
      event.target.value = "";
    }
  }

  function handleSave(startBattle) {
    try {
      saveAvatar(avatar);
      setMessageType("status");
      setMessage("Avatar saved on this device.");
      if (startBattle) navigate("/battle");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "Fighter name could not be saved.");
    }
  }

  return (
    <main className="avatar-page neon-avatar-page three-avatar-page">
      <header className="feature-header">
        <Link className="back-link" to="/">← Home</Link>
        <div>
          <p className="tag">CUSTOM ANIME FIGHTER</p>
          <h1>Bring your anime hero to life</h1>
          <p>Choose one of the featured anime avatars or upload your own original 3D character.</p>
        </div>
      </header>

      <div className="avatar-3d-layout">
        <section className="avatar-3d-preview" aria-label="Three-dimensional fighter preview">
          <ThreeArena
            models={models}
            playerName={avatar.name || "Your fighter"}
            opponentName={opponentPortrait.name}
            playerAvatar={playerPortrait}
            opponentAvatar={opponentPortrait}
            compact
            onModelError={setModelError}
          />
        </section>

        <section className="avatar-controls">
          <p className="dashboard-eyebrow">YOUR CHARACTER</p>
          <label className="avatar-name-label" htmlFor="avatar-name">Fighter name</label>
          <input
            id="avatar-name"
            className="avatar-name-input"
            value={avatar.name}
            maxLength={18}
            onChange={(event) => {
              setAvatar((current) => ({ ...current, name: event.target.value }));
              setMessage("");
            }}
            placeholder="Enter a name"
          />

          <fieldset className="anime-avatar-picker">
            <legend>Choose an anime avatar</legend>
            <div className="anime-avatar-options">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  className={`anime-avatar-option ${avatar.portraitId === preset.id ? "selected" : ""}`}
                  key={preset.id}
                  type="button"
                  aria-pressed={avatar.portraitId === preset.id}
                  onClick={() => {
                    setAvatar((current) => ({ ...current, portraitId: preset.id }));
                    setMessage("");
                  }}
                >
                  <img src={preset.src} alt="" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="model-upload-control studio-model-upload">
            <span>＋ <b>{models.player ? "Replace 3D character" : "Upload 3D character"}</b></span>
            <small>{models.player ? models.player.name : ".glb or .vrm · max 50 MB"}</small>
            <input type="file" accept=".glb,.vrm,model/gltf-binary,model/vrm" onChange={handleModelUpload} />
          </label>

          <div className="model-guidance">
            <span>✦</span>
            <p>Choose either illustrated avatar, or upload an original GLB/VRM for a fully 3D fighter. Your selection and model stay in this browser.</p>
          </div>

          {storageError && <p className="avatar-message error" role="alert">{storageError}</p>}
          {modelError && <p className="avatar-message error" role="alert">{modelError}</p>}
          {message && <p className={`avatar-message ${messageType}`} role={messageType === "error" ? "alert" : "status"} aria-live="polite">{message}</p>}

          <div className="avatar-actions">
            <button className="secondary-btn" type="button" onClick={() => handleSave(false)}>Save fighter name</button>
            <button className="primary-btn" type="button" onClick={() => handleSave(true)}>Save &amp; enter arena →</button>
          </div>
          <Link className="model-arena-link" to="/battle">Manage both arena fighters <span>→</span></Link>
        </section>
      </div>
    </main>
  );
}
