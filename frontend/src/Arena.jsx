
import { useLocation, useNavigate } from "react-router-dom";

export default function Arena() {
  const location = useLocation();
  const navigate = useNavigate();

  const { grade, subject } = location.state || {};

  if (!grade || !subject) {
    return (
      <div className="arena">
        <h1>No Level Selected!</h1>
        <button
          className="primary-btn"
          onClick={() => navigate("/select")}
        >
          Select Your Level
        </button>
      </div>
    );
  }

  return (
    <div className="arena">
      <div className="arena-top">
        <button onClick={() => navigate("/select")}>
          ← Change Level
        </button>
        <h2>HiFor 🎮</h2>
      </div>

      <div className="arena-content">
        <div className="arena-icon">🚀</div>

        <p className="tag">WELCOME TO YOUR LEARNING WORLD</p>

        <h1>Ready, Champion?</h1>

        <div className="selected-details">
          <div>
            <span>🎓 Selected Grade</span>
            <h2>{grade}</h2>
          </div>

          <div>
            <span>📚 Selected Subject</span>
            <h2>{subject}</h2>
          </div>
        </div>

        <h3>Your Adventure Starts Here!</h3>

        <p>
          Explore lessons, solve challenges and earn rewards
          in your {subject} learning journey.
        </p>

        <button
          className="primary-btn"
          onClick={() => alert("Learning modules coming soon!")}
        >
          Start Learning 🎯
        </button>
      </div>
    </div>
  );
}
