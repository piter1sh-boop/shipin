import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';
import { chat } from './minimax.js';

export class AIAgentEngine {
  constructor(aiUserId) {
    this.aiUserId = aiUserId;
    this.currentDay = 1;
    this.taskHistory = [];
  }

  // 记录执行日志
  log(actionType, details) {
    db.prepare(`
      INSERT INTO ai_agent_logs (id, ai_user_id, action_type, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuid(), this.aiUserId, actionType, JSON.stringify(details), new Date().toISOString());
  }

  // 检查今日任务
  getTodayTasks() {
    const tasks = db.prepare(`
      SELECT * FROM daily_tasks
      WHERE user_id = ? AND day_number = ?
      ORDER BY priority DESC
    `).all(this.aiUserId, this.currentDay);
    return tasks;
  }

  // 执行单个任务
  async executeTask(task) {
    // 模拟真实用户行为：70-80%完成率
    const willComplete = Math.random() > 0.25;
    if (willComplete) {
      db.prepare(`
        UPDATE daily_tasks SET status = 'completed', updated_at = ? WHERE id = ?
      `).run(new Date().toISOString(), task.id);
      this.log('task_complete', { taskId: task.id, title: task.title });
      return true;
    } else {
      // 检查是否是卡点型跳过
      const skipReason = this.getSkipReason();
      db.prepare(`
        UPDATE daily_tasks SET status = 'skipped', updated_at = ? WHERE id = ?
      `).run(new Date().toISOString(), task.id);
      this.log('task_skip', { taskId: task.id, title: task.title, reason: skipReason });
      return false;
    }
  }

  // 获取跳过原因（基于画像）
  getSkipReason() {
    const reasons = [
      '想再想想清楚再做',
      '感觉不是最重要的',
      '今天时间不够',
      '心情不好',
      '有更重要的事',
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  // 检查是否需要教练介入
  checkCoachIntervention() {
    // 如果连续跳过2次以上，触发对话
    const recentSkips = db.prepare(`
      SELECT COUNT(*) as cnt FROM daily_tasks
      WHERE user_id = ? AND status = 'skipped' AND day_number >= ?
    `).get(this.aiUserId, this.currentDay - 1);

    if (recentSkips.cnt >= 2) {
      return true;
    }
    return false;
  }

  // 与教练对话
  async coachChat(message) {
    const profile = db.prepare('SELECT * FROM ai_profiles WHERE user_id = ?').get(this.aiUserId);
    const startupProfile = db.prepare('SELECT * FROM startup_profiles WHERE user_id = ?').get(this.aiUserId);
    const personality = profile ? JSON.parse(profile.personality || '{}') : {};

    const systemPrompt = `你是30天创业教练。用户是一个AI模拟的创业者（${profile?.name || '未知'}），
性格特点：${personality.tendency || '未知'}，执行力评分：${personality.executionScore || '未知'}/10，
决策风格：${personality.decisionStyle || '未知'}。
当前是第${this.currentDay}天。`;

    const reply = await chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ]);

    this.log('coach_chat', { message, reply });
    return reply;
  }

  // 执行每日轮次
  async runDailyRound() {
    const tasks = this.getTodayTasks();
    let completed = 0;
    let skipped = 0;

    for (const task of tasks) {
      const success = await this.executeTask(task);
      if (success) completed++;
      else skipped++;
    }

    // 检查是否需要教练介入
    const needIntervention = this.checkCoachIntervention();
    let coachReply = null;
    if (needIntervention) {
      try {
        coachReply = await this.coachChat('我最近总是跳过任务，感觉有点卡住了，给我一些建议。');
      } catch (err) {
        console.error('Coach chat failed:', err.message);
      }
    }

    // 更新当前天数
    this.currentDay = Math.min(30, this.currentDay + 1);

    return { completed, skipped, needIntervention, coachReply };
  }
}

// 启动AI用户执行
export async function startAIUserExecution(aiUserId) {
  const engine = new AIAgentEngine(aiUserId);
  return engine.runDailyRound();
}