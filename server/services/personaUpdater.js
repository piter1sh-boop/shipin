// server/services/personaUpdater.js
import { db } from '../db/index.js';

/**
 * Update user persona
 */
export function updateUserPersona(userId, updates) {
  // Ensure user exists first (foreign key constraint)
  const userExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId);
  if (!userExists) {
    db.prepare(`INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)`).run(userId, new Date().toISOString());
  }

  const existing = db.prepare('SELECT * FROM user_persona WHERE user_id = ?').get(userId);

  let traits = {};
  let behavior_patterns = {};

  if (existing) {
    traits = JSON.parse(existing.traits || '{}');
    behavior_patterns = JSON.parse(existing.behavior_patterns || '{}');
  }

  if (updates.traits) {
    traits = { ...traits, ...updates.traits };
  }
  if (updates.behavior_patterns) {
    behavior_patterns = { ...behavior_patterns, ...updates.behavior_patterns };
  }

  db.prepare(`
    INSERT OR REPLACE INTO user_persona (user_id, traits, behavior_patterns, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(
    userId,
    JSON.stringify(traits),
    JSON.stringify(behavior_patterns),
    new Date().toISOString()
  );
}

/**
 * Get user persona
 */
export function getUserPersona(userId) {
  const row = db.prepare('SELECT * FROM user_persona WHERE user_id = ?').get(userId);
  if (!row) return null;

  return {
    traits: JSON.parse(row.traits || '{}'),
    behavior_patterns: JSON.parse(row.behavior_patterns || '{}'),
    updated_at: row.updated_at,
  };
}

/**
 * Calculate weakness types from task completion
 */
export function calculateWeaknessTypes(userId, days = 14) {
  const tasks = db.prepare(`
    SELECT task_type, status FROM daily_tasks
    WHERE user_id = ? AND day_number > (
      SELECT COALESCE(MAX(day_number), 0) - ? FROM daily_tasks WHERE user_id = ?
    )
  `).all(userId, days, userId);

  const skippedCount = {};
  const completedCount = {};

  tasks.forEach(t => {
    if (t.status === 'skipped') {
      skippedCount[t.task_type] = (skippedCount[t.task_type] || 0) + 1;
    } else if (t.status === 'completed') {
      completedCount[t.task_type] = (completedCount[t.task_type] || 0) + 1;
    }
  });

  return { skippedCount, completedCount };
}