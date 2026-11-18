# BrainBytes

BrainBytes is a STEM learning prototype that turns grade-level math, science, logic, and coding questions into short competitive battles. It is designed for classroom demonstrations and practice; it is not yet a production learning-management or student-account system.

## What works in the prototype

- Five progressively leveled rounds for supported cohorts (Classes 7–10 and 11–12+).
- Practice against a bot, same-device two-player practice, and invite-code matches between devices connected to the same backend.
- Four selectable modes: Mixed Arcade rotates through math, coding, and logic questions; Code Runner selects coding questions; Math Tower Defense selects math questions; and Memory & Logic selects logic questions and uses an actual sequence-recall interaction. Code Runner and Math Tower Defense remain themed question interfaces, not standalone platformer or tower-defense simulations.
- Completed question IDs are saved in the current browser and excluded from future matches across grades and game modes. Each grade/subject/difficulty currently has 20 generated variants, supporting about 20 matches per isolated mode/grade before exhaustion; playing Mixed Arcade also consumes questions from the subject-specific modes. The match-end review lists each completed challenge, its answer, and its explanation. If a grade/mode pool has no unused questions left, the game reports that instead of repeating one.
- Selectable illustrated avatars and optional GLB/VRM fighter uploads. Avatar choices and uploaded models are stored in the current browser.
- A teacher analytics page that aggregates observed answer attempts by grade and subject, with CSV export. The dashboard does not claim learning-retention gains.

## Important prototype limitations

- Questions come from curated prompts plus deterministic numeric, code, and logic variants; they are not AI-generated. Review the question templates and answers with a subject teacher before classroom use.
- Matchmaking, sessions, and analytics are held in backend memory. They are lost when the backend restarts and are not shared across multiple backend instances.
- The profile form collects a display name, grade, and avatar locally. It is not real authentication, and student records are not persisted to a database.
- Completed-question history is local to one browser profile. It does not sync to another device or another browser profile, and clearing this browser's saved game data allows questions to be selected again.
- Analytics describe activity observed since the current backend process started. They are not a controlled study or proof of learning impact.
- Code Runner and Math Tower Defense are themed question rounds; only Memory & Logic currently has a distinct non-question-choice interaction.

## Run locally

In one terminal:

```powershell
cd backend
npm install
npm run dev
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. To demonstrate an invite match, use two browsers/devices pointed at the same running frontend and backend, create an invite in one, then join with its code in the other.

## Deploy the prototype

The frontend is configured for Vercel, and `render.yaml` describes the long-running Node backend for Render. The backend must not be deployed as stateless Vercel functions: its matchmaking and session state lives in process memory.

1. Deploy the `backend` service from this repository on Render using the included Blueprint. Set `FRONTEND_ORIGIN` to the Vercel frontend's production origin (for example, `https://your-project.vercel.app`).
2. Create a Vercel project for this repository and set its Root Directory to `frontend`. Use the Vite preset and set `VITE_API_BASE_URL` to the Render service URL (for example, `https://brainbytes-api.onrender.com`).
3. Redeploy both services after setting their URLs, then verify the frontend and backend health endpoint. The Vercel rewrite supports React Router paths such as `/battle` and `/teacher`.

The included Render service uses the free plan, which can sleep when idle and cold-start slowly. In-memory sessions, matches, and analytics are also lost when the service restarts; use persistent storage and a non-sleeping backend plan before relying on it for a live classroom event.

## Suggested judging demonstration

1. Select a grade and explain that each round uses a curated question with a worked explanation.
2. Show Mixed Arcade, then briefly try Memory & Logic to demonstrate sequence recall rather than answer-choice selection.
3. Create an invite on one device and join it from another; show that the opponent's answer stays hidden until resolution.
4. Open `/teacher` after the round and show the actual attempt counts and subject accuracy. Explain that this prototype data is temporary and is not evidence of retention improvement.
5. Describe accessibility and deployment limitations honestly, then outline how reviewed curriculum content, persistent storage, and a larger classroom pilot would be added next.

## Build checks

```powershell
cd backend
npm run build
```

```powershell
cd frontend
npm run build
```
