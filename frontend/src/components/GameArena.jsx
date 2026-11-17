import React, { useState, useEffect, useRef } from 'react';

// Default fallback level if Member 1 hasn't passed levelData yet
const DEFAULT_LEVEL = {
  id: 'math_code_01',
  title: 'Mission 1: Coordinate Loop Jump',
  description: 'Program the thruster loop to collect the Energy Core at Target (4, 3) without hitting the asteroid!',
  target: { x: 4, y: 3 },
  obstacle: { x: 2, y: 2 },
  timeLimit: 60, // seconds
  correctFormulaHint: 'Move East 4 units, then North 3 units (4 + 3 = 7 total steps)'
};

export default function GameArena({ 
  levelData = DEFAULT_LEVEL, 
  onScoreUpdate = () => {}, 
  onLevelComplete = () => {} 
}) {
  // --- REAL-TIME HUD STATE ---
  const [timeLeft, setTimeLeft] = useState(levelData.timeLimit || 60);
  const [streak, setStreak] = useState(1);
  const [score, setScore] = useState(0);
  const [scorePopups, setScorePopups] = useState([]); // Floating "+100 XP" tags
  const [shakeScreen, setShakeScreen] = useState(false);

  // --- GAMEPLAY & INPUT STATE (Math + Coding Bridge) ---
  const [loopCountX, setLoopCountX] = useState(1); // Coding: for(i=0; i<loopCountX; i++)
  const [loopCountY, setLoopCountY] = useState(1); // Math: Delta Y coordinate
  const [isSimulating, setIsSimulating] = useState(false);
  const [modalState, setModalState] = useState(null); // 'WIN' | 'LOSS' | null
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // --- CANVAS REFS ---
  const canvasRef = useRef(null);
  const shipPos = useRef({ x: 0, y: 0 }); // Grid coordinates (0 to 5)
  const particles = useRef([]);

  // 1. LIVE COUNTDOWN TIMER
  useEffect(() => {
    if (modalState || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerLoss("Time's up! Out of fuel.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [modalState, timeLeft]);

  // 2. HTML5 CANVAS RENDER LOOP (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const gridSize = 6; // 6x6 Coordinate Grid (0 to 5)
    const padding = 45;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cellW = (width - padding * 2) / (gridSize - 1);
      const cellH = (height - padding * 2) / (gridSize - 1);

      // Helper: Convert Grid (x,y) to Canvas Pixels (Bottom-Left origin like standard Math Graph!)
      const toPixel = (gx, gy) => ({
        px: padding + gx * cellW,
        py: height - padding - gy * cellH
      });

      // Clear Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Draw Math Coordinate Grid & Axis Labels
      ctx.lineWidth = 1;
      ctx.font = '12px monospace';
      for (let i = 0; i < gridSize; i++) {
        const { px } = toPixel(i, 0);
        const { py } = toPixel(0, i);

        // Vertical grid line
        ctx.strokeStyle = i === 0 ? '#38bdf8' : '#1e293b';
        ctx.beginPath();
        ctx.moveTo(px, padding);
        ctx.lineTo(px, height - padding);
        ctx.stroke();

        // Horizontal grid line
        ctx.strokeStyle = i === 0 ? '#38bdf8' : '#1e293b';
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(width - padding, py);
        ctx.stroke();

        // Axis Numbers (0 to 5)
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(i, px - 4, height - padding + 20); // X-axis
        ctx.fillText(i, padding - 22, py + 4);         // Y-axis
      }

      // Draw Obstacle (Asteroid)
      const obs = toPixel(levelData.obstacle.x, levelData.obstacle.y);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(obs.px, obs.py, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('HAZARD', obs.px - 22, obs.py - 22);

      // Draw Target Energy Core (Pulsing Glow)
      const tgt = toPixel(levelData.target.x, levelData.target.y);
      const pulse = Math.sin(Date.now() / 200) * 4;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.arc(tgt.px, tgt.py, 22 + pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(tgt.px, tgt.py, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText(`(${levelData.target.x}, ${levelData.target.y})`, tgt.px - 16, tgt.py - 20);

      // Draw Player Rocket Ship
      const ship = toPixel(shipPos.current.x, shipPos.current.y);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(ship.px + 16, ship.py);
      ctx.lineTo(ship.px - 12, ship.py - 11);
      ctx.lineTo(ship.px - 7, ship.py);
      ctx.lineTo(ship.px - 12, ship.py + 11);
      ctx.closePath();
      ctx.fill();

      // Update & Draw Particle Effects
      particles.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        if (p.alpha <= 0) {
          particles.current.splice(idx, 1);
          return;
        }
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [levelData]);

  // --- PARTICLE BURST HELPER ---
  const spawnParticles = (gx, gy, rgbColor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cellW = (canvas.width - 90) / 5;
    const cellH = (canvas.height - 90) / 5;
    const px = 45 + gx * cellW;
    const py = canvas.height - 45 - gy * cellH;

    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particles.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: rgbColor,
        alpha: 1
      });
    }
  };

  // --- FLOATING SCORE POPUP HELPER ---
  const triggerScorePopup = (text) => {
    const id = Date.now();
    setScorePopups((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  };

  // --- EXECUTE CODE + MATH SIMULATION ---
  const handleRunCode = async () => {
    if (isSimulating || modalState) return;
    setIsSimulating(true);
    shipPos.current = { x: 0, y: 0 };

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Step 1: Execute X-Axis Loop
    for (let i = 0; i < loopCountX; i++) {
      await sleep(300);
      shipPos.current.x = Math.min(5, shipPos.current.x + 1);
      spawnParticles(shipPos.current.x, shipPos.current.y, '56, 189, 248');

      // Check Obstacle Collision
      if (
        shipPos.current.x === levelData.obstacle.x &&
        shipPos.current.y === levelData.obstacle.y
      ) {
        triggerLoss('Crashed into Asteroid Hazard at (2, 2)!');
        return;
      }
    }

    // Step 2: Execute Y-Axis Loop
    for (let j = 0; j < loopCountY; j++) {
      await sleep(300);
      shipPos.current.y = Math.min(5, shipPos.current.y + 1);
      spawnParticles(shipPos.current.x, shipPos.current.y, '56, 189, 248');

      if (
        shipPos.current.x === levelData.obstacle.x &&
        shipPos.current.y === levelData.obstacle.y
      ) {
        triggerLoss('Crashed into Asteroid Hazard at (2, 2)!');
        return;
      }
    }

    // Step 3: Evaluate Final Coordinate
    await sleep(250);
    if (
      shipPos.current.x === levelData.target.x &&
      shipPos.current.y === levelData.target.y
    ) {
      const earned = 100 * streak + timeLeft * 2;
      setScore((s) => s + earned);
      setStreak((st) => st + 1);
      spawnParticles(shipPos.current.x, shipPos.current.y, '16, 185, 129');
      triggerScorePopup(`+${earned} XP!`);
      onScoreUpdate(earned); // Notify Member 1!
      setFeedbackMsg(`Exact match! Landed on (${levelData.target.x}, ${levelData.target.y}).`);
      setModalState('WIN');
    } else {
      triggerLoss(
        `Stopped at (${shipPos.current.x}, ${shipPos.current.y}). Target was (${levelData.target.x}, ${levelData.target.y}).`
      );
    }
    setIsSimulating(false);
  };

  const triggerLoss = (reason) => {
    setIsSimulating(false);
    setStreak(1); // Reset combo streak
    setShakeScreen(true);
    spawnParticles(shipPos.current.x, shipPos.current.y, '239, 68, 68');
    setTimeout(() => setShakeScreen(false), 500);
    setFeedbackMsg(reason);
    setModalState('LOSS');
  };

  const resetArena = () => {
    shipPos.current = { x: 0, y: 0 };
    setModalState(null);
    setTimeLeft(levelData.timeLimit || 60);
  };

  return (
    <div
      className={`relative w-full max-w-5xl mx-auto bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl text-white transition-transform ${
        shakeScreen ? 'animate-bounce border-red-500' : ''
      }`}
    >
      {/* ================= TOP REAL-TIME HUD ================= */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
            Math × Code Arena
          </span>
          <h2 className="text-lg font-bold text-white">{levelData.title}</h2>
        </div>

        {/* Live Stats Pills */}
        <div className="flex items-center gap-4">
          {/* Streak Counter */}
          <div className="bg-orange-500/20 border border-orange-500/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-orange-400">{streak}x Streak</span>
          </div>

          {/* Score Counter */}
          <div className="bg-emerald-500/20 border border-emerald-500/50 px-4 py-1.5 rounded-xl font-mono font-bold text-emerald-400">
            {score} XP
          </div>

          {/* Live Timer */}
          <div
            className={`px-4 py-1.5 rounded-xl font-mono font-bold border ${
              timeLeft <= 10
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-cyan-300'
            }`}
          >
            ⏱ {timeLeft}s
          </div>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000 linear"
          style={{ width: `${(timeLeft / (levelData.timeLimit || 60)) * 100}%` }}
        />
      </div>

      {/* ================= MAIN SPLIT ARENA ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {/* LEFT PANEL: Interactive Code + Math Controls (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950/70 p-5 rounded-xl border border-slate-800">
          <div>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              {levelData.description}
            </p>

            {/* Visual Code Block Editor */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 font-mono text-sm space-y-4">
              <div className="text-slate-400">// Step 1: Move East along X-Axis</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-purple-400">for</span> (let x = 0; x &lt;
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={loopCountX}
                  onChange={(e) => setLoopCountX(Number(e.target.value))}
                  className="w-14 bg-slate-800 border border-cyan-500 rounded px-2 py-1 text-center text-cyan-300 font-bold focus:outline-none"
                />
                ; x++) &#123; <span className="text-amber-300">moveEast()</span>; &#125;
              </div>

              <div className="text-slate-400 pt-2">// Step 2: Move North along Y-Axis</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-purple-400">for</span> (let y = 0; y &lt;
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={loopCountY}
                  onChange={(e) => setLoopCountY(Number(e.target.value))}
                  className="w-14 bg-slate-800 border border-cyan-500 rounded px-2 py-1 text-center text-cyan-300 font-bold focus:outline-none"
                />
                ; y++) &#123; <span className="text-amber-300">moveNorth()</span>; &#125;
              </div>
            </div>

            {/* Live Math Formula Preview */}
            <div className="mt-4 bg-cyan-950/40 border border-cyan-800/50 p-3 rounded-lg text-xs text-cyan-200 flex justify-between">
              <span>Calculated Displacement:</span>
              <span className="font-mono font-bold">
                (0 + {loopCountX}, 0 + {loopCountY}) = ({loopCountX}, {loopCountY})
              </span>
            </div>
          </div>

          <button
            onClick={handleRunCode}
            disabled={isSimulating}
            className="mt-6 w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 active:scale-95 transition disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            {isSimulating ? '🚀 Executing Loop...' : '▶ Run Code & Launch'}
          </button>
        </div>

        {/* RIGHT PANEL: HTML5 Coordinate Canvas (7 Cols) */}
        <div className="lg:col-span-7 relative flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800 p-2">
          <canvas
            ref={canvasRef}
            width={480}
            height={380}
            className="w-full h-auto rounded-lg"
          />

          {/* Floating Score Popups */}
          {scorePopups.map((popup) => (
            <div
              key={popup.id}
              className="absolute top-8 right-8 bg-emerald-500 text-slate-950 font-extrabold px-4 py-1.5 rounded-full shadow-lg animate-bounce"
            >
              {popup.text}
            </div>
          ))}
        </div>
      </div>

      {/* ================= WIN / LOSS MODAL OVERLAY ================= */}
      {modalState && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6 z-20">
          <div className="bg-slate-900 border-2 border-slate-700 max-w-md w-full rounded-2xl p-6 text-center shadow-2xl">
            <div className="text-5xl mb-3">{modalState === 'WIN' ? '🏆' : '💥'}</div>
            <h3
              className={`text-2xl font-extrabold mb-2 ${
                modalState === 'WIN' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {modalState === 'WIN' ? 'Mission Accomplished!' : 'Trajectory Off Course!'}
            </h3>
            <p className="text-slate-300 text-sm mb-4">{feedbackMsg}</p>

            {modalState === 'LOSS' && (
              <div className="bg-slate-800/80 p-3 rounded-lg text-xs text-amber-300 mb-5">
                💡 <strong>Hint:</strong> {levelData.correctFormulaHint}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={resetArena}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm transition"
              >
                {modalState === 'WIN' ? 'Replay Level' : 'Try Again'}
              </button>

              {modalState === 'WIN' && (
                <button
                  onClick={() => onLevelComplete({ score, streak, timeLeft })}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
                >
                  Next Mission →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}