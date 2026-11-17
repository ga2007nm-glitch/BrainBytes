import React, { useState } from 'react';
import GameArena from './GameArena'; // Your component!

export default function PlayPage() {
  const [totalScore, setTotalScore] = useState(0);

  return (
    <div className="bg-slate-900 min-h-screen text-white p-6">
      {/* Member 1's global UI */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Syem Hackathon Arena</h1>
        <div className="bg-blue-600 px-4 py-2 rounded-lg">Score: {totalScore} XP</div>
      </header>

      {/* EMBEDDING YOUR GAME ARENA WITH PROPS & CALLBACKS */}
      <GameArena 
        levelData={{ id: 3, topic: "Fractions & Loops" }} // PROPS IN
        onScoreUpdate={(earned) => setTotalScore(prev => prev + earned)} // CALLBACK OUT
        onLevelComplete={() => alert("Level Finished!")} // CALLBACK OUT
      />
    </div>
  );
}