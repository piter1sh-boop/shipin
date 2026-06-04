import type {
  OnboardingAnalysis,
  DailyTaskRecommendation,
  StartupProfile,
  CoachMessage,
  DailyTask,
} from '../types'

// =====================
// Backend Proxy (calls Express on :3001)
// =====================

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

// =====================
// Fallback local generators (when backend is unavailable)
// =====================

function today() {
  return new Date().toISOString().split('T')[0]
}

const FALLBACK_ONBOARDING: OnboardingAnalysis = {
  oneLiner: '一个帮助AI独立开发者快速验证产品方向的工具',
  targetUserHypothesis: '有技术能力但缺少用户验证反馈的AI创业者',
  riskJudgment: 'medium',
  firstWeekGoal: '完成产品定位和第一轮用户访谈（3-5人）',
  firstTask: {
    dayNumber: 1,
    taskDate: today(),
    title: '明确目标用户和问题',
    description: '写出你的前3个理想用户画像，每人找出1个最痛的点。用一句话描述：你的产品为他们解决了什么问题。',
    taskType: 'positioning',
    priority: 1,
    successCriteria: '完成3个用户画像，每个包含：姓名、职业、痛点一句话',
    status: 'pending',
    createdBy: 'ai',
  },
}

function generateFallbackPlan(userId: string, planId: string): Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt'>[] {
  const tasks: Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt'>[] = []
  const startDate = new Date()

  for (let day = 1; day <= 30; day++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + day - 1)
    const dateStr = d.toISOString().split('T')[0]

    let taskType: DailyTask['taskType']
    let title: string
    let description: string
    let successCriteria: string
    let priority: number

    if (day <= 7) {
      taskType = day <= 3 ? 'positioning' : 'interview'
      title = `Day${day}：${day <= 3 ? '定位和用户访谈' : '用户访谈'}`
      description = day === 1
        ? '明确你的目标用户，写出前3个用户画像'
        : day <= 3
        ? `完成${day - 1}次用户访谈记录`
        : '整理访谈高频痛点，验证问题真实性'
      successCriteria = day === 1 ? '3个用户画像' : `${day - 1}次访谈记录`
      priority = 3
    } else if (day <= 14) {
      taskType = day <= 10 ? 'landing_page' : 'prototype'
      title = `Day${day}：${day <= 10 ? '落地页' : 'MVP原型'}`
      description = day <= 10 ? '完成落地页初稿' : '完成MVP原型核心功能'
      successCriteria = day <= 10 ? '落地页可访问' : 'MVP可演示'
      priority = 2
    } else if (day <= 21) {
      taskType = 'interview'
      title = `Day${day}：真实测试和线索获取`
      description = '继续访谈，争取每周10次以上，收集付费信号'
      successCriteria = '本周新增3+访谈记录，1+线索'
      priority = 2
    } else {
      taskType = 'review'
      title = `Day${day}：复盘与下一阶段`
      description = '整理30天成果，决定下一阶段方向'
      successCriteria = '30天报告完成'
      priority = 1
    }

    tasks.push({
      planId, userId, dayNumber: day, taskDate: dateStr,
      title, description, taskType, priority, successCriteria,
      status: 'pending', createdBy: 'ai',
    })
  }

  return tasks
}

const FALLBACK_DAILY_TASKS: DailyTaskRecommendation = {
  mainTask: {
    title: '写出3个用户访谈问题',
    description: '围绕你最想问的3个问题设计访谈提纲。重点问：他们现在怎么解决这个问题的？花了多少钱/多少时间？',
    successCriteria: '3个访谈问题，每个问题有2-3个追问',
    estimatedMinutes: 30,
  },
  secondaryTasks: [
    {
      title: '找到第1个访谈对象',
      description: '通过社交媒体、微信群、或直接联系找到你的目标用户',
      estimatedMinutes: 30,
    },
  ],
  coachNote: '访谈的核心是理解用户的真实行为，而不是告诉他们你的产品有多好。',
  riskWarning: '',
}

// =====================
// AI Service (frontend calls backend proxy)
// =====================

export const aiService = {
  async analyzeOnboarding(data: Partial<StartupProfile>): Promise<OnboardingAnalysis> {
    try {
      return await post<OnboardingAnalysis>('/api/onboarding', data)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('[aiService] onboarding API failed, using fallback', message)
      return FALLBACK_ONBOARDING
    }
  },

  async generateDailyTasks(
    userId: string,
    context: {
      productIdea: string
      currentStage: string
      completedTasks: number
      interviewCount: number
      leadCount: number
      checkins: Array<{ blockedText: string; valueScore: number }>
    },
    dayNumber: number,
  ): Promise<DailyTaskRecommendation> {
    try {
      return await post<DailyTaskRecommendation>('/api/daily-task', {
        userId,
        dayNumber,
        interviewCount: context.interviewCount,
        leadCount: context.leadCount,
      })
    } catch {
      return FALLBACK_DAILY_TASKS
    }
  },

  async generate30DayPlan(userId: string, planId: string): Promise<Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt'>[]> {
    try {
      const productIdea = 'AI创业执行教练产品'
      const tasks = await post<Omit<DailyTask, 'id' | 'createdAt' | 'updatedAt'>[]>('/api/plan', { productIdea })
      return tasks.map(t => ({ ...t, planId, userId, createdBy: 'ai' }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('[aiService] plan API failed, using fallback', message)
      return generateFallbackPlan(userId, planId)
    }
  },

  async coachReply(
    message: string,
    history: CoachMessage[],
    context: { startupProfile: StartupProfile | null },
  ): Promise<string> {
    try {
      // 只传递必要的历史消息（最近6条，避免上下文过长）
      const recentHistory = history.slice(-6).map(m => ({
        role: m.role as 'user' | 'coach',
        content: m.content,
      }))
      const data = await post<{ reply: string }>('/api/coach', {
        message,
        context,
        history: recentHistory,
      })
      return data.reply
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.warn('[aiService] coach API failed', message)
      const lower = message.toLowerCase()
      if (lower.includes('访谈') || lower.includes('用户')) {
        return '记住，访谈的核心是理解用户的真实行为，而不是告诉他们你的产品有多好。重点问：他们现在怎么解决这个问题？花了多少钱？损失了什么?'
      }
      if (lower.includes('落地页') || lower.includes('landing')) {
        return '落地页的目标只有一个：让目标用户留下联系方式或预约演示。不要在第一版就追求设计精美，先把价值主张说清楚。'
      }
      if (lower.includes('原型') || lower.includes('mvp')) {
        return 'MVP的核心是验证假设，不是完成产品。先做10%的功能解决100%最痛的点，而不是100%功能解决10%的痛点。'
      }
      if (lower.includes('线索') || lower.includes('销售')) {
        return '线索质量比数量重要。一个愿意付费的线索比10个只说"感兴趣"的有价值100倍。追问：你的预算有多少?'
      }
      if (lower.includes('卡住') || lower.includes('block')) {
        return '卡住的原因通常是你在等一个完美的答案。创业没有完美答案，只有足够好的行动。先做，再迭代。'
      }
      return '好的，我听到了。继续推进今天的任务。访谈的数量和质量是30天验证的关键，不要停下来。'
    }
  },

  async generateWeeklyReview(data: Record<string, unknown>): Promise<string> {
    try {
      const result = await post<{ reply: string }>('/api/review/weekly', { weekData: data })
      return result.reply
    } catch {
      return '本周进展良好，继续保持执行节奏。建议加快访谈频率，收集更多用户原话证据。'
    }
  },
}
