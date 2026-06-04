import { Router } from 'express'
import { chat, chatJson } from '../services/minimax.js'

export const aiRouter = Router()

// POST /api/onboarding — analyze startup idea
aiRouter.post('/onboarding', async (req, res) => {
  try {
    const { productIdea, targetUser, problemStatement, currentStage, dailyTimeBudget, mainBlocker, desiredOutcome } = req.body

    const system = `你是30天创业执行教练，负责分析用户的创业想法并生成执行计划。
你必须输出一份JSON，包含：
{
  "oneLiner": "一句话产品假设",
  "targetUserHypothesis": "目标用户假设",
  "riskJudgment": "low|medium|high",
  "firstWeekGoal": "第一周目标",
  "firstTask": { "title": "", "description": "", "successCriteria": "", "taskType": "positioning|interview|landing_page|prototype|sales|review", "priority": 1, "dayNumber": 1, "taskDate": "YYYY-MM-DD", "status": "pending" }
}
所有文本使用中文。`

    const user = `用户信息：
产品想法：${productIdea || ''}
目标用户：${targetUser || ''}
痛点陈述：${problemStatement || ''}
当前阶段：${currentStage || ''}
每天可用时间：${dailyTimeBudget || ''}
主要卡点：${mainBlocker || ''}
期望结果：${desiredOutcome || ''}

请分析并输出一份JSON。`

    const result = await chatJson([{ role: 'system', content: system }, { role: 'user', content: user }])
    res.json(result)
  } catch (err) {
    console.error('[/api/onboarding]', err.message)
    res.status(500).json({ error: 'AI分析失败，请稍后重试' })
  }
})

// POST /api/plan — generate 30-day plan
aiRouter.post('/plan', async (req, res) => {
  try {
    const { productIdea } = req.body

    const system = `你是30天创业执行计划生成器。请根据用户的创业想法生成一份30天执行计划。
输出一个JSON数组，每个元素代表一天的任务：
{
  "dayNumber": 1-30,
  "taskDate": "YYYY-MM-DD",
  "title": "任务标题",
  "description": "任务详细描述",
  "taskType": "positioning|interview|landing_page|prototype|sales|review",
  "priority": 3,
  "successCriteria": "完成标准",
  "status": "pending",
  "createdBy": "ai"
}
注意：第1-7天定位和访谈，第8-14天落地页和MVP，第15-21天测试和线索，第22-30天复盘。
所有文本使用中文。`

    const user = `产品想法：${productIdea || 'AI创业执行教练产品'}
请生成30天执行计划，以JSON数组形式输出，不要加markdown代码块标记。`

    const text = await chat([{ role: 'system', content: system }, { role: 'user', content: user }])
    // Strip thinking tags first
    const cleaned = text.replace(/<thinking[\s\S]*?<\/thinking>/gi, '').replace(/<think[\s\S]*?<\/think>/g, '').trim()
    // Find first '[' and last ']' to get the JSON array
    const firstB = cleaned.indexOf('[')
    const lastB = cleaned.lastIndexOf(']')
    if (firstB === -1 || lastB === -1 || firstB >= lastB) throw new Error('No JSON array in plan response')
    const jsonText = cleaned.slice(firstB, lastB + 1)
    res.json(JSON.parse(jsonText))
  } catch (err) {
    console.error('[/api/plan]', err.message)
    res.status(500).json({ error: '计划生成失败，请稍后重试' })
  }
})

// POST /api/coach — coach chat
aiRouter.post('/coach', async (req, res) => {
  try {
    const { message, context } = req.body
    if (!message) return res.status(400).json({ error: 'message is required' })

    const profile = context?.startupProfile
    const system = `你是一个严厉但务实的30天创业执行教练，服务对象是AI独立开发者和程序员创业者。
你的目标不是让用户感觉良好，而是推动用户每天完成真实创业动作。
你必须优先推动用户接触真实用户、验证问题、获得付费信号，而不是沉迷写代码。
你给出的建议必须具体、可执行、可在24小时内完成。
当证据不足时，你必须指出证据不足，不允许假装确定。
用中文回答。`

    const ctxInfo = profile
      ? `用户创业画像：\n产品：${profile.productIdea}\n目标用户：${profile.targetUser}\n当前阶段：${profile.currentStage}\nAI分析：${profile.aiSummary}\n`
      : ''

    const reply = await chat([
      { role: 'system', content: system },
      { role: 'user', content: ctxInfo + `\n用户问题：${message}` },
    ])

    res.json({ reply })
  } catch (err) {
    console.error('[/api/coach]', err.message)
    res.status(500).json({ error: 'AI回复失败，请稍后重试' })
  }
})

// POST /api/review/weekly — generate weekly review
aiRouter.post('/review/weekly', async (req, res) => {
  try {
    const { weekData } = req.body

    const system = `你是一个严厉但务实的30天创业执行教练，请根据用户本周执行数据生成周复盘。
请判断：1.用户是否在逃避真实验证 2.是否获得足够用户证据 3.产品假设是否还站得住 4.下周最重要的3个动作 5.对人工教练的提醒。
用中文输出。`

    const reply = await chat([
      { role: 'system', content: system },
      { role: 'user', content: `本周数据：${JSON.stringify(weekData)}` },
    ])

    res.json({ reply })
  } catch (err) {
    console.error('[/api/review/weekly]', err.message)
    res.status(500).json({ error: '复盘生成失败，请稍后重试' })
  }
})
