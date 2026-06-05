import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db/index.js';
import { adminMiddleware } from '../middleware/auth.js';
import { generateAIProfile } from '../services/ai-profile-generator.js';

export const aiUserRouter = Router();

// POST /api/admin/ai-users - 创建AI用户
aiUserRouter.post('/', adminMiddleware, (req, res) => {
  try {
    const { domain, stage } = req.body;
    if (!domain || !stage) {
      return res.status(400).json({ error: 'domain和stage必填' });
    }

    // 生成AI画像
    const profile = generateAIProfile(domain, stage);

    // 创建AI用户账号
    const userId = uuid();
    const now = new Date().toISOString();

    // 使用唯一邮箱（AI用户不需要真实邮箱）
    const aiEmail = `ai_${userId}@localhost`;

    db.prepare(`
      INSERT INTO users (id, name, email, role, is_ai_user, created_at, updated_at)
      VALUES (?, ?, ?, 'user', 1, ?, ?)
    `).run(userId, profile.name, aiEmail, now, now);

    // 保存AI画像
    db.prepare(`
      INSERT INTO ai_profiles (id, user_id, name, age, occupation, education, city, personality, skills, background, thinking_habits, predicted_blockers, goals_30days, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      profile.id,
      userId,
      profile.name,
      profile.age,
      profile.occupation,
      profile.education,
      profile.city,
      JSON.stringify(profile.personality),
      JSON.stringify(profile.skills),
      JSON.stringify(profile.background),
      JSON.stringify(profile.thinkingHabits),
      JSON.stringify(profile.predictedBlockers),
      JSON.stringify(profile.goals30days),
      now,
      now
    );

    res.json({
      userId,
      profileId: profile.id,
      profile,
    });
  } catch (err) {
    console.error('[/api/admin/ai-users POST]', err.message);
    res.status(500).json({ error: '创建AI用户失败' });
  }
});

// GET /api/admin/ai-users - 获取所有AI用户
aiUserRouter.get('/', adminMiddleware, (req, res) => {
  try {
    const aiUsers = db.prepare(`
      SELECT u.id as userId, u.name, u.created_at, u.is_ai_user,
             ap.age, ap.occupation, ap.city, ap.personality, ap.skills, ap.background
      FROM users u
      LEFT JOIN ai_profiles ap ON u.id = ap.user_id
      WHERE u.is_ai_user = 1
      ORDER BY u.created_at DESC
    `).all();

    const result = aiUsers.map(u => ({
      ...u,
      personality: u.personality ? JSON.parse(u.personality) : null,
      skills: u.skills ? JSON.parse(u.skills) : null,
      background: u.background ? JSON.parse(u.background) : null,
    }));

    res.json({ aiUsers: result });
  } catch (err) {
    console.error('[/api/admin/ai-users GET]', err.message);
    res.status(500).json({ error: '获取AI用户列表失败' });
  }
});

// GET /api/admin/ai-users/:id/profile - 获取AI用户完整画像
aiUserRouter.get('/:id/profile', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const profile = db.prepare(`
      SELECT * FROM ai_profiles WHERE user_id = ?
    `).get(id);

    if (!profile) {
      return res.status(404).json({ error: 'AI用户不存在' });
    }

    res.json({
      ...profile,
      personality: JSON.parse(profile.personality || '{}'),
      skills: JSON.parse(profile.skills || '{}'),
      background: JSON.parse(profile.background || '{}'),
      thinking_habits: JSON.parse(profile.thinking_habits || '{}'),
      predicted_blockers: JSON.parse(profile.predicted_blockers || '{}'),
      goals_30days: JSON.parse(profile.goals_30days || '{}'),
    });
  } catch (err) {
    console.error('[/api/admin/ai-users/:id/profile GET]', err.message);
    res.status(500).json({ error: '获取AI用户画像失败' });
  }
});