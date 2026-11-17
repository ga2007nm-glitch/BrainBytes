
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="navbar">
        <h2 className="logo">HiFor<span>.</span></h2>
        <button onClick={() => navigate("/select")}>
          Get Started →
        </button>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="tag">🚀 THE FUTURE OF LEARNING</p>

          <h1>
            Learn Smart.
            <br />
            Play Hard.
            <br />
            <span>Level Up!</span>
          </h1>

          <p className="description">
            Turn Mathematics and Computer Science into
            an exciting adventure. Explore, play and
            challenge yourself!
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/select")}
          >
            Start Your Adventure 🚀
          </button>

          <div className="features">
            <span>🎮 Fun Learning</span>
            <span>🏆 Earn Rewards</span>
            <span>🧠 Build Skills</span>
          </div>
        </div>

        <div className="hero-3d">
          <div className="orbit"></div>
          <div className="floating-book">📚</div>
          <div className="floating-rocket">🚀</div>
          <div className="floating-star">⭐</div>
          <div className="floating-brain">🧠</div>
        </div>
      </section>

      <section className="landing-bottom">
        <h2>Learning Made an Adventure!</h2>
        <p>Choose your level. Explore your subjects. Become a champion.</p>
      </section>
    </div>
  );
}
