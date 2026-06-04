// server/services/ragIndexer.js
import { db } from '../db/index.js';

/**
 * Index interview record into RAG
 */
export function indexInterview(userId, interview) {
  if (!interview.pain_points && !interview.verbatim_quotes) return;

  const content = [
    interview.pain_points,
    interview.verbatim_quotes,
  ].filter(Boolean).join('\n---\n');

  try {
    db.prepare(`
      INSERT INTO rag_index (content, content_type, user_id, related_task_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      content,
      'interview_pain_point',
      userId,
      'interview',
      new Date().toISOString()
    );
  } catch (e) {
    console.error('[RAG] indexInterview error:', e.message);
  }
}

/**
 * Index coach advice into RAG
 */
export function indexCoachWisdom(userId, message, relatedTaskType) {
  try {
    db.prepare(`
      INSERT INTO rag_index (content, content_type, user_id, related_task_type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      message,
      'coach_wisdom',
      userId,
      relatedTaskType,
      new Date().toISOString()
    );
  } catch (e) {
    console.error('[RAG] indexCoachWisdom error:', e.message);
  }
}

/**
 * Retrieve relevant context
 */
export function retrieveContext(userId, contentType, query, limit = 5) {
  if (!query || !query.trim()) return '';

  try {
    const results = db.prepare(`
      SELECT content, content_type, created_at
      FROM rag_index
      WHERE user_id = ? AND content_type = ?
      AND rag_index MATCH ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, contentType, query, limit);

    return results.map(r => r.content).join('\n---\n');
  } catch (e) {
    console.warn('[RAG] retrieveContext error:', e.message);
    return '';
  }
}