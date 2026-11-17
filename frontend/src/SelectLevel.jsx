
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SelectLevel() {
  const navigate = useNavigate();

  const [grade, setGrade] = useState("7th Standard");
  const [subject, setSubject] = useState("Mathematics");

  const grades = [
    "7th Standard",
    "8th Standard",
    "9th Standard",
    "10th Standard",
    "11th Standard",
    "12th Standard"
  ];

  const subjects = [
    { name: "Mathematics", icon: "📐" },
    { name: "Computer Science", icon: "💻" }
  ];

  function enterArena() {
    navigate("/arena", {
      state: {
        grade: grade,
        subject: subject
      }
    });
  }

  return (
    <div className="selection-page">
      <h1>Choose Your Adventure 🎮</h1>
      <p>Select your class and favourite subject to begin.</p>

      <div className="selection-box">
        <h2>🎓 Select Your Grade</h2>

        <div className="grade-grid">
          {grades.map((g) => (
            <button
              key={g}
              className={grade === g ? "grade-card selected" : "grade-card"}
              onClick={() => setGrade(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <h2 className="subject-heading">📚 Select Your Subject</h2>

        <div className="subject-grid">
          {subjects.map((s) => (
            <button
              key={s.name}
              className={
                subject === s.name
                  ? "subject-option chosen"
                  : "subject-option"
              }
              onClick={() => setSubject(s.name)}
            >
              <span>{s.icon}</span>
              <h3>{s.name}</h3>
            </button>
          ))}
        </div>

        <div className="selection-summary">
          <p>YOUR SELECTION</p>
          <h3>{grade} • {subject}</h3>
        </div>

        <button className="primary-btn enter-btn" onClick={enterArena}>
          Enter Learning Arena 🚀
        </button>
      </div>
    </div>
  );
}
