# BrainBytes

BrainBytes is a STEM learning prototype that turns grade-level math, science, logic, and coding questions into short competitive battles. It is designed for classroom demonstrations and practice; it is not yet a production learning-management or student-account system.

## What works in the prototype

- Five progressively leveled rounds for supported cohorts (Classes 7–10 and 11–12+).
- Practice against a bot, same-device two-player practice, and invite-code matches between devices connected to the same backend.
- Four selectable modes: Mixed Arcade, Code Runner, Math Tower Defense, and Memory & Logic. Memory & Logic uses an actual sequence-recall interaction. Code Runner and Math Tower Defense currently present the curriculum question choices in themed game interfaces; they are not standalone platformer or tower-defense simulations.
- Selectable illustrated avatars and optional GLB/VRM fighter uploads. Avatar choices and uploaded models are stored in the current browser.
- A teacher analytics page that aggregates observed answer attempts by grade and subject, with CSV export. The dashboard does not claim learning-retention gains.

## Important prototype limitations

- Questions are selected from a curated question bank; question text is not procedurally generated. Review the content with a subject teacher before classroom use.
- Matchmaking, sessions, and analytics are held in backend memory. They are lost when the backend restarts and are not shared across multiple backend instances.
- The profile form collects a display name, grade, and avatar locally. It is not real authentication, and student records are not persisted to a database.
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
