// server/services/evolutionTrigger.js
import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';
import { getUserPersona } from './personaUpdater.js';

/**
 * Check and trigger evolution events
 */
export function checkEvolutionTriggers(userId) {
  checkHitRateTrigger(userId);
  checkPersonaDriftTrigger(userId);
}

function checkHitRateTrigger(userId) {
  // Calculate 7-day average hit rate
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      AVG(recommendation_hit_rate) as avg_hit_rate
    FROM task_recommendations
    WHERE user_id = ? AND created_at > date('now', '-7 days')
  `).get(userId);

  if (!stats || stats.total < 7) return; // Need at least 7 data points

  // If hit rate < 40%, log evolution event
  if (stats.avg_hit_rate < 0.4) {
    db.prepare(`
      INSERT INTO evolution_logs (id, event_type, description, trigger, metric_change, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuid(),
      'hit_rate_low',
      `Task recommendation hit rate below 40% (current: ${(stats.avg_hit_rate * 100).toFixed(1)}%)`,
      'automatic_check',
      JSON.stringify({
        avg_hit_rate: stats.avg_hit_rate,
        threshold: 0.4,
        sample_size: stats.total
      }),
      new Date().toISOString()
    );
  }
}

function checkPersonaDriftTrigger(userId) {
  const current = getUserPersona(userId);
  if (!current) return;

  // Simplified detection: check if behavior patterns changed significantly
  const patterns = current.behavior_patterns;
  if (patterns.avg_task_complete_rate !== undefined && patterns.avg_task_complete_rate < 0.3) {
    db.prepare(`
      INSERT INTO evolution_logs (id, event_type, description, trigger, metric_change, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuid(),
      'persona_drift',
      'User task completion rate dropped significantly, consider adjusting task difficulty',
      'automatic_check',
      JSON.stringify({ task_complete_rate: patterns.avg_task_complete_rate }),
      new Date().toISOString()
    );
  }
}

/**
 * Log task recommendation
 */
export function logTaskRecommendation(userId, dayNumber, recommended, actualCompleted, actualSkipped, aiContextUsed) {
  const hitRate = recommended.length > 0 ? actualCompleted / recommended.length : 0;

  db.prepare(`
    INSERT INTO task_recommendations (id, user_id, day_number, recommended_tasks, actual_completed, actual_skipped, recommendation_hit_rate, ai_context_used, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuid(),
    userId,
    dayNumber,
    JSON.stringify(recommended),
    actualCompleted,
    actualSkipped,
    hitRate,
    aiContextUsed,
    new Date().toISOString()
  );

  // Check if evolution should be triggered
  if (recommended.length > 0) {
    checkEvolutionTriggers(userId);
  }
}

/**
 * Get evolution logs
 */
export function getEvolutionLogs(limit = 20) {
  return db.prepare(`
    SELECT * FROM evolution_logs
    ORDER BY created_at DESC LIMIT ?
  `).all(limit);
}