-- Rehearse PostgreSQL / Supabase Schema
-- Designed for High-Scale Roleplay Sessions, Substance Scoring, Gamification, and Subscription Entitlements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'Manager',
    experience_level TEXT DEFAULT 'Mid-Level',
    primary_dread_category TEXT DEFAULT 'negotiation',
    total_rehearsals INT DEFAULT 0,
    total_xp INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_practice_date DATE,
    subscription_status TEXT DEFAULT 'free_trial', -- 'free_trial', 'active_monthly', 'active_annual', 'expired'
    rehearsals_remaining INT DEFAULT 2, -- 2 free rehearsals total per blueprint
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 days'),
    revenuecat_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Scenarios Table (Curated & User Custom Generated)
CREATE TABLE IF NOT EXISTS scenarios (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    counterpart_role TEXT NOT NULL,
    counterpart_name TEXT NOT NULL,
    counterpart_archetype TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    estimated_minutes INT DEFAULT 5,
    situation TEXT NOT NULL,
    user_goal TEXT NOT NULL,
    brief JSONB NOT NULL,
    is_curated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Rehearsal Sessions Table
CREATE TABLE IF NOT EXISTS rehearsal_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scenario_id TEXT REFERENCES scenarios(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Session Turns Table (Turn-by-turn dialogue)
CREATE TABLE IF NOT EXISTS session_turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES rehearsal_sessions(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL, -- 'user' | 'counterpart'
    message TEXT NOT NULL,
    turn_order INT NOT NULL,
    audio_url TEXT,
    tactical_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Scorecards Table (Substance Rubric Scoring)
CREATE TABLE IF NOT EXISTS scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE REFERENCES rehearsal_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stated_the_ask_score INT NOT NULL,      -- 0-100
    held_the_boundary_score INT NOT NULL,   -- 0-100
    stayed_specific_score INT NOT NULL,     -- 0-100
    emotional_composure_score INT NOT NULL, -- 0-100
    overall_score INT NOT NULL,             -- 0-100
    strengths TEXT[] DEFAULT '{}',
    growth_areas TEXT[] DEFAULT '{}',
    weakest_line_original TEXT,
    weakest_line_rewrite TEXT,
    weakest_line_rationale TEXT,
    key_takeaways TEXT[] DEFAULT '{}',
    xp_earned INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Framework of the Day Table
CREATE TABLE IF NOT EXISTS frameworks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    source_credit TEXT NOT NULL,
    tagline TEXT NOT NULL,
    summary TEXT NOT NULL,
    components JSONB NOT NULL,
    suggested_scenario_id TEXT,
    release_date DATE NOT NULL
);

-- 7. Daily Puzzles & User Responses
CREATE TABLE IF NOT EXISTS daily_puzzles (
    id TEXT PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    title TEXT NOT NULL,
    scenario_context TEXT NOT NULL,
    counterpart_opening_line TEXT NOT NULL,
    options JSONB NOT NULL,
    community_distribution JSONB DEFAULT '{"optionA": 33, "optionB": 33, "optionC": 34}'::jsonb
);

CREATE TABLE IF NOT EXISTS user_puzzle_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    puzzle_id TEXT REFERENCES daily_puzzles(id) ON DELETE CASCADE,
    selected_option_id TEXT NOT NULL,
    is_optimal BOOLEAN NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, puzzle_id)
);

-- 8. Message Coach / Reply Assistant History
CREATE TABLE IF NOT EXISTS reply_assistant_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_situation TEXT NOT NULL,
    generated_options JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_rehearsal_sessions_user ON rehearsal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_turns_session ON session_turns(session_id, turn_order);
CREATE INDEX IF NOT EXISTS idx_scorecards_user ON scorecards(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_category ON scenarios(category);
CREATE INDEX IF NOT EXISTS idx_daily_puzzles_date ON daily_puzzles(date);
