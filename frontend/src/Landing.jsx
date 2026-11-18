import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThreeArena from "./ThreeArena";
import useFighterModels from "./useFighterModels";
import BrainBytesLogo from "./components/BrainBytesLogo";
import Login from "./pages/Login";
import { generateOpponent, getAvatarPreset, loadSavedAvatar } from "./avatarModel";
import { MINI_GAME_MODES } from "./gameModes";

const COHORTS = [
  { grade: 7, label: "Class 7", topics: "Integers, Equations & Light", icon: "∑" },
  { grade: 8, label: "Class 8", topics: "Square Roots, Powers & Loops", icon: "√" },
  { grade: 9, label: "Class 9", topics: "Polynomials, Motion & Algorithms", icon: "π" },
  { grade: 10, label: "Class 10", topics: "Quadratics, Trig & Ohm's Law", icon: "Ω" },
  { grade: 11, label: "Class 11-12+", topics: "Calculus, Logic & Big-O", icon: "∫" }
];

export default function Landing() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(loadSavedAvatar);
  const [showLoginModal, setShowLoginModal] = useState(!saved.isSaved);
  const [rival] = useState(() => generateOpponent(saved.avatar.name));
  const activeGrade = Number(saved.avatar.grade) || 7;
  const { models } = useFighterModels();
  const player = saved.avatar;
  const playerPortrait = getAvatarPreset(player.portraitId);

  // If first-time user enters or explicitly clicks "Switch Profile", show Login/Avatar Creator Screen
  if (showLoginModal || !saved.isSaved) {
    return (
      <Login
        initialProfile={saved.isSaved ? saved.avatar : undefined}
        onLoginComplete={(newProfile) => {
          setSaved({ avatar: newProfile, isSaved: true, error: "" });
          setShowLoginModal(false);
        }}
      />
    );
  }

  return (
    <div className="dashboard-root" style={{ minHeight: "100vh", background: "#080C16", color: "#F0F4FC", fontFamily: "system-ui, sans-serif" }}>
      {/* TOP NAVIGATION BAR */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 36px",
        background: "rgba(11, 16, 30, 0.95)",
        borderBottom: "1px solid rgba(0, 242, 254, 0.15)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <BrainBytesLogo size="default" />
          <nav style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            <Link to="/" style={{ color: "#00F2FE", fontWeight: 700, textDecoration: "none", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>⌂</span> Dashboard
            </Link>
            <Link to="/battle" style={{ color: "#9CA3AF", fontWeight: 600, textDecoration: "none", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>⚔</span> 1v1 Arena
            </Link>
            <Link to="/teacher" style={{ color: "#FFD166", fontWeight: 700, textDecoration: "none", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📊</span> Edu Radar
            </Link>
            <Link to="/avatar" style={{ color: "#9CA3AF", fontWeight: 600, textDecoration: "none", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>◉</span> Avatar Studio
            </Link>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link to="/avatar" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", background: "rgba(255,255,255,0.04)", padding: "4px 12px 4px 6px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <img src={playerPortrait.src} alt={player.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #00F2FE" }} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFF" }}>{player.name}</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              title="Change your avatar or duelist handle"
              style={{
                background: "rgba(0, 242, 254, 0.1)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                color: "#00F2FE",
                padding: "6px 12px",
                borderRadius: "14px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              🔄 Change Avatar
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px" }}>
        {/* HERO ARENA SHOWCASE */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: "28px",
          background: "linear-gradient(135deg, rgba(14, 20, 38, 0.95) 0%, rgba(20, 14, 40, 0.95) 100%)",
          border: "1.5px solid rgba(0, 242, 254, 0.35)",
          borderRadius: "20px",
          padding: "36px",
          marginBottom: "36px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0, 242, 254, 0.12)", border: "1px solid #00F2FE", padding: "6px 14px", borderRadius: "20px", marginBottom: "18px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00F2FE", boxShadow: "0 0 8px #00F2FE" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", color: "#00F2FE" }}>THE 1v1 ACADEMIC DUEL ARENA IS LIVE</span>
            </div>

            <h1 style={{ fontSize: "2.8rem", fontWeight: 900, lineHeight: 1.15, margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
              Think Fast. <br />
              <span style={{ color: "#00F2FE", textShadow: "0 0 20px rgba(0, 242, 254, 0.4)" }}>Strike First.</span> <br />
              <span style={{ color: "#9D4EDD" }}>Win the Duel.</span>
            </h1>

            <p style={{ color: "#A0AEC0", fontSize: "1.05rem", lineHeight: 1.6, margin: "0 0 28px 0", maxWidth: "540px" }}>
              No boring worksheets. Match head-to-head with students in your grade. Answer curriculum-aligned STEM questions to deal hit damage, activate quantum shields, and surge ahead!
            </p>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => navigate("/battle", { state: { grade: activeGrade } })}
                style={{
                  background: "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
                  color: "#080C16",
                  fontWeight: 900,
                  fontSize: "1.05rem",
                  padding: "16px 32px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 25px rgba(0, 242, 254, 0.5)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "transform 0.15s ease"
                }}
              >
                <span>⚔️</span> Enter 1v1 Battle Arena <span>→</span>
              </button>

              <Link
                to="/teacher"
                style={{
                  background: "rgba(255, 209, 102, 0.12)",
                  color: "#FFD166",
                  border: "1.5px solid rgba(255, 209, 102, 0.5)",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  padding: "15px 24px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <span>📊</span> Edu Diagnostic Radar
              </Link>
            </div>
          </div>

          {/* 3D ARENA VISUAL DOCK */}
          <div style={{ height: "320px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#050811" }}>
            <ThreeArena
              models={models}
              playerName={player.name}
              opponentName={rival.name}
              playerAvatar={playerPortrait}
              opponentAvatar={getAvatarPreset(rival.portraitId)}
              compact
              className="dashboard-three-arena"
            />
          </div>
        </section>

        {/* SECTION: SELECT YOUR GRADE / CURRICULUM COHORT */}
        <section style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.15em", color: "#00F2FE", textTransform: "uppercase" }}>
                CURRICULUM HUBS
              </span>
              <h2 style={{ fontSize: "1.6rem", margin: "4px 0 0 0" }}>Choose Your Grade to Duel</h2>
            </div>
            <span style={{ color: "#9CA3AF", fontSize: "0.9rem" }}>Choose a cohort for curriculum-matched rounds.</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {COHORTS.map(cohort => (
              <Link
                key={cohort.grade}
                to="/battle"
                state={{ grade: cohort.grade }}
                aria-label={`Start a ${cohort.label} battle`}
                style={{
                  display: "block",
                  background: activeGrade === cohort.grade ? "rgba(0, 242, 254, 0.1)" : "rgba(14, 18, 33, 0.8)",
                  border: activeGrade === cohort.grade ? "2px solid #00F2FE" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "20px",
                  transition: "all 0.2s ease",
                  boxShadow: activeGrade === cohort.grade ? "0 0 20px rgba(0, 242, 254, 0.2)" : "none"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "1.5rem", color: "#00F2FE", fontWeight: 900 }}>{cohort.icon}</span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(0,242,254,0.15)", color: "#00F2FE", padding: "3px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    Grade {cohort.grade} topics
                  </span>
                </div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", color: "#FFFFFF" }}>{cohort.label}</h3>
                <p style={{ margin: "0 0 14px 0", color: "#9CA3AF", fontSize: "0.85rem", lineHeight: 1.4 }}>{cohort.topics}</p>
                <span style={{ color: "#00F2FE", fontSize: "0.85rem", fontWeight: 800 }}>Play 1v1 →</span>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
          <div style={{ background: "rgba(14, 18, 33, 0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontSize: "1.3rem", margin: "0 0 12px" }}>How a battle works</h2>
            <ol style={{ display: "grid", gap: "12px", paddingLeft: "22px", color: "#D1D5DB", lineHeight: 1.6 }}>
              <li>Choose your class to select grade-aligned questions.</li>
              <li>Pick a battle mode and play five progressively leveled rounds.</li>
              <li>Review the answer and worked explanation after each round.</li>
              <li>Use an invite code to play with someone on another device.</li>
            </ol>
            <Link to="/battle" className="dashboard-primary-btn" style={{ display: "inline-block", marginTop: "8px", padding: "10px 16px" }}>
              Explore the battle modes →
            </Link>
          </div>

          <div style={{ background: "rgba(14, 18, 33, 0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontSize: "1.3rem", margin: "0 0 12px" }}>Available game modes</h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {MINI_GAME_MODES.map(mode => (
                <article key={mode.id} style={{ padding: "10px 12px", borderRadius: "9px", background: "rgba(255,255,255,0.025)" }}>
                  <h3 style={{ margin: "0 0 4px", color: "#9CEEFF", fontSize: "0.95rem" }}>{mode.name}</h3>
                  <p style={{ margin: 0, color: "#B7BAD3", fontSize: "0.82rem", lineHeight: 1.5 }}>
                    {mode.id === "memory-logic"
                      ? "Watch a signal sequence, then replay it from memory."
                      : mode.id === "mixed-arcade"
                        ? "Rotate through the available game themes across the five levels."
                        : mode.id === "code-runner"
                          ? "Answer curriculum questions through a runner-themed gate interface."
                          : "Answer curriculum questions through a tower-defense-themed interface."}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
