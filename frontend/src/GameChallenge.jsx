import { useEffect, useState } from "react";
import { getMemoryPattern, MINI_GAME_LABELS } from "./gameModes";

const PAD_COLORS = ["#55dbff", "#ad83ff", "#68e5a5", "#ffae6b"];

function ChoiceButtons({ question, onAnswer, disabled, labels }) {
  return (
    <div className="game-choice-grid">
      {question.options.map((option, index) => (
        <button
          className="practice-answer-option game-choice"
          type="button"
          key={option}
          disabled={disabled}
          onClick={() => onAnswer(option)}
        >
          <span>{labels?.[index] || String.fromCharCode(65 + index)}</span>
          {option}
        </button>
      ))}
    </div>
  );
}

function CodeRunner({ question, onAnswer, disabled }) {
  return (
    <div className="arcade-game code-runner-game">
      <div className="runner-track" aria-hidden="true">
        <span className="runner-character">🏃</span>
        <span className="runner-gate gate-one">A</span>
        <span className="runner-gate gate-two">B</span>
        <span className="runner-gate gate-three">C</span>
        <span className="runner-gate gate-four">D</span>
      </div>
      <p className="arcade-instruction">Choose the correct code gate to clear the obstacle.</p>
      <ChoiceButtons
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        labels={["GATE A", "GATE B", "GATE C", "GATE D"]}
      />
    </div>
  );
}

function TowerDefense({ question, onAnswer, disabled }) {
  return (
    <div className="arcade-game tower-defense-game">
      <div className="tower-wave" aria-label="Incoming enemy wave">
        <span className="tower-core">🏰</span>
        <span className="tower-beam" aria-hidden="true" />
        <span className="tower-enemy">👾</span>
        <span className="tower-enemy">👾</span>
        <span className="tower-enemy">👾</span>
        <strong>INCOMING WAVE · SELECT A DEFENSE</strong>
      </div>
      <p className="arcade-instruction">Pick the answer to fire the matching tower and defend your base.</p>
      <ChoiceButtons question={question} onAnswer={onAnswer} disabled={disabled} labels={["⚡ ARC", "❄️ FROST", "🔥 NOVA", "🛡️ PULSE"]} />
    </div>
  );
}

function MemoryLogic({ question, level, onAnswer, disabled }) {
  const pattern = getMemoryPattern(question.id, level);
  const [isShowing, setIsShowing] = useState(true);
  const [sequence, setSequence] = useState([]);
  const [litPad, setLitPad] = useState(-1);

  useEffect(() => {
    setIsShowing(true);
    setSequence([]);
    setLitPad(-1);
    const timers = [];
    pattern.forEach((pad, index) => {
      const start = 250 + index * 650;
      timers.push(window.setTimeout(() => setLitPad(pad), start));
      timers.push(window.setTimeout(() => setLitPad(-1), start + 400));
    });
    timers.push(window.setTimeout(() => setIsShowing(false), 250 + pattern.length * 650));
    return () => timers.forEach(window.clearTimeout);
  }, [question.id, level]);

  function tapPad(index) {
    if (disabled || isShowing) return;
    const next = [...sequence, index];
    setSequence(next);
    setLitPad(index);
    window.setTimeout(() => setLitPad(-1), 180);
    if (next.length === pattern.length) onAnswer(JSON.stringify(next));
  }

  return (
    <div className="arcade-game memory-logic-game">
      <p className="arcade-instruction" aria-live="polite">
        {isShowing ? "Memorize the glowing signal…" : `Replay the ${pattern.length}-tile signal in order.`}
      </p>
      <div className="memory-progress" aria-label={`Signal replay progress ${sequence.length} of ${pattern.length}`}>
        {pattern.map((_, index) => <i className={index < sequence.length ? "complete" : ""} key={index} />)}
      </div>
      <div className="memory-pad-grid">
        {PAD_COLORS.map((color, index) => (
          <button
            type="button"
            className={`memory-pad ${litPad === index ? "lit" : ""}`}
            style={{ "--pad-color": color }}
            key={color}
            aria-label={`Signal tile ${index + 1}`}
            disabled={disabled || isShowing}
            onClick={() => tapPad(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <small className="memory-level-caption">Signal complexity · Level {level}</small>
    </div>
  );
}

export default function GameChallenge({ question, gameMode, level, onAnswer, disabled }) {
  if (!question) return null;

  const mode = gameMode || "mixed-arcade";
  const title = MINI_GAME_LABELS[mode] || MINI_GAME_LABELS["mixed-arcade"];

  return (
    <section className="game-challenge" aria-label={`${title} mini-game`}>
      <div className="game-challenge-heading">
        <span className={`game-mode-icon mode-${mode}`} aria-hidden="true">
          {mode === "code-runner" ? "🏃" : mode === "math-defense" ? "🏰" : mode === "memory-logic" ? "◈" : "🎮"}
        </span>
        <div><small>MINI-GAME · {title.toUpperCase()}</small><p>{question.subject?.toUpperCase() || "STEM"} CHALLENGE</p></div>
      </div>
      {mode !== "memory-logic" && <h2 className="question-prompt-text">{question.prompt}</h2>}
      {mode === "code-runner" && <CodeRunner question={question} onAnswer={onAnswer} disabled={disabled} />}
      {mode === "math-defense" && <TowerDefense question={question} onAnswer={onAnswer} disabled={disabled} />}
      {mode === "memory-logic" && <MemoryLogic question={question} level={level} onAnswer={onAnswer} disabled={disabled} />}
      {mode === "mixed-arcade" && (
        <div className="mixed-arcade-game">
          <p className="arcade-instruction">Clear this level’s challenge to keep your arcade streak alive.</p>
          <ChoiceButtons question={question} onAnswer={onAnswer} disabled={disabled} />
        </div>
      )}
    </section>
  );
}
