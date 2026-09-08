-- Rehearse PostgreSQL / Supabase Schema

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
    subscription_status TEXT DEFAULT 'free_trial',
    rehearsals_remaining INT DEFAULT 2,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 days'),
    revenuecat_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Scenarios Table
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
    status TEXT DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Session Turns Table
CREATE TABLE IF NOT EXISTS session_turns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES rehearsal_sessions(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL,
    message TEXT NOT NULL,
    turn_order INT NOT NULL,
    audio_url TEXT,
    tactical_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Scorecards Table
CREATE TABLE IF NOT EXISTS scorecards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE REFERENCES rehearsal_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stated_the_ask_score INT NOT NULL,
    held_the_boundary_score INT NOT NULL,
    stayed_specific_score INT NOT NULL,
    emotional_composure_score INT NOT NULL,
    overall_score INT NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    growth_areas TEXT[] DEFAULT '{}',
    weakest_line_original TEXT,
    weakest_line_rewrite TEXT,
    weakest_line_rationale TEXT,
    key_takeaways TEXT[] DEFAULT '{}',
    xp_earned INT DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
