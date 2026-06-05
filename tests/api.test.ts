/**
 * API Endpoint 单元测试
 * tests/api.test.ts
 *
 * 测试各个 API endpoint 的正确性
 * 使用 fetch 调用本地 API (http://localhost:3001)
 */
import { describe, it, expect, afterAll } from 'vitest'
import { v4 as uuid } from 'uuid'

const API_BASE = 'http://localhost:3001'

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

describe('Health Check API', () => {
  it('GET /health 应该返回 ok: true', async () => {
    const response = await fetch(`${API_BASE}/health`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data).toHaveProperty('ok', true)
  })
})

describe('Onboarding API', () => {
  it('POST /api/onboarding 缺少必填字段应该返回分析结果', async () => {
    const response = await fetch(`${API_BASE}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIdea: '在线教育平台',
        targetUser: '大学生',
        problemStatement: '学习效率低',
        currentStage: 'idea',
        dailyTimeBudget: '3小时',
        mainBlocker: '不知道怎么获客',
        desiredOutcome: '月收入1万'
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()

    // 验证必要字段存在
    expect(data).toHaveProperty('oneLiner')
    expect(data).toHaveProperty('targetUserHypothesis')
    expect(data).toHaveProperty('riskJudgment')
    expect(data).toHaveProperty('firstWeekGoal')
    expect(data).toHaveProperty('firstTask')
  })

  it('POST /api/onboarding 有基本参数应该返回分析结果', async () => {
    const response = await fetch(`${API_BASE}/api/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    // AI 应该能处理空参数
    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('oneLiner')
  })
})

describe('Plan API', () => {
  it('POST /api/plan 应该返回30天计划', async () => {
    const response = await fetch(`${API_BASE}/api/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIdea: 'AI健身教练'
      })
    })

    expect(response.ok).toBe(true)
    const plan = await response.json()

    expect(Array.isArray(plan)).toBe(true)
    expect(plan.length).toBe(30)

    // 验证所有任务都有必要字段
    plan.forEach((task: any, index: number) => {
      expect(task).toHaveProperty('dayNumber', index + 1)
      expect(task).toHaveProperty('title')
      expect(task).toHaveProperty('taskType')
      expect(task).toHaveProperty('status', 'pending')
    })
  })
})

describe('Coach API', () => {
  const userId = `coach_api_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('POST /api/coach 应该返回AI回复', async () => {
    const response = await fetch(`${API_BASE}/api/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '你好，我想问一下创业的第一步应该做什么？',
        context: {
          startupProfile: {
            userId,
            productIdea: 'AI工具'
          }
        },
        history: []
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('reply')
    expect(typeof data.reply).toBe('string')
  })

  it('POST /api/coach 缺少 message 应该返回错误', async () => {
    const response = await fetch(`${API_BASE}/api/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: { startupProfile: { userId } }
      })
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })
})

describe('Behavior API', () => {
  const userId = `behavior_api_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('POST /api/behavior 应该记录行为日志', async () => {
    const response = await fetch(`${API_BASE}/api/behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'page_view',
        data: { page: '/dashboard', duration: 5000 },
        user_id: userId,
        session_id: `session_${uuid()}`
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('ok', true)
  })

  it('POST /api/behavior 应该能记录多种行为类型', async () => {
    const types = ['page_view', 'task_completed', 'task_skipped', 'checkin_submitted', 'coach_message_sent']

    for (const type of types) {
      const response = await fetch(`${API_BASE}/api/behavior`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: { timestamp: new Date().toISOString() },
          user_id: userId
        })
      })

      expect(response.ok).toBe(true)
    }
  })
})

describe('User Context API', () => {
  const userId = `user_context_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('GET /api/user-context/:userId 应该返回用户上下文', async () => {
    // 先记录一些行为
    await fetch(`${API_BASE}/api/behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'test_action',
        data: {},
        user_id: userId
      })
    })

    const response = await fetch(`${API_BASE}/api/user-context/${userId}`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data).toHaveProperty('persona')
    expect(data).toHaveProperty('recentBlockers')
    expect(data).toHaveProperty('recentHitRate')
  })
})

describe('Update Persona API', () => {
  const userId = `update_persona_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('POST /api/update-persona 应该更新用户画像', async () => {
    const traits = {
      riskTolerance: 'high',
      communicationStyle: 'casual'
    }
    const behaviorPatterns = {
      avg_task_complete_rate: 0.8
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

  it('POST /api/update-persona 缺少 userId 应该返回错误', async () => {
    const response = await fetch(`${API_BASE}/api/update-persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traits: {}
      })
    })

    expect(response.status).toBe(400)
  })
})

describe('Index Interview API', () => {
  const userId = `index_interview_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('POST /api/index-interview 应该索引访谈内容', async () => {
    const response = await fetch(`${API_BASE}/api/index-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        interview: {
          id: uuid(),
          personName: '李四',
          personType: '目标用户',
          currentSolution: 'Excel',
          painPoints: '数据管理混乱',
          verbatimQuotes: '希望有个更简单的工具',
          willingnessToPay: 4
        }
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('ok', true)
  })

  it('POST /api/index-interview 缺少参数应该返回错误', async () => {
    const response = await fetch(`${API_BASE}/api/index-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    expect(response.status).toBe(400)
  })
})

describe('Daily Task API', () => {
  const userId = `daily_task_api_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('POST /api/daily-task 应该返回任务推荐', async () => {
    const response = await fetch(`${API_BASE}/api/daily-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        dayNumber: 5,
        interviewCount: 3,
        leadCount: 10
      })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()

    expect(data).toHaveProperty('mainTask')
    expect(data.mainTask).toHaveProperty('title')
    expect(data.mainTask).toHaveProperty('estimatedMinutes')
  })

  it('POST /api/daily-task 缺少 userId 应该返回错误', async () => {
    const response = await fetch(`${API_BASE}/api/daily-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dayNumber: 1
      })
    })

    expect(response.status).toBe(400)
  })
})

describe('Admin API', () => {
  it('GET /api/admin/users 应该返回用户列表', async () => {
    const response = await fetch(`${API_BASE}/api/admin/users`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data).toHaveProperty('users')
    expect(Array.isArray(data.users)).toBe(true)
  })

  it('GET /api/admin/evolution-logs 应该返回进化日志', async () => {
    const response = await fetch(`${API_BASE}/api/admin/evolution-logs`)
    expect(response.ok).toBe(true)

    const data = await response.json()
    expect(data).toHaveProperty('logs')
    expect(Array.isArray(data.logs)).toBe(true)
  })
})

describe('Weekly Review API', () => {
  const userId = `weekly_review_${uuid()}`

  afterAll(async () => {
    await cleanupUser(userId)
  })

  it('POST /api/review/weekly 应该生成周复盘', async () => {
    const weekData = {
      weekNumber: 1,
      completedTasks: 5,
      interviewCount: 3,
      leadCount: 8,
      totalTaskCount: 7,
      blocker: '时间不够用'
    }

    const response = await fetch(`${API_BASE}/api/review/weekly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekData })
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data).toHaveProperty('reply')
    expect(typeof data.reply).toBe('string')
  })
})