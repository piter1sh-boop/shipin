// server/services/ragIndexer.js
import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';

/**
 * Index interview record into RAG
 */
export function indexInterview(userId, interview) {
  if (!interview.pain_points && !interview.verbatim_quotes) return;

  const content = [
    interview.pain_points,
    interview.verbatim_quotes,
  ].filter(Boolean).join('\n---\n');

  db.prepare(`
    INSERT INTO rag_index (content, content_type, user_id, related_task_type, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    uuid(),
    content,
    'interview_pain_point',
    userId,
    'interview',
    new Date().toISOString()
  );
}

/**
 * Index coach advice into RAG
 */
export function indexCoachWisdom(userId, message, relatedTaskType) {
  db.prepare(`
    INSERT INTO rag_index (content, content_type, user_id, related_task_type, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    uuid(),
    message,
    'coach_wisdom',
    userId,
    relatedTaskType,
    new Date().toISOString()
  );
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