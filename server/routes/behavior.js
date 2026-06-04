// server/routes/behavior.js
import express from 'express';
import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';
import { indexInterview } from '../services/ragIndexer.js';
import { updateUserPersona } from '../services/personaUpdater.js';

export const behaviorRouter = express.Router();

// Collect behavior data
behaviorRouter.post('/behavior', (req, res) => {
  const { type, data, session_id } = req.body;
  let userId = req.body.user_id || 'default_user'; // TODO: integrate with user system later

  // Ensure default user exists if needed
  const userExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId);
  if (!userExists) {
    db.prepare(`INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)`).run(userId, new Date().toISOString());
  }

  db.prepare(`
    INSERT INTO behavior_logs (id, user_id, event_type, event_data, session_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuid(),
    userId,
    type,
    JSON.stringify(data),
    session_id || null,
    new Date().toISOString()
  );

  res.json({ ok: true });
});

// Get user context
behaviorRouter.get('/user-context/:userId', (req, res) => {
  const { userId } = req.params;

  const persona = db.prepare('SELECT * FROM user_persona WHERE user_id = ?').get(userId);
  const recentBlockers = db.prepare(`
    SELECT blocked_text FROM daily_checkins
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 3
  `).all(userId);
  const recentHitRate = db.prepare(`
    SELECT AVG(recommendation_hit_rate) as rate FROM task_recommendations
    WHERE user_id = ? AND created_at > date('now', '-7 days')
  `).get(userId);

  res.json({
    persona,
    recentBlockers,
    recentHitRate,
  });
});

// POST /api/index-interview — index interview to RAG
behaviorRouter.post('/index-interview', (req, res) => {
  const { userId, interview } = req.body;
  if (!userId || !interview) {
    return res.status(400).json({ error: 'userId and interview required' });
  }
  indexInterview(userId, interview);
  res.json({ ok: true });
});

// POST /api/update-persona — update user persona
behaviorRouter.post('/update-persona', (req, res) => {
  const { userId, traits, behavior_patterns } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }
  updateUserPersona(userId, { traits, behavior_patterns });
  res.json({ ok: true });
});