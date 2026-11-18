# BrainBytes ⚡ 1v1 Real-Time Academic Arena (STEM Hackathon Edition)

**BrainBytes** transforms STEM education into an esports-style 1v1 competitive arena. Unlike passive quiz tools or static flashcards, BrainBytes empowers students from **Class 7th to Advanced levels** to duel head-to-head in real time on their specific school curriculum.

---

## 🏆 What Makes BrainBytes Win Over Traditional Platforms

| Traditional LMS & Quiz Tools | BrainBytes 1v1 Arena |
| :--- | :--- |
| **Passive memorization** (solitary MCQs, slow pace) | **High-stakes real-time duels** (speed strikes, live 100 HP, race tracks) |
| **One-size-fits-all questions** (unfair cross-grade mixing) | **Strict Class Cohort Matchmaking** (Class 7 vs Class 7, Class 10 vs Class 10) |
| **Static scoring** (who answers whenever gets points) | **First-to-Answer Combat** (first correct answer lands the hit; late answers take damage) |
| **No strategy** (just clicking answers) | **Tactical STEM Power-Ups** (Quantum Shield, Overclock 1.8x, 50/50 Byte Hack) |
| **Generic answer keys** ("Correct is B") | **Misconception Diagnostics** (explains *why* the wrong trap was tempting) |
| **No school scalability** (just a quiz) | **Live Teacher / District Analytics Radar** (identifies syllabus weaknesses in real time) |

---

## 🚀 Key Features

1. **Class-Specific Matchmaking & Curricula**:
   - Students select their cohort: **Class 7, Class 8, Class 9, Class 10, or Class 11-12 & Advanced**.
   - The matchmaking queue pairs students **strictly within their grade level**.
   - Questions are dynamically generated from their grade's syllabus across **Math, Physics/Science, Logic, and Coding**.

2. **5 Progressive Difficulty Levels (Different Every Match)**:
   - Escalates from **Level 1: Novice (Easy)** up to **Level 5: Grandmaster (Expert)**.
   - Questions are procedurally randomized each duel so students never face the same test twice.

3. **Tactical Esports Power-Ups**:
   - 🛡️ **Quantum Shield**: Arms a protective forcefield to absorb the opponent's next incoming strike.
   - ⚡ **Overclock (1.8x Damage)**: Overcharges your next correct answer into a critical strike.
   - 💡 **50/50 Byte Hack**: Instantly purges two incorrect choices from the screen.

4. **Zero-Latency Sound Synthesizer**:
   - Built on the native Web Audio API: instant laser strikes, shield deflections, power-up chimes, and victory fanfares without downloading any external mp3 files.

5. **Teacher & Judge Diagnostic Radar (`/teacher`)**:
   - Visual syllabus heatmaps pinpointing specific class weaknesses (e.g. *Class 7: 58% error rate on Negative Integer Subtraction*).
   - Speed metrics, retention gains, and automated targeted remediation suggestions.

---

## 🛠️ How to Run & Demo Live for Judges

### Terminal 1: Backend (Port 3001)
```powershell
cd backend
npm install
npm run dev
```

### Terminal 2: Frontend (Port 5173)
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in two browser windows side by side to demonstrate the live 1v1 duel to judges!
