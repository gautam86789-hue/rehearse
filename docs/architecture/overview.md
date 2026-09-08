# System Architecture Overview

Rehearse is an AI-powered conversational roleplay and executive coaching platform designed to prepare managers, leaders, and professionals for high-stakes conversations.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Expo Client)                   │
│       React Native + Web Single-Page Application (SPA)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    Backend (Node / Express)                 │
│   ├── Authentication & User Profiles                        │
│   ├── Scenario Brief Generator (Prompt-to-Roleplay)         │
│   ├── Conversational Counterpart Engine (5 Archetypes)       │
│   ├── Substance Scoring Rubric & Weakest-Line Rewrite       │
│   ├── Daily Habit Engine (Frameworks & 1-Turn Puzzles)      │
│   └── Gamification, Streaks & Subscription Entitlements     │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐   ┌───────────────────────────┐
│     PostgreSQL / Supabase    │   │      Universal LLM        │
│  Users, Sessions, Scorecards │   │  (Gemini / OpenAI / Mock) │
└──────────────────────────────┘   └───────────────────────────┘
```
