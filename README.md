# EduQuest 2.0 — AI-Powered Goal Execution Platform

A full-stack web application that converts learning goals into structured daily roadmaps using Google Gemini AI, with XP-based gamification and a global leaderboard.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React + Vite, Tailwind CSS, Axios   |
| Backend    | Node.js + Express.js                |
| Database   | MongoDB Atlas (Mongoose)            |
| Auth       | JWT + bcryptjs                      |
| AI         | Google Gemini 1.5 Flash             |
| Deployment | Vercel (frontend) + Render (backend)|

---

## Project Structure

```
eduquest/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Navbar, GoalCard, DayCard, ProgressBar, QuizComponent
│   │   ├── pages/       # Landing, Login, Register, Dashboard, CreateGoal, GoalDetail, StudyContent, Leaderboard, Profile
│   │   ├── context/     # AuthContext (global auth state)
│   │   ├── services/    # api.js (axios instance)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server/              # Express backend
    ├── controllers/     # authController, goalController, aiController, leaderboardController
    ├── models/          # User, Goal, Day
    ├── routes/          # authRoutes, goalRoutes, aiRoutes, leaderboardRoutes
    ├── middleware/      # authMiddleware (JWT protect)
    ├── config/          # db.js (MongoDB connection)
    ├── server.js
    └── .env.example
```

---

## Setup Instructions

### 1. Clone and install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/eduquest
JWT_SECRET=your_random_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

**Getting your keys:**
- **MongoDB URI**: [mongodb.com/atlas](https://www.mongodb.com/atlas) → Free tier → Connect → Drivers
- **Gemini API Key**: [aistudio.google.com](https://aistudio.google.com) → Get API Key
- **JWT Secret**: Any long random string (e.g. run `openssl rand -hex 32`)

### 3. Run the project

```bash
# Terminal 1 — Backend
cd server
npm run dev   # runs on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev   # runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## API Routes Reference

### Auth
| Method | Route              | Description         | Auth  |
|--------|--------------------|---------------------|-------|
| POST   | /api/auth/register | Register new user   | No    |
| POST   | /api/auth/login    | Login               | No    |
| GET    | /api/auth/me       | Get current user    | Yes   |

### Goals
| Method | Route                          | Description               | Auth |
|--------|--------------------------------|---------------------------|------|
| POST   | /api/goals/create              | Create goal (with roadmap)| Yes  |
| GET    | /api/goals                     | Get user's goals          | Yes  |
| GET    | /api/goals/:goalId             | Get goal + days           | Yes  |
| PUT    | /api/goals/days/:dayId/complete| Mark day complete (+XP)   | Yes  |
| POST   | /api/goals/days/:dayId/quiz    | Submit quiz answers       | Yes  |

### AI
| Method | Route                    | Description              | Auth |
|--------|--------------------------|--------------------------|------|
| POST   | /api/ai/generate-roadmap | Generate roadmap via AI  | Yes  |
| POST   | /api/ai/generate-content | Get topic explanation    | Yes  |

### Leaderboard
| Method | Route                        | Description          | Auth |
|--------|------------------------------|----------------------|------|
| GET    | /api/leaderboard             | Global XP ranking    | Yes  |
| GET    | /api/leaderboard/profile     | Current user profile | Yes  |

---

## XP & League System

| Action              | XP Reward  | Notes                      |
|---------------------|------------|----------------------------|
| Complete a day      | +10 XP     | Once per day task          |
| Pass quiz (≥ 70%)   | +5 XP      | Once per quiz              |
| Complete a goal     | +50 XP     | Once per goal              |

| League  | XP Required |
|---------|-------------|
| Bronze  | 0+          |
| Silver  | 200+        |
| Gold    | 500+        |
| Diamond | 1000+       |

---

## Core Features

- **AI Roadmap Generation** — Gemini 1.5 Flash generates a day-by-day plan with topics, tasks, and quizzes
- **Daily Progress Tracking** — Mark days complete, track streaks, visualize progress
- **Quiz System** — Per-day MCQ quizzes with scoring and XP rewards (no repeat XP)
- **Study Mode** — On-demand AI explanations for any topic in your roadmap
- **Leaderboard** — Global XP ranking with league filtering
- **Profile** — User stats, completed goals, rank, XP breakdown

---


---

## Design System

- **Colors**: `#0a0a0f` background, `#00f5a0` primary accent, `#00d4ff` secondary
- **Fonts**: Syne (display/headings), DM Sans (body), JetBrains Mono (numbers/code)
- **Components**: Glassmorphism cards, gradient progress bars with glow, dark theme throughout
