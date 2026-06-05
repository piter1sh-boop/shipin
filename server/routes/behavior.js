// server/routes/behavior.js
import express from 'express';
import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';
import { indexInterview } from '../services/ragIndexer.js';
import { updateUserPersona, getUserPersona, calculateWeaknessTypes } from '../services/personaUpdater.js';
import { chat } from '../services/minimax.js';

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

  const persona = db.prepare('SELECT * FROM user_persona WHERE user_id = ?').get(userId) || null;
  const recentBlockers = db.prepare(`
    SELECT blocked_text FROM daily_checkins
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 3
  `).all(userId);
  const recentHitRate = db.prepare(`
    SELECT AVG(recommendation_hit_rate) as rate FROM task_recommendations
    WHERE user_id = ? AND created_at > date('now', '-7 days')
  `).get(userId);

  res.json({
    persona: persona || null,
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

// POST /api/daily-task — generate personalized daily task recommendation
behaviorRouter.post('/daily-task', async (req, res) => {
  try {
    const { userId, dayNumber, interviewCount, leadCount } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const persona = getUserPersona(userId);
    const { skippedCount, completedCount } = calculateWeaknessTypes(userId);
    const avgRate = persona?.behavior_patterns?.avg_task_complete_rate ?? 0;

    // Determine task priorities based on persona
    const weaknessTypes = Object.entries(skippedCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type);

    // Build context for AI
    const context = `
用户当前状态：
- 任务完成率：${(avgRate * 100).toFixed(0)}%
- 薄弱环节：${weaknessTypes.join(', ') || '暂无记录'}
- 已完成访谈：${interviewCount || 0}次
- 已有线索：${leadCount || 0}条
- 当前天数：第${dayNumber || 1}天

请根据用户画像，推荐今天最重要的1-3个任务。
要求：
1. 优先推动用户完成核心验证动作
2. 如果完成率低，降低任务难度
3. 薄弱环节需要重点突破
4. 每天最多3个任务
`.trim();

    const system = `你是30天创业执行教练，负责根据用户画像推荐每日任务。
输出JSON格式：
{
  "mainTask": {"title": "任务标题", "description": "描述", "successCriteria": "完成标准", "estimatedMinutes": 数字},
  "secondaryTasks": [{"title": "", "description": "", "estimatedMinutes": 0}, ...],
  "coachNote": "给用户的简短提示",
  "riskWarning": "如果有问题，给出警告"
}
用中文输出。`;

    const reply = await chat([
      { role: 'system', content: system },
      { role: 'user', content: context },
    ]);

    // Parse JSON from response
    const cleaned = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[1]);
        res.json(result);
      } catch {
        res.json({ mainTask: { title: '今日任务', description: '查看你的任务列表', estimatedMinutes: 60 } });
      }
    } else {
      res.json({ mainTask: { title: '今日任务', description: '查看你的任务列表', estimatedMinutes: 60 } });
    }
  } catch (err) {
    console.error('[/api/daily-task]', err.message);
    res.status(500).json({ error: '任务推荐失败' });
  }
});

// GET /api/admin/users — get all users with their data
behaviorRouter.get('/admin/users', (req, res) => {
  try {
    // Get all users with their profiles
    const users = db.prepare(`
      SELECT
        u.id as userId,
        u.name,
        u.email,
        u.created_at as createdAt,
        sp.product_idea as productIdea,
        sp.target_user as targetUser,
        sp.current_stage as currentStage,
        sp.ai_summary as aiSummary,
        up.traits,
        up.behavior_patterns,
        up.updated_at as personaUpdatedAt
      FROM users u
      LEFT JOIN startup_profiles sp ON u.id = sp.user_id
      LEFT JOIN user_persona up ON u.id = up.user_id
      ORDER BY u.created_at DESC
    `).all();

    // Get task stats for each user
    const usersWithStats = users.map(user => {
      const taskStats = db.prepare(`
        SELECT
          COUNT(*) as totalTasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks,
          SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) as skippedTasks
        FROM daily_tasks
        WHERE user_id = ?
      `).get(user.userId) || { totalTasks: 0, completedTasks: 0, skippedTasks: 0 };

      const interviewCount = db.prepare(`SELECT COUNT(*) as count FROM interviews WHERE user_id = ?`).get(user.userId)?.count || 0;
      const leadCount = db.prepare(`SELECT COUNT(*) as count FROM leads WHERE user_id = ?`).get(user.userId)?.count || 0;

      return {
        ...user,
        traits: user.traits ? JSON.parse(user.traits) : {},
        behavior_patterns: user.behavior_patterns ? JSON.parse(user.behavior_patterns) : {},
        taskStats,
        interviewCount,
        leadCount,
      };
    });

    res.json({ users: usersWithStats });
  } catch (err) {
    console.error('[/api/admin/users]', err.message);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// GET /api/admin/evolution-logs — get evolution logs
behaviorRouter.get('/admin/evolution-logs', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM evolution_logs
      ORDER BY created_at DESC
      LIMIT 50
    `).all();
    res.json({ logs });
  } catch (err) {
    console.error('[/api/admin/evolution-logs]', err.message);
    res.status(500).json({ error: '获取进化日志失败' });
  }
});