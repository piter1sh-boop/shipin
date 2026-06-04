import { create } from 'zustand'
import { storage } from '../lib/storage'
import { aiService } from '../lib/aiService'
import type {
  User,
  StartupProfile,
  Plan,
  DailyTask,
  DailyCheckin,
  Interview,
  Lead,
  CoachMessage,
  WeeklyReview,
} from '../types'

function uuid() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}

async function initializeUserPersona(userId: string): Promise<void> {
  try {
    await fetch('/api/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'user_init',
        data: {
          userId,
          traits: {
            tech_ability: 'medium',
            sales_ability: 'medium',
            interview_resistance: 'medium',
          },
          behavior_patterns: {
            avg_task_complete_rate: 0,
            preferred_task_types: [],
            weakest_task_types: [],
          },
        },
      }),
    })
  } catch (e) {
    console.warn('[store] Failed to initialize user persona:', e)
  }
}

interface StoreState {
  // Auth
  user: User | null
  isOnboarded: boolean

  // Entities
  startupProfile: StartupProfile | null
  currentPlan: Plan | null
  dailyTasks: DailyTask[]
  checkins: DailyCheckin[]
  interviews: Interview[]
  leads: Lead[]
  coachMessages: CoachMessage[]
  weeklyReviews: WeeklyReview[]

  // Actions - Auth
  initUser: () => void

  // Actions - Onboarding
  submitOnboarding: (data: Omit<StartupProfile, 'id' | 'userId' | 'aiSummary' | 'riskLevel' | 'createdAt' | 'updatedAt'>) => Promise<void>

  // Actions - Tasks
  completeTask: (taskId: string) => void
  skipTask: (taskId: string) => void
  updateTaskStatus: (taskId: string, status: DailyTask['status']) => void

  // Actions - Checkin
  submitCheckin: (data: Omit<DailyCheckin, 'id' | 'userId' | 'aiFeedback' | 'createdAt' | 'updatedAt'>) => Promise<void>

