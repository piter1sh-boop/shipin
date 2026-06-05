// server/db/index.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'shipin.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      role TEXT DEFAULT 'user',
      password_hash TEXT,
      is_ai_user INTEGER DEFAULT 0,
      ai_profile_id TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- Startup profiles
    CREATE TABLE IF NOT EXISTS startup_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      product_idea TEXT,
      target_user TEXT,
      problem_statement TEXT,
      current_stage TEXT,
      daily_time_budget TEXT,
      main_blocker TEXT,
      desired_outcome TEXT,
      ai_summary TEXT,
      risk_level TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- Plans
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      title TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- Daily tasks
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      plan_id TEXT REFERENCES plans(id),
      user_id TEXT REFERENCES users(id),
      day_number INTEGER,
      task_date TEXT,
      title TEXT,
      description TEXT,
      task_type TEXT,
      priority INTEGER,
      success_criteria TEXT,
      status TEXT DEFAULT 'pending',
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- Daily check-ins
    CREATE TABLE IF NOT EXISTS daily_checkins (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      task_date TEXT,
      completed_text TEXT,
      blocked_text TEXT,
      interview_count INTEGER,
      lead_count INTEGER,
      value_score INTEGER,
      energy_score INTEGER,
      ai_feedback TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- Interviews
    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      interview_date TEXT,
      person_name TEXT,
      person_type TEXT,
      contact TEXT,
      current_solution TEXT,
      pain_points TEXT,
      verbatim_quotes TEXT,
      willingness_to_pay INTEGER,
      follow_up_status TEXT,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- Leads
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      name TEXT,
      source TEXT,
      person_type TEXT,
      pain_point TEXT,
      budget_signal TEXT,
      status TEXT,
      next_step TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- Coach messages
    CREATE TABLE IF NOT EXISTS coach_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      role TEXT,
      content TEXT,
      context_snapshot TEXT,
      created_at TEXT
    );

    -- Weekly reviews
    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      week_number INTEGER,
      summary TEXT,
      completed_tasks INTEGER,
      interview_count INTEGER,
      lead_count INTEGER,
      risks TEXT,
      next_week_focus TEXT,
      ai_recommendation TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- Behavior logs
    CREATE TABLE IF NOT EXISTS behavior_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      event_type TEXT NOT NULL,
      event_data TEXT,
      session_id TEXT,
      created_at TEXT
    );

    -- Task recommendations
    CREATE TABLE IF NOT EXISTS task_recommendations (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      day_number INTEGER,
      recommended_tasks TEXT,
      actual_completed INTEGER,
      actual_skipped INTEGER,
      recommendation_hit_rate REAL,
      ai_context_used TEXT,
      created_at TEXT
    );

    -- RAG knowledge base index (FTS5)
    CREATE VIRTUAL TABLE IF NOT EXISTS rag_index USING fts5(
      content,
      content_type,
      user_id,
      related_task_type,
      created_at
    );

    -- User persona
    CREATE TABLE IF NOT EXISTS user_persona (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      traits TEXT,
      behavior_patterns TEXT,
      updated_at TEXT
    );

    -- Evolution logs
    CREATE TABLE IF NOT EXISTS evolution_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT,
      description TEXT,
      trigger TEXT,
      metric_change TEXT,
      created_at TEXT
    );

    -- AI用户画像表
    CREATE TABLE IF NOT EXISTS ai_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      name TEXT,
      age INTEGER,
      occupation TEXT,
      education TEXT,
      city TEXT,
      personality TEXT,
      skills TEXT,
      background TEXT,
      thinking_habits TEXT,
      predicted_blockers TEXT,
      goals_30days TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- AI用户执行日志表
    CREATE TABLE IF NOT EXISTS ai_agent_logs (
      id TEXT PRIMARY KEY,
      ai_user_id TEXT REFERENCES users(id),
      action_type TEXT,
      details TEXT,
      created_at TEXT
    );
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_behavior_logs_user ON behavior_logs(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_behavior_logs_type ON behavior_logs(event_type, created_at);
    CREATE INDEX IF NOT EXISTS idx_task_recommendations_user ON task_recommendations(user_id, day_number);
    CREATE INDEX IF NOT EXISTS idx_interviews_user ON interviews(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_ai_profiles_user ON ai_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_user ON ai_agent_logs(ai_user_id, created_at);
  `);

  console.log('[DB] Database initialized successfully');
}

// Initialize on import
initDatabase();