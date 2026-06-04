// server/services/promptBuilder.js
import { db } from '../db/index.js';
import { getUserPersona, calculateWeaknessTypes } from './personaUpdater.js';
import { retrieveContext } from './ragIndexer.js';

/**
 * Build coach conversation Prompt with user persona and RAG context
 */
export function buildCoachPrompt(userId, userMessage, history) {
  const persona = getUserPersona(userId);
  const { skippedCount, completedCount } = calculateWeaknessTypes(userId);
  const recentBlockers = getRecentBlockers(userId, 3);

  // Extract keywords for RAG retrieval
  const keywords = extractKeywords(userMessage);
  const ragContext = retrieveContext(userId, 'coach_wisdom', keywords);

  // Calculate strengths and weaknesses
  const strengths = Object.entries(completedCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  const weaknesses = Object.entries(skippedCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type]) => type);

  const avgTaskCompleteRate = persona?.behavior_patterns?.avg_task_complete_rate ?? '未知';

  return `
你是30天创业执行教练，服务对象是AI独立开发者和程序员创业者。

【用户画像】
- 任务完成率：${avgTaskCompleteRate}%
- 擅长类型：${strengths.join(', ') || '尚不明确'}
- 薄弱类型：${weaknesses.join(', ') || '尚不明确'}
- 当前卡点：${recentBlockers.join(', ') || '无'}

【相关历史经验】
${ragContext || '暂无相关历史经验'}

【对话历史】
${formatHistory(history)}

【要求】
1. 基于用户画像调整建议的语气和难度
2. 引用相关历史经验（如果有）
3. 推动用户完成核心验证动作（访谈、落地页、线索）
4. 不确定时直接说不知道，不要编造
5. 保持务实和直接，不回避问题
6. 用中文回答

【用户消息】
${userMessage}
`.trim();
}

function getRecentBlockers(userId, limit) {
  try {
    const rows = db.prepare(`
      SELECT blocked_text FROM daily_checkins
      WHERE user_id = ? AND blocked_text IS NOT NULL AND blocked_text != ''
      ORDER BY created_at DESC LIMIT ?
    `).all(userId, limit);
    return rows.map(r => r.blocked_text).filter(Boolean);
  } catch {
    return [];
  }
}

function extractKeywords(message) {
  // Simple keyword extraction
  const words = message.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 5).join(' OR ');
}

function formatHistory(history) {
  if (!history || !Array.isArray(history) || history.length === 0) return '无';
  return history.slice(-6).map(m => {
    const role = m.role === 'coach' ? '教练' : '用户';
    return `${role}：${(m.content || '').slice(0, 200)}`;
  }).join('\n');
}