  // Actions - Interviews
  addInterview: (data: Omit<Interview, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  updateInterview: (id: string, data: Partial<Interview>) => void
  deleteInterview: (id: string) => void

  // Actions - Leads
  addLead: (data: Omit<Lead, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  updateLead: (id: string, data: Partial<Lead>) => void
  deleteLead: (id: string) => void

  // Actions - Coach
  sendCoachMessage: (content: string) => Promise<void>

  // Computed helpers
  getTodayTasks: () => DailyTask[]
  getInterviewsCount: () => number
  getLeadsCount: () => number
  getCompletedTasksCount: () => number
  getCurrentDay: () => number
}

const emptyUser: User = {
  id: uuid(),
  name: '测试用户',
  email: 'test@example.com',
  role: 'user',
  createdAt: now(),
  updatedAt: now(),
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  isOnboarded: false,
  startupProfile: null,
  currentPlan: null,
  dailyTasks: [],
  checkins: [],
  interviews: [],
  leads: [],
  coachMessages: [],
  weeklyReviews: [],

  initUser: () => {
    const user = storage.get<User | null>('user', null)
    const profile = storage.get<StartupProfile | null>('startupProfile', null)
    const plan = storage.get<Plan | null>('currentPlan', null)
    const tasks = storage.get<DailyTask[]>('dailyTasks', [])
    const checkins = storage.get<DailyCheckin[]>('checkins', [])
    const interviews = storage.get<Interview[]>('interviews', [])
    const leads = storage.get<Lead[]>('leads', [])
    const messages = storage.get<CoachMessage[]>('coachMessages', [])
    const reviews = storage.get<WeeklyReview[]>('weeklyReviews', [])

    set({
      user: user ?? emptyUser,
      isOnboarded: profile !== null,
      startupProfile: profile,
      currentPlan: plan,
      dailyTasks: tasks,
      checkins,
      interviews,
      leads,
      coachMessages: messages,
      weeklyReviews: reviews,
    })

    if (!user) {
      storage.set('user', emptyUser)
      set({ user: emptyUser })
    }
  },

  submitOnboarding: async (data) => {
    const user = get().user!
    const analysis = await aiService.analyzeOnboarding(data)

    const profile: StartupProfile = {
      ...data,
      id: uuid(),
      userId: user.id,
      aiSummary: analysis.oneLiner,
      riskLevel: analysis.riskJudgment,
      createdAt: now(),
      updatedAt: now(),
    }

    const plan: Plan = {
      id: uuid(),
      userId: user.id,
      title: '30天创业执行计划',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 29 * 86400000).toISOString().split('T')[0],
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    }

    const rawTasks = await aiService.generate30DayPlan(user.id, plan.id)
    const tasks: DailyTask[] = rawTasks.map(t => ({
      ...t,
      id: uuid(),
      createdAt: now(),
      updatedAt: now(),
    }))

    storage.set('startupProfile', profile)
    storage.set('currentPlan', plan)
    storage.set('dailyTasks', tasks)

    set({
      startupProfile: profile,
      currentPlan: plan,
      dailyTasks: tasks,
      isOnboarded: true,
    })

    // Initialize user persona in backend
    initializeUserPersona(user.id)
  },

  completeTask: (taskId) => {
    const tasks = get().dailyTasks.map(t =>
      t.id === taskId ? { ...t, status: 'completed' as const, updatedAt: now() } : t,
    )
    storage.set('dailyTasks', tasks)
    set({ dailyTasks: tasks })

    // Update user persona
    const user = get().user!
    const completedCount = tasks.filter(t => t.status === 'completed').length
    const totalCount = tasks.length
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) / 100 : 0
    fetch('/api/update-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        behavior_patterns: { avg_task_complete_rate: rate }
      }),
    }).catch(() => {})
  },

  skipTask: (taskId) => {
    const tasks = get().dailyTasks.map(t =>
      t.id === taskId ? { ...t, status: 'skipped' as const, updatedAt: now() } : t,
    )
    storage.set('dailyTasks', tasks)
    set({ dailyTasks: tasks })

    // Update user persona (lower rate for skipped tasks)
    const user = get().user!
    const completedCount = tasks.filter(t => t.status === 'completed').length
    const totalCount = tasks.length
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) / 100 : 0
    fetch('/api/update-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        behavior_patterns: { avg_task_complete_rate: rate }
      }),
    }).catch(() => {})
  },

  updateTaskStatus: (taskId, status) => {
    const tasks = get().dailyTasks.map(t =>
      t.id === taskId ? { ...t, status, updatedAt: now() } : t,
    )
    storage.set('dailyTasks', tasks)
    set({ dailyTasks: tasks })
  },

  submitCheckin: async (data) => {
    const user = get().user!
    const checkin: DailyCheckin = {
      ...data,
      id: uuid(),
      userId: user.id,
      aiFeedback: '收到，继续保持今天的执行节奏。',
      createdAt: now(),
      updatedAt: now(),
    }
    const checkins = [...get().checkins, checkin]
    storage.set('checkins', checkins)
    set({ checkins })

    // Update user persona with checkin data
    const tasks = get().dailyTasks
    const completedCount = tasks.filter(t => t.status === 'completed').length
    const totalCount = tasks.length
    const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) / 100 : 0
    fetch('/api/update-persona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        behavior_patterns: {
          avg_task_complete_rate: rate,
          last_checkin_value_score: data.valueScore,
          last_checkin_blocked: data.blockedText,
        }
      }),
    }).catch(() => {})
  },

  addInterview: (data) => {
    const user = get().user!
    const interview: Interview = {
      ...data,
      id: uuid(),
      userId: user.id,
      createdAt: now(),
      updatedAt: now(),
    }
    const interviews = [...get().interviews, interview]
    storage.set('interviews', interviews)
    set({ interviews })

    // Index interview to RAG (fire and forget)
    fetch('/api/index-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, interview: data }),
    }).catch(() => {})
  },

  updateInterview: (id, data) => {
    const interviews = get().interviews.map(i =>
      i.id === id ? { ...i, ...data, updatedAt: now() } : i,
    )
    storage.set('interviews', interviews)
    set({ interviews })
  },

  deleteInterview: (id) => {
    const interviews = get().interviews.filter(i => i.id !== id)
    storage.set('interviews', interviews)
    set({ interviews })
  },

  addLead: (data) => {
    const user = get().user!
    const lead: Lead = {
      ...data,
      id: uuid(),
      userId: user.id,
      createdAt: now(),
      updatedAt: now(),
    }
    const leads = [...get().leads, lead]
    storage.set('leads', leads)
    set({ leads })
  },

  updateLead: (id, data) => {
    const leads = get().leads.map(l =>
      l.id === id ? { ...l, ...data, updatedAt: now() } : l,
    )
    storage.set('leads', leads)
    set({ leads })
  },

  deleteLead: (id) => {
    const leads = get().leads.filter(l => l.id !== id)
    storage.set('leads', leads)
    set({ leads })
  },

  sendCoachMessage: async (content) => {
    const user = get().user!
    const history = get().coachMessages

    const userMsg: CoachMessage = {
      id: uuid(),
      userId: user.id,
      role: 'user',
      content,
      contextSnapshot: {},
      createdAt: now(),
    }
    const updatedMessages = [...history, userMsg]
    storage.set('coachMessages', updatedMessages)
    set({ coachMessages: updatedMessages })

    const reply = await aiService.coachReply(content, history, { startupProfile: get().startupProfile })
    const coachMsg: CoachMessage = {
      id: uuid(),
      userId: user.id,
      role: 'coach',
      content: reply,
      contextSnapshot: {},
      createdAt: now(),
    }
    const finalMessages = [...updatedMessages, coachMsg]
    storage.set('coachMessages', finalMessages)
    set({ coachMessages: finalMessages })
  },

  getTodayTasks: () => {
    const today = new Date().toISOString().split('T')[0]
    const byDate = get().dailyTasks.filter(t => t.taskDate === today)
    if (byDate.length > 0) return byDate
    // Fallback: use tasks where dayNumber matches current day
    const currentDay = get().getCurrentDay()
    if (currentDay === 0) return []
    return get().dailyTasks.filter(t => t.dayNumber === currentDay)
  },

  getInterviewsCount: () => get().interviews.length,

  getLeadsCount: () => get().leads.length,

  getCompletedTasksCount: () =>
    get().dailyTasks.filter(t => t.status === 'completed').length,

  getCurrentDay: () => {
    const plan = get().currentPlan
    if (!plan) return 0
    const start = new Date(plan.startDate).getTime()
    const now = Date.now()
    return Math.min(30, Math.max(1, Math.floor((now - start) / 86400000) + 1))
  },
}))
