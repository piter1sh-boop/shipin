/**
 * 核心用户流程测试
 * tests/flows.test.ts
 *
 * 测试完整的用户流程：Onboarding → Plan → Task → Check-in → Coach
 * 使用 fetch 调用本地 API (http://localhost:3001)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { v4 as uuid } from 'uuid'

const API_BASE = 'http://localhost:3001'
const TEST_USER_ID = `test_user_${uuid()}`

// 简单的数据库清理函数
async function cleanupUser(userId: string) {
  try {
    await fetch(`${API_BASE}/api/behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cleanup',
        data: { userId },
        user_id: userId
      })
    })
  } catch {
    // Ignore cleanup errors
  }
}

describe('Onboarding 流程测试', () => {
  const userId = `onboarding_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('应该能成功提交 onboarding 并返回产品分析结果', async () => {
    const response = await fetch(`${API_BASE}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIdea: 'AI写作助手',
        targetUser: '自媒体创作者',
        problemStatement: '创作效率低，内容同质化',
        currentStage: 'idea',
        dailyTimeBudget: '2小时',
        mainBlocker: '不知道怎么验证市场需求',
        desiredOutcome: '找到PMF'
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()

    // 验证返回的数据结构
    expect(data).toHaveProperty('oneLiner')
    expect(data).toHaveProperty('targetUserHypothesis')
    expect(data).toHaveProperty('riskJudgment')
    expect(data).toHaveProperty('firstWeekGoal')
    expect(data).toHaveProperty('firstTask')

    // 验证风险等级格式
    expect(['low', 'medium', 'high']).toContain(data.riskJudgment)

    // 验证第一个任务结构
    expect(data.firstTask).toHaveProperty('title')
    expect(data.firstTask).toHaveProperty('description')
    expect(data.firstTask).toHaveProperty('successCriteria')
    expect(data.firstTask).toHaveProperty('taskType')
    expect(data.firstTask).toHaveProperty('priority')
    expect(data.firstTask).toHaveProperty('dayNumber')
    expect(data.firstTask).toHaveProperty('taskDate')
  })

  it('应该能成功生成30天创业计划', async () => {
    const response = await fetch(`${API_BASE}/api/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIdea: 'AI写作助手'
      })
    })

    expect(response.ok).toBe(true)
    const plan = await response.json()

    // 验证计划是数组
    expect(Array.isArray(plan)).toBe(true)

    // 验证计划长度（应该是30天）
    expect(plan.length).toBe(30)

    // 验证第一个任务
    const firstTask = plan[0]
    expect(firstTask).toHaveProperty('dayNumber', 1)
    expect(firstTask).toHaveProperty('taskDate')
    expect(firstTask).toHaveProperty('title')
    expect(firstTask).toHaveProperty('description')
    expect(firstTask).toHaveProperty('taskType')
    expect(firstTask).toHaveProperty('priority')
    expect(firstTask).toHaveProperty('successCriteria')
    expect(firstTask).toHaveProperty('status', 'pending')
    expect(firstTask).toHaveProperty('createdBy', 'ai')

    // 验证任务类型有效
    const validTaskTypes = ['positioning', 'interview', 'landing_page', 'prototype', 'sales', 'review']
    plan.forEach((task: any) => {
      expect(validTaskTypes).toContain(task.taskType)
    })
  })
})

describe('AI Coach 对话流程测试', () => {
  const userId = `coach_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('应该能发送消息并获得AI回复', async () => {
    const response = await fetch(`${API_BASE}/api/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '我想知道如何验证用户需求',
        context: {
          startupProfile: {
            userId,
            productIdea: 'AI写作助手'
          }
        },
        history: []
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()

    // 验证回复结构
    expect(data).toHaveProperty('reply')
    expect(typeof data.reply).toBe('string')
    expect(data.reply.length).toBeGreaterThan(0)
  })

  it('应该能保持对话历史上下文', async () => {
    const history = [
      { role: 'user', content: '我应该怎么做用户访谈？' },
      { role: 'assistant', content: '用户访谈的关键是...'}
    ]

    const response = await fetch(`${API_BASE}/api/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '那访谈前需要准备什么？',
        context: {
          startupProfile: {
            userId,
            productIdea: 'AI写作助手'
          }
        },
        history
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('reply')
    expect(typeof data.reply).toBe('string')
  })
})

describe('Behavior 日志与上下文测试', () => {
  const userId = `behavior_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('应该能记录用户行为', async () => {
    const response = await fetch(`${API_BASE}/api/behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'task_completed',
        data: {
          taskId: 'task_1',
          taskType: 'interview',
          completedAt: new Date().toISOString()
        },
        user_id: userId,
        session_id: `session_${uuid()}`
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('ok', true)
  })

  it('应该能获取用户上下文', async () => {
    // 先记录一些行为
    await fetch(`${API_BASE}/api/behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'task_completed',
        data: { taskId: 'task_1' },
        user_id: userId
      })
    })

    // 获取上下文
    const response = await fetch(`${API_BASE}/api/user-context/${userId}`)
    expect(response.ok).toBe(true)
    const data = await response.json()

    // 验证返回结构
    expect(data).toHaveProperty('persona')
    expect(data).toHaveProperty('recentBlockers')
    expect(data).toHaveProperty('recentHitRate')
  })
})

describe('Persona 更新测试', () => {
  const userId = `persona_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('应该能更新用户画像', async () => {
    const traits = {
      riskTolerance: 'medium',
      communicationStyle: 'direct',
      learningStyle: 'visual'
    }
    const behaviorPatterns = {
      avg_task_complete_rate: 0.75,
      preferred_task_types: ['interview', 'prototype']
    }

    const response = await fetch(`${API_BASE}/api/update-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        traits,
        behavior_patterns: behaviorPatterns
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('ok', true)
  })
})

describe('访谈索引流程测试', () => {
  const userId = `interview_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('应该能索引访谈内容到RAG', async () => {
    const interview = {
      id: uuid(),
      personName: '张三',
      personType: '潜在用户',
      currentSolution: '使用Notion整理内容',
      painPoints: '找不到写作灵感，效率低',
      verbatimQuotes: '每天花3小时写作，但效果不好',
      willingnessToPay: 3
    }

    const response = await fetch(`${API_BASE}/api/index-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        interview
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('ok', true)
  })
})

describe('每日任务推荐测试', () => {
  const userId = `daily_task_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('应该能生成每日任务推荐', async () => {
    const response = await fetch(`${API_BASE}/api/daily-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        dayNumber: 3,
        interviewCount: 2,
        leadCount: 5
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()

    // 验证推荐任务结构
    expect(data).toHaveProperty('mainTask')
    expect(data.mainTask).toHaveProperty('title')
    expect(data.mainTask).toHaveProperty('description')
    expect(data.mainTask).toHaveProperty('estimatedMinutes')
  })
})