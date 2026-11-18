import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrainBytesLogo from "../components/BrainBytesLogo";
import { AVATAR_PRESETS, saveAvatar, DEFAULT_AVATAR } from "../avatarModel";
import { playSound } from "../soundEffects";

const GRADE_OPTIONS = [
  { grade: 7, label: "Class 7", sub: "Integers, Equations & Light" },
  { grade: 8, label: "Class 8", sub: "Square Roots, Powers & Loops" },
  { grade: 9, label: "Class 9", sub: "Polynomials, Motion & Algorithms" },
  { grade: 10, label: "Class 10", sub: "Quadratics, Trig & Ohm's Law" },
  { grade: 11, label: "Class 11-12+", sub: "Calculus, Logic & Big-O" }
];

export default function Login({ onLoginComplete }) {
  const navigate = useNavigate();
  const [selectedAvatarId, setSelectedAvatarId] = useState("nova");
  const [name, setName] = useState("Nova");
  const [selectedGrade, setSelectedGrade] = useState(7);
  const [error, setError] = useState("");

  const activePreset = AVATAR_PRESETS.find(p => p.id === selectedAvatarId) || AVATAR_PRESETS[0];

  function handleSelectPreset(preset) {
    playSound("click");
    setSelectedAvatarId(preset.id);
    // If name hasn't been custom typed or matches previous preset, update it
    setName(preset.name);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please choose a player name / duel handle.");
      return;
    }
    if (name.trim().length > 18) {
      setError("Name must be under 18 characters.");
      return;
    }

    try {
      const newProfile = {
        ...DEFAULT_AVATAR,
        name: name.trim(),
        portraitId: selectedAvatarId,
        grade: selectedGrade
      };
      saveAvatar(newProfile);
      playSound("powerup");

      if (onLoginComplete) {
        onLoginComplete(newProfile);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile.");
    }
  }

  return (
    <main
      className="login-entrance-screen"
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 20%, #151D36 0%, #080C16 70%)",
        color: "#F0F4FC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 18px",
        fontFamily: "system-ui, sans-serif"
      }}
    >
      {/* BRAND EMBLEM */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <BrainBytesLogo size="large" />
      </div>

      {/* LOGIN & AVATAR CREATOR CARD */}
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          background: "rgba(14, 20, 38, 0.9)",
          border: "1.5px solid rgba(0, 242, 254, 0.35)",
          borderRadius: "24px",
          padding: "36px",
          boxShadow: "0 16px 50px rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(16px)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", color: "#00F2FE", textTransform: "uppercase" }}>
            1v1 ACADEMIC ARENA · ENTRANCE
          </span>
          <h1 style={{ fontSize: "2rem", margin: "6px 0 8px 0", color: "#FFFFFF" }}>
            Create Your Duelist Profile
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.95rem", margin: 0 }}>
            Pick your battle avatar, select your grade, and prepare to duel classmates on your school syllabus!
          </p>
        </div>

        {error && (
          <p
            role="alert"
            style={{
              background: "rgba(255, 0, 85, 0.15)",
              border: "1px solid #FF0055",
              color: "#FF5E7E",
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "0.9rem",
              textAlign: "center",
              marginBottom: "20px"
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleFormSubmit}>
          {/* STEP 1: CHOOSE YOUR AVATAR */}
          <div style={{ marginBottom: "26px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "#00F2FE", letterSpacing: "0.08em", marginBottom: "12px", textTransform: "uppercase" }}>
              1. Choose Your Combat Avatar
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))", gap: "12px" }}>
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatarId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      background: isSelected ? "rgba(0, 242, 254, 0.15)" : "rgba(255, 255, 255, 0.03)",
                      border: isSelected ? `2px solid ${preset.color || "#00F2FE"}` : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "14px",
                      padding: "12px 8px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, border-color 0.15s ease",
                      transform: isSelected ? "scale(1.04)" : "scale(1)",
                      boxShadow: isSelected ? `0 0 16px ${preset.color || "#00F2FE"}44` : "none"
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        margin: "0 auto 8px auto",
                        border: `2px solid ${preset.color || "#00F2FE"}`,
                        boxShadow: `0 0 10px ${preset.color || "#00F2FE"}55`
                      }}
                    >
                      <img src={preset.src} alt={preset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <strong style={{ display: "block", color: "#FFFFFF", fontSize: "0.9rem" }}>{preset.name}</strong>
                    <small style={{ color: preset.color || "#9CA3AF", fontSize: "0.72rem", fontWeight: 700 }}>
                      {preset.title || "Duelist"}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2 & 3: NAME AND GRADE SELECTION */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px", marginBottom: "30px" }}>
            {/* NAME INPUT */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "#00F2FE", letterSpacing: "0.08em", marginBottom: "8px", textTransform: "uppercase" }}>
                2. Your Duel Handle
              </label>
              <input
                type="text"
                value={name}
                maxLength={18}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter nickname..."
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1.5px solid rgba(0, 242, 254, 0.3)",
                  color: "#FFFFFF",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              <small style={{ color: "#6B7280", marginTop: "6px", display: "block" }}>
                Visible to opponents during real-time duels
              </small>
            </div>

            {/* GRADE COHORT SELECTOR */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "#00F2FE", letterSpacing: "0.08em", marginBottom: "8px", textTransform: "uppercase" }}>
                3. Select Your Class (Cohort Matchmaking)
              </label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {GRADE_OPTIONS.map((cohort) => (
                  <button
                    key={cohort.grade}
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setSelectedGrade(cohort.grade);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: selectedGrade === cohort.grade ? "2px solid #00F2FE" : "1px solid rgba(255,255,255,0.1)",
                      background: selectedGrade === cohort.grade ? "rgba(0, 242, 254, 0.2)" : "rgba(255,255,255,0.03)",
                      color: selectedGrade === cohort.grade ? "#00F2FE" : "#9CA3AF",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    {cohort.label}
                  </button>
                ))}
              </div>
              <small style={{ color: "#9CA3AF", marginTop: "6px", display: "block" }}>
                {GRADE_OPTIONS.find(c => c.grade === selectedGrade)?.sub}
              </small>
            </div>
          </div>

          {/* PLAYER CARD PREVIEW */}
          <div
            style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px dashed rgba(0, 242, 254, 0.3)",
              borderRadius: "14px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${activePreset.color || "#00F2FE"}` }}>
                <img src={activePreset.src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <strong style={{ fontSize: "1.05rem", color: "#FFF" }}>{name || "Anonymous"}</strong>
                <span style={{ display: "block", color: activePreset.color || "#00F2FE", fontSize: "0.78rem", fontWeight: 700 }}>
                  {activePreset.title} · {GRADE_OPTIONS.find(c => c.grade === selectedGrade)?.label}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.75rem", color: "#70E000", fontWeight: 800 }}>⚡ READY FOR 1v1</span>
              <small style={{ display: "block", color: "#9CA3AF" }}>100 HP · 0 PTS</small>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
              color: "#080C16",
              fontSize: "1.1rem",
              fontWeight: 900,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 25px rgba(0, 242, 254, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}
          >
            <span>⚡</span> Enter the BrainBytes Arena <span>→</span>
          </button>
        </form>
      </div>
    </main>
  );
}
