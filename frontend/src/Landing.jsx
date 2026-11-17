import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThreeArena from "./ThreeArena";
import useFighterModels from "./useFighterModels";
import { generateOpponent, loadSavedAvatar } from "./avatarModel";

const subjects = [
  { icon: "∑", name: "Mathematics", detail: "Numbers, patterns & logic", color: "violet" },
  { icon: "</>", name: "Computer Science", detail: "Code, algorithms & more", color: "cyan" },
  { icon: "✦", name: "Daily challenge", detail: "A new brain-teaser every day", color: "gold" }
];

export default function Landing() {
  const navigate = useNavigate();
  const [saved] = useState(loadSavedAvatar);
  const [rival] = useState(() => generateOpponent(saved.avatar.name));
  const [modelError, setModelError] = useState("");
  const { models, storageError } = useFighterModels();
  const player = saved.avatar;

  return (
    <main className="duel-dashboard">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/" aria-label="BrainBytes dashboard">
          <span className="brand-mark">B</span>
          <span>Brain<span className="brand-accent">Bytes</span><small>LEARNING ARENA</small></span>
        </Link>

        <p className="dashboard-nav-label">PLAY</p>
        <nav className="dashboard-nav" aria-label="Main navigation">
          <Link className="dashboard-nav-link active" to="/" aria-current="page"><span>⌂</span> Dashboard</Link>
          <Link className="dashboard-nav-link" to="/battle"><span>⚔</span> Battle arena</Link>
          <Link className="dashboard-nav-link" to="/select"><span>⌘</span> Learn &amp; practice</Link>
          <Link className="dashboard-nav-link" to="/avatar"><span>◉</span> Avatar studio</Link>
        </nav>

        <div className="sidebar-quest">
          <span className="quest-icon">✦</span>
          <p className="dashboard-nav-label">DAILY QUEST</p>
          <h3>Warm up your brain</h3>
          <p>Complete one practice round to keep your streak alive.</p>
          <Link to="/select" className="quest-link">Start quest <span>→</span></Link>
        </div>

        <div className="sidebar-profile">
          <span className="dashboard-avatar-badge" aria-hidden="true">{models.player ? "3D" : "＋"}</span>
          <span><strong>{player.name}</strong><small>{models.player ? "3D fighter ready" : "Add a 3D fighter"}</small></span>
          <Link to="/avatar" aria-label="Edit avatar">···</Link>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">YOUR LEARNING SPACE</p>
            <h1>Welcome back, <span>{player.name}</span></h1>
          </div>
          <div className="topbar-actions">
            <span className="resource-pill"><span>✦</span> 1,250 XP</span>
            <span className="streak-pill"><span>♨</span> 3 day streak</span>
            <Link to="/avatar" className="topbar-avatar dashboard-avatar-badge" aria-label="Open avatar studio">
              {models.player ? "3D" : "＋"}
            </Link>
          </div>
        </header>

        {saved.error && <p className="avatar-message error" role="alert">{saved.error}</p>}
        {(storageError || modelError) && <p className="avatar-message error" role="alert">{storageError || modelError}</p>}

        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <span className="hero-kicker"><span className="live-dot" /> THE ARENA IS OPEN</span>
            <h2>Think fast.<br /><span>Code your way</span><br />to victory.</h2>
            <p>Sharpen your skills with bite-sized challenges, then take on a practice rival in the arena.</p>
            <div className="dashboard-hero-actions">
              <button type="button" className="dashboard-primary-btn" onClick={() => navigate("/battle")}>
                Enter the arena <span>→</span>
              </button>
              <Link to="/select" className="dashboard-quiet-link">Explore lessons</Link>
            </div>
          </div>
          <div className="dashboard-fighter-art">
            <ThreeArena
              models={models}
              playerName={player.name}
              opponentName={rival.name}
              compact
              className="dashboard-three-arena"
              onModelError={setModelError}
            />
          </div>
          <div className="hero-corner-mark">BB<span>01</span></div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div><p className="dashboard-eyebrow">PICK YOUR NEXT MOVE</p><h2>Jump back in</h2></div>
            <Link to="/select" className="dashboard-view-link">All activities <span>→</span></Link>
          </div>
          <div className="activity-grid">
            {subjects.map((subject, index) => (
              <button
                type="button"
                className={`activity-card activity-${subject.color}`}
                key={subject.name}
                onClick={() => navigate(index === 2 ? "/battle" : "/select")}
              >
                <span className="activity-icon">{subject.icon}</span>
                <span className="activity-content"><strong>{subject.name}</strong><small>{subject.detail}</small></span>
                <span className="activity-arrow">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-bottom-grid">
          <article className="progress-panel">
            <div className="dashboard-section-heading">
              <div><p className="dashboard-eyebrow">KEEP IT UP</p><h2>Your progress</h2></div>
              <span className="progress-level">LEVEL 04</span>
            </div>
            <div className="progress-summary"><strong>850 <small>/ 1,200 XP</small></strong><span>350 XP to level 5</span></div>
            <div className="progress-track" role="progressbar" aria-label="Progress to level 5" aria-valuenow="71" aria-valuemin="0" aria-valuemax="100">
              <span />
            </div>
            <div className="progress-details"><span>✦ 12 challenges solved</span><span>⚡ 3 day streak</span></div>
          </article>

          <article className="dashboard-rank-panel">
            <div className="rank-orb"><span>♛</span></div>
            <div><p className="dashboard-eyebrow">NEXT RANK</p><h2>Code Explorer</h2><p>Keep learning to unlock your next arena badge.</p></div>
            <Link to="/select" aria-label="Continue learning">→</Link>
          </article>
        </section>

        <footer className="dashboard-footer">BRAINBYTES <span>·</span> LEARN. PLAY. LEVEL UP.</footer>
      </section>
    </main>
  );
}
