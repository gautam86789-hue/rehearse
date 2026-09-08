# Rehearse — AI Difficult Conversation Roleplay & Executive Coaching Platform

> Built per the **Rehearse App Blueprint** specification (`C:\Users\gauta\Downloads\rehearse-app-blueprint.md`).

---

## 🚀 Quick Start (Run in VS Code with One Click)

You can launch both the **Backend API** and **Frontend Expo Web** concurrently directly in VS Code:

### Option 1: VS Code "Run & Debug" (F5)
1. Open the project folder `D:\rehearse` in VS Code (`File` → `Open Folder...` → select `D:\rehearse`).
2. Press **`F5`** (or go to the **Run and Debug** tab on the left sidebar and click the green **Play** button on **`🚀 Full Stack: Rehearse (Backend + Frontend)`**).
3. VS Code will automatically start:
   - ⚡ **Backend API Server**: `http://localhost:5000` (API & Swagger Health: `http://localhost:5000/api/v1/health`)
   - 📱 **Frontend Web App**: `http://localhost:8081`

---

### Option 2: Unified Terminal Command
In the root directory `D:\rehearse`:
```bash
npm run dev
```
This runs both backend and frontend concurrently with color-coded logging.

---

### Option 3: Separate Terminal Windows

#### Start the Backend
```bash
cd backend
npm run dev
```

#### Start the Frontend (Web Browser)
```bash
cd frontend
npm run web
```

#### Run on Your Physical Phone (No Android Studio Required!)
```bash
cd frontend
npx expo start
```
- Download the free **Expo Go** app from Google Play Store / Apple App Store.
- Scan the QR code in your terminal with your phone camera.

---

## 🏗️ Architecture & Features

```
D:\rehearse
├── .vscode/
│   ├── launch.json              # F5 Run & Debug launcher (Full Stack compound)
│   └── tasks.json               # VS Code build and start background tasks
├── backend/                     # Node.js + Express + TypeScript + Zod
│   ├── src/
│   │   ├── controllers/         # REST API handlers
│   │   ├── db/                  # Supabase schema.sql & seed data
│   │   ├── services/            # AI brief generator, roleplay engine, substance scoring
│   │   └── types/               # TypeScript domain interfaces
│   └── tests/                   # Jest + Supertest unit & integration tests
├── frontend/                    # Expo (React Native + TypeScript + React Navigation)
│   ├── src/
│   │   ├── components/common/   # Design system (Cards, Avatars, Meters, Rewrites)
│   │   ├── context/             # App global state & AsyncStorage persistence
│   │   ├── screens/             # Onboarding, Home, DescribeSituation, Roleplay, Score, etc.
│   │   └── theme/               # Calm executive coaching palette & typography
│   └── App.tsx                  # Root entry point
└── package.json                 # Workspace root orchestrator
```

### Core Capabilities:
1. **★ Describe-Your-Situation Generator**: Free-text conflict input + counterpart archetype selection $\to$ AI engineers custom counterpart stance, pushback pattern, and objective brief.
2. **5 AI Archetype Counterparts**: *The Defensive Boss*, *The Guilt-Tripper*, *The Hard Negotiator*, *The Passive-Aggressive Peer*, *The Micromanager*.
3. **Substance-Based Scoring**: Rubric evaluating Ask Clarity, Boundary Holding, Specificity, and Composure.
4. **Executive Weakest-Line Rewrite**: Pinpoints weak/hedged phrasing and suggests masterclass rewrites with coaching rationale.
5. **Daily Habit Engine**: Framework of the Day (NVC, Harvard BATNA, Crucial Conversations STATE) + Daily 1-turn Tricky Situation dilemmas.
6. **Strategic Reply Assistant**: Message coach providing Direct, Diplomatic, and Boundary-Setting replies for Slack/Email.
7. **Monetization Architecture**: 5-day trial, $9/mo & $90/yr annual default subscription tier with paywall enforcement.

---

## 🧪 Testing Backend
```bash
cd backend
npm test
```
Runs 14 automated tests verifying scenarios, scoring rubrics, streak/XP logic, and all REST endpoints.
