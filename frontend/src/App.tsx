import { useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";

type Subject = {
  name: string;
  icon: string;
  color: string;
  lessons: number;
  progress: number;
  description: string;
};

const subjects: Subject[] = [
  {
    name: "Mathematics",
    icon: "📐",
    color: "math",
    lessons: 24,
    progress: 75,
    description: "Explore numbers, patterns, geometry and puzzles."
  },
  {
    name: "Computer Science",
    icon: "💻",
    color: "computer",
    lessons: 18,
    progress: 55,
    description: "Discover coding, algorithms and how computers work."
  },
  {
    name: "Logical Thinking",
    icon: "🧩",
    color: "logic",
    lessons: 15,
    progress: 40,
    description: "Build problem-solving skills with brain-teasing challenges."
  }
];

const navigation = [
  { to: "/", icon: "⌂", label: "Dashboard", end: true },
  { to: "/learning", icon: "▤", label: "My Learning" },
  { to: "/challenges", icon: "♧", label: "Challenges" },
  { to: "/leaderboard", icon: "♛", label: "Leaderboard" },
  { to: "/profile", icon: "◉", label: "My Profile" }
];

function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <article className={`subject-card ${subject.color}`}>
      <div className="subject-icon" aria-hidden="true">{subject.icon}</div>
      <h3>{subject.name}</h3>
      <p>{subject.description}</p>
      <div className="progress-info">
        <span>{subject.lessons} lessons</span>
        <strong>{subject.progress}%</strong>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-label={`${subject.name} progress`}
        aria-valuenow={subject.progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${subject.progress}%` }} />
      </div>
      <Link className="learn-btn" to="/learning">Explore subject <span aria-hidden="true">→</span></Link>
    </article>
  );
}

function Dashboard({ grade, onGradeChange }: { grade: string; onGradeChange: (grade: string) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <span className="hero-label">YOUR LEARNING JOURNEY</span>
          <h1>Big ideas.<br />Bright future.</h1>
          <p>Level up in maths and computer science with hands-on lessons, clever puzzles and challenges made for you.</p>
          <Link className="start-btn" to="/learning">Start learning <span aria-hidden="true">→</span></Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="art-orbit orbit-one" />
          <span className="art-orbit orbit-two" />
          <span className="art-star star-one">✦</span>
          <span className="art-star star-two">✧</span>
          <span className="art-planet">🪐</span>
          <span className="art-book">📚</span>
          <span className="art-rocket">🚀</span>
          <span className="art-spark">✦</span>
        </div>
        <span className="hero-decoration decoration-one" aria-hidden="true" />
        <span className="hero-decoration decoration-two" aria-hidden="true" />
      </section>

      <section className="grade-section">
        <div>
          <p className="eyebrow">YOUR CLASS</p>
          <h2>Choose your learning level</h2>
        </div>
        <label className="class-select-label" htmlFor="grade-select">My class
          <select id="grade-select" className="grade-select" value={grade} onChange={(event) => onGradeChange(event.target.value)}>
            {["7th", "8th", "9th", "10th", "11th", "12th"].map((level) => <option key={level} value={`${level} Standard`}>{level} Standard</option>)}
          </select>
        </label>
      </section>

      <section className="stats" aria-label="Learning statistics">
        <div className="stat-card purple"><span aria-hidden="true">🔥</span><div><h3>7 days</h3><p>Learning streak</p></div></div>
        <div className="stat-card yellow"><span aria-hidden="true">⭐</span><div><h3>1,250</h3><p>Total XP points</p></div></div>
        <div className="stat-card green"><span aria-hidden="true">📖</span><div><h3>12</h3><p>Lessons completed</p></div></div>
        <div className="stat-card pink"><span aria-hidden="true">🏆</span><div><h3>Level 4</h3><p>Current level</p></div></div>
      </section>

      <section className="subjects-section">
        <div className="section-heading">
          <div><p className="eyebrow">PICK YOUR NEXT ADVENTURE</p><h2>Explore your subjects</h2></div>
          <Link to="/learning" className="text-link">View all <span aria-hidden="true">→</span></Link>
        </div>
        <div className="subject-grid">{subjects.map((subject) => <SubjectCard key={subject.name} subject={subject} />)}</div>
      </section>

      <section className="bottom-grid">
        <article className="daily-card">
          <span className="card-emoji" aria-hidden="true">🎯</span>
          <p className="eyebrow">A LITTLE PRACTICE GOES A LONG WAY</p>
          <h2>Daily challenge</h2>
          <p>Try a quick maths puzzle and earn 100 XP for your effort.</p>
          <Link className="small-action" to="/challenges">Take the challenge <span aria-hidden="true">→</span></Link>
        </article>
        <article className="motivation-card">
          <span className="card-emoji" aria-hidden="true">💡</span>
          <p className="eyebrow">TODAY'S BYTE</p>
          <h2>Did you know?</h2>
          <p>Computers use combinations of 0s and 1s called binary to store and process information.</p>
        </article>
      </section>
    </>
  );
}

function LearningPage() {
  return (
    <section className="page-content">
      <p className="eyebrow">YOUR CLASSROOM</p>
      <h1>My learning</h1>
      <p className="page-lead">Pick up where you left off, or explore a new subject.</p>
      <div className="subject-grid">{subjects.map((subject) => <SubjectCard key={subject.name} subject={subject} />)}</div>
    </section>
  );
}

function ChallengesPage() {
  return (
    <section className="page-content">
      <p className="eyebrow">PLAY • THINK • LEVEL UP</p>
      <h1>Fun challenges</h1>
      <p className="page-lead">Put your skills to the test and earn XP as you go.</p>
      <div className="challenge-grid">
        <article className="challenge-card math"><span className="challenge-icon">🧮</span><p className="eyebrow">MATHS • 10 MIN</p><h2>Number ninja</h2><p>Use your number sense to solve a series of quick-fire puzzles.</p><span className="challenge-reward">⭐ 100 XP</span><button className="learn-btn" type="button">Coming soon</button></article>
        <article className="challenge-card computer"><span className="challenge-icon">🤖</span><p className="eyebrow">CODING • 15 MIN</p><h2>Robot route</h2><p>Guide a robot through a maze using step-by-step instructions.</p><span className="challenge-reward">⭐ 150 XP</span><button className="learn-btn" type="button">Coming soon</button></article>
      </div>
    </section>
  );
}

function LeaderboardPage() {
  const learners = [["🥇", "Alex", "2,500 XP"], ["🥈", "Sam", "2,100 XP"], ["🥉", "Riya", "1,800 XP"], ["✨", "You", "1,250 XP"]];
  return (
    <section className="page-content">
      <p className="eyebrow">FRIENDLY COMPETITION</p>
      <h1>Leaderboard</h1>
      <p className="page-lead">Celebrate the learners making progress this week.</p>
      <div className="leaderboard">{learners.map(([medal, name, xp], index) => <div className={`leader-row ${name === "You" ? "you-row" : ""}`} key={name}><span className="leader-rank">{medal}</span><span className="rank-number">0{index + 1}</span><strong>{name}</strong><span className="leader-xp">{xp}</span></div>)}</div>
    </section>
  );
}

function ProfilePage({ grade }: { grade: string }) {
  return (
    <section className="page-content profile">
      <div className="profile-card">
        <div className="profile-avatar" aria-hidden="true">🧑‍🚀</div>
        <p className="eyebrow">YOUR LEARNING PROFILE</p>
        <h1>Super learner!</h1>
        <p className="page-lead">{grade} student • Curious mind</p>
        <div className="profile-stats">
          <div><strong>1,250</strong><span>XP earned</span></div>
          <div><strong>12</strong><span>Lessons done</span></div>
          <div><strong>7 days</strong><span>Best streak</span></div>
        </div>
      </div>
      <div className="profile-note"><span aria-hidden="true">🌱</span><p>Every expert started as a beginner. Keep showing up, keep asking questions, and enjoy the journey.</p></div>
    </section>
  );
}

function App() {
  const [grade, setGrade] = useState("7th Standard");
  const location = useLocation();
  const pageName = navigation.find((item) => item.to === location.pathname)?.label ?? "Dashboard";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="BrainBytes home"><span className="brand-mark">B</span><span>brain<span className="brand-highlight">bytes</span><small>LEARN • PLAY • GROW</small></span></Link>
        <p className="nav-caption">MENU</p>
        <nav className="menu" aria-label="Main navigation">
          {navigation.map(({ to, icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `menu-item${isActive ? " active" : ""}`}>
              <span className="menu-icon" aria-hidden="true">{icon}</span><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-box"><span className="help-icon" aria-hidden="true">🚀</span><h2>Keep it up!</h2><p>Every little step takes you somewhere great.</p><div className="help-progress"><span /></div></div>
          <p className="sidebar-foot">Made for curious minds ✦</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><p className="topbar-date">YOUR SPACE TO GROW</p><h2>{pageName === "Dashboard" ? "Learning dashboard" : pageName}</h2></div>
          <div className="top-right"><span className="xp-pill"><span aria-hidden="true">✦</span> 1,250 XP</span><Link to="/profile" className="avatar" aria-label="Go to your profile">🧑‍🚀</Link></div>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard grade={grade} onGradeChange={setGrade} />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage grade={grade} />} />
          <Route path="*" element={<Dashboard grade={grade} onGradeChange={setGrade} />} />
        </Routes>
        <footer className="footer">BrainBytes <span>•</span> Big ideas start here.</footer>
      </main>
    </div>
  );
}

export default App;