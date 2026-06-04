// =====================
// User
// =====================
export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

// =====================
// StartupProfile
// =====================
export type Stage = 'positioning' | 'validation' | 'mvp' | 'sales' | 'review'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface StartupProfile {
  id: string
  userId: string
  productIdea: string
  targetUser: string
  problemStatement: string
  currentStage: Stage
  dailyTimeBudget: string
  mainBlocker: string
  desiredOutcome: string
  aiSummary: string
  riskLevel: RiskLevel
  createdAt: string
  updatedAt: string
}

// =====================
// Plan
// =====================
export type PlanStatus = 'active' | 'paused' | 'completed'

export interface Plan {
  id: string
  userId: string
  title: string
  startDate: string
  endDate: string
  status: PlanStatus
  createdAt: string
  updatedAt: string
}

// =====================
// DailyTask
// =====================
export type TaskType = 'positioning' | 'interview' | 'landing_page' | 'prototype' | 'sales' | 'review'
export type TaskStatus = 'pending' | 'completed' | 'skipped'

export interface DailyTask {
  id: string
  planId: string
  userId: string
  dayNumber: number
  taskDate: string
  title: string
  description: string
  taskType: TaskType
  priority: number
  successCriteria: string
  status: TaskStatus
  createdBy: 'ai' | 'user' | 'coach'
  createdAt: string
  updatedAt: string
}

// =====================
// DailyCheckin
// =====================
export interface DailyCheckin {
  id: string
  userId: string
  taskDate: string
  completedText: string
  blockedText: string
  interviewCount: number
  leadCount: number
  valueScore: number
  energyScore: number
  aiFeedback: string
  createdAt: string
  updatedAt: string
}

// =====================
// Interview
// =====================
export interface Interview {
  id: string
  userId: string
  interviewDate: string
  personName: string
  personType: string
  contact: string
  currentSolution: string
  painPoints: string
  verbatimQuotes: string
  willingnessToPay: number
  followUpStatus: string
  notes: string
  createdAt: string
  updatedAt: string
}

// =====================
// Lead
// =====================
export type LeadStatus = 'new' | 'contacted' | 'trial' | 'paying' | 'churned'

export interface Lead {
  id: string
  userId: string
  name: string
  source: string
  personType: string
  painPoint: string
  budgetSignal: string
  status: LeadStatus
  nextStep: string
  createdAt: string
  updatedAt: string
}

// =====================
// CoachMessage
// =====================
export type MessageRole = 'user' | 'coach'

export interface CoachMessage {
  id: string
  userId: string
  role: MessageRole
  content: string
  contextSnapshot: Record<string, unknown>
  createdAt: string
}

// =====================
// WeeklyReview
// =====================
export interface WeeklyReview {
  id: string
  userId: string
  weekNumber: number
  summary: string
  completedTasks: number
  interviewCount: number
  leadCount: number
  risks: string
  nextWeekFocus: string
  aiRecommendation: string
  createdAt: string
  updatedAt: string
}

// =====================
// AI Response Types
// =====================
export interface OnboardingAnalysis {
  oneLiner: string
  targetUserHypothesis: string
  riskJudgment: RiskLevel
  firstWeekGoal: string
  firstTask: Omit<DailyTask, 'id' | 'planId' | 'userId' | 'createdAt' | 'updatedAt'>
}

export interface DailyTaskRecommendation {
  mainTask: {
    title: string
    description: string
    successCriteria: string
    estimatedMinutes: number
  }
  secondaryTasks: Array<{
    title: string
    description: string
    estimatedMinutes: number
  }>
  coachNote: string
  riskWarning: string
}
