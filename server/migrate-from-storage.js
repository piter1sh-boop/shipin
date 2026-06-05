// server/migrate-from-storage.js
import 'dotenv/config'
import { db } from './db/index.js'
import { v4 as uuid } from 'uuid'

// LocalStorage keys to migrate
const LOCALSTORAGE_KEYS = [
  'user',
  'startupProfile',
  'currentPlan',
  'dailyTasks',
  'checkins',
  'interviews',
  'leads',
  'coachMessages',
  'weeklyReviews',
]

// Migration tracking table
function ensureMigrationTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migration_meta (
      key TEXT PRIMARY KEY,
      migrated_at TEXT,
      record_count INTEGER
    )
  `)
}

// Check if already migrated (idempotent)
function isMigrated(key) {
  return db.prepare('SELECT 1 FROM _migration_meta WHERE key = ?').get(key)
}

// Mark as migrated
function markMigrated(key, count) {
  db.prepare(`
    INSERT OR REPLACE INTO _migration_meta (key, migrated_at, record_count)
    VALUES (?, ?, ?)
  `).run(key, new Date().toISOString(), count)
}

// Transform: user
function transformUser(data) {
  if (!data) return null
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role || 'user',
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}

// Transform: startupProfile
function transformStartupProfile(data, userId) {
  if (!data) return null
  return {
    id: data.id || uuid(),
    user_id: data.userId || userId,
    product_idea: data.productIdea,
    target_user: data.targetUser,
    problem_statement: data.problemStatement,
    current_stage: data.currentStage,
    daily_time_budget: data.dailyTimeBudget,
    main_blocker: data.mainBlocker,
    desired_outcome: data.desiredOutcome,
    ai_summary: data.aiSummary,
    risk_level: data.riskLevel,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}

// Transform: plan
function transformPlan(data, userId) {
  if (!data) return null
  return {
    id: data.id,
    user_id: data.userId || userId,
    title: data.title,
    start_date: data.startDate,
    end_date: data.endDate,
    status: data.status,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}

// Transform: dailyTask
function transformDailyTask(data, planId, userId) {
  if (!data) return null
  return {
    id: data.id,
    plan_id: data.planId || planId,
    user_id: data.userId || userId,
    day_number: data.dayNumber,
    task_date: data.taskDate,
    title: data.title,
    description: data.description,
    task_type: data.taskType,
    priority: data.priority,
    success_criteria: data.successCriteria,
    status: data.status || 'pending',
    created_by: data.createdBy || 'ai',
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}

// Transform: dailyCheckin
function transformDailyCheckin(data, userId) {
  if (!data) return null
  return {
    id: data.id || uuid(),
    user_id: data.userId || userId,
    task_date: data.taskDate,
    completed_text: data.completedText,
    blocked_text: data.blockedText,
    interview_count: data.interviewCount,
    lead_count: data.leadCount,
    value_score: data.valueScore,
    energy_score: data.energyScore,
    ai_feedback: data.aiFeedback,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}

// Transform: interview
function transformInterview(data, userId) {
  if (!data) return null
  return {
    id: data.id,
    user_id: data.userId || userId,
    interview_date: data.interviewDate,
    person_name: data.personName,
    person_type: data.personType,
    contact: data.contact,
    current_solution: data.currentSolution,
    pain_points: data.painPoints,
    verbatim_quotes: data.verbatimQuotes,
    willingness_to_pay: data.willingnessToPay,
    follow_up_status: data.followUpStatus,
    notes: data.notes,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}

// Transform: lead
function transformLead(data, userId) {
  if (!data) return null
  return {
    id: data.id,
    user_id: data.userId || userId,
    name: data.name,
    source: data.source,
    person_type: data.personType,
    pain_point: data.painPoint,
    budget_signal: data.budgetSignal,
    status: data.status,
    next_step: data.nextStep,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}

// Transform: coachMessage
function transformCoachMessage(data, userId) {
  if (!data) return null
  return {
    id: data.id,
    user_id: data.userId || userId,
    role: data.role,
    content: data.content,
    context_snapshot: typeof data.contextSnapshot === 'object' ? JSON.stringify(data.contextSnapshot) : (data.contextSnapshot || '{}'),
    created_at: data.createdAt,
  }
}

// Transform: weeklyReview
function transformWeeklyReview(data, userId) {
  if (!data) return null
  return {
    id: data.id,
    user_id: data.userId || userId,
    week_number: data.weekNumber,
    summary: data.summary,
    completed_tasks: data.completedTasks,
    interview_count: data.interviewCount,
    lead_count: data.leadCount,
    risks: data.risks,
    next_week_focus: data.nextWeekFocus,
    ai_recommendation: data.aiRecommendation,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}

// Upsert helpers
const upsertUser = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, role, created_at, updated_at)
    VALUES (@id, @name, @email, @role, @created_at, @updated_at)
  `).run(record)
})

const upsertStartupProfile = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO startup_profiles (id, user_id, product_idea, target_user, problem_statement, current_stage, daily_time_budget, main_blocker, desired_outcome, ai_summary, risk_level, created_at, updated_at)
    VALUES (@id, @user_id, @product_idea, @target_user, @problem_statement, @current_stage, @daily_time_budget, @main_blocker, @desired_outcome, @ai_summary, @risk_level, @created_at, @updated_at)
  `).run(record)
})

const upsertPlan = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO plans (id, user_id, title, start_date, end_date, status, created_at, updated_at)
    VALUES (@id, @user_id, @title, @start_date, @end_date, @status, @created_at, @updated_at)
  `).run(record)
})

const upsertDailyTask = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO daily_tasks (id, plan_id, user_id, day_number, task_date, title, description, task_type, priority, success_criteria, status, created_by, created_at, updated_at)
    VALUES (@id, @plan_id, @user_id, @day_number, @task_date, @title, @description, @task_type, @priority, @success_criteria, @status, @created_by, @created_at, @updated_at)
  `).run(record)
})

const upsertDailyCheckin = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO daily_checkins (id, user_id, task_date, completed_text, blocked_text, interview_count, lead_count, value_score, energy_score, ai_feedback, created_at, updated_at)
    VALUES (@id, @user_id, @task_date, @completed_text, @blocked_text, @interview_count, @lead_count, @value_score, @energy_score, @ai_feedback, @created_at, @updated_at)
  `).run(record)
})

const upsertInterview = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO interviews (id, user_id, interview_date, person_name, person_type, contact, current_solution, pain_points, verbatim_quotes, willingness_to_pay, follow_up_status, notes, created_at, updated_at)
    VALUES (@id, @user_id, @interview_date, @person_name, @person_type, @contact, @current_solution, @pain_points, @verbatim_quotes, @willingness_to_pay, @follow_up_status, @notes, @created_at, @updated_at)
  `).run(record)
})

const upsertLead = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO leads (id, user_id, name, source, person_type, pain_point, budget_signal, status, next_step, created_at, updated_at)
    VALUES (@id, @user_id, @name, @source, @person_type, @pain_point, @budget_signal, @status, @next_step, @created_at, @updated_at)
  `).run(record)
})

const upsertCoachMessage = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO coach_messages (id, user_id, role, content, context_snapshot, created_at)
    VALUES (@id, @user_id, @role, @content, @context_snapshot, @created_at)
  `).run(record)
})

const upsertWeeklyReview = db.transaction((record) => {
  db.prepare(`
    INSERT OR IGNORE INTO weekly_reviews (id, user_id, week_number, summary, completed_tasks, interview_count, lead_count, risks, next_week_focus, ai_recommendation, created_at, updated_at)
    VALUES (@id, @user_id, @week_number, @summary, @completed_tasks, @interview_count, @lead_count, @risks, @next_week_focus, @ai_recommendation, @created_at, @updated_at)
  `).run(record)
})

/**
 * Main migration function
 * @param {Object} localStorageData - Object with keys matching LOCALSTORAGE_KEYS
 * @returns {Object} Migration report
 */
export function migrateFromStorage(localStorageData) {
  ensureMigrationTable()

  const report = {
    startedAt: new Date().toISOString(),
    records: {},
    summary: {},
    errors: [],
  }

  // Get userId for reference
  const userData = localStorageData?.user || localStorageData?.startupProfile?.userId
  const userId = userData?.id || localStorageData?.startupProfile?.userId || 'default_user'

  // 1. Migrate user
  if (localStorageData.user) {
    if (isMigrated('user')) {
      report.records.user = { action: 'skipped', reason: 'already migrated' }
    } else {
      const transformed = transformUser(localStorageData.user)
      if (transformed) {
        upsertUser(transformed)
        markMigrated('user', 1)
        report.records.user = { action: 'migrated', count: 1 }
      }
    }
  }

  // 2. Migrate startup profile
  if (localStorageData.startupProfile) {
    if (isMigrated('startupProfile')) {
      report.records.startupProfile = { action: 'skipped', reason: 'already migrated' }
    } else {
      const transformed = transformStartupProfile(localStorageData.startupProfile, userId)
      if (transformed) {
        upsertStartupProfile(transformed)
        markMigrated('startupProfile', 1)
        report.records.startupProfile = { action: 'migrated', count: 1 }
      }
    }
  }

  // 3. Migrate plan
  if (localStorageData.currentPlan) {
    if (isMigrated('currentPlan')) {
      report.records.currentPlan = { action: 'skipped', reason: 'already migrated' }
    } else {
      const transformed = transformPlan(localStorageData.currentPlan, userId)
      if (transformed) {
        upsertPlan(transformed)
        markMigrated('currentPlan', 1)
        report.records.currentPlan = { action: 'migrated', count: 1 }
      }
    }
  }

  // 4. Migrate daily tasks (array)
  if (localStorageData.dailyTasks?.length > 0) {
    if (isMigrated('dailyTasks')) {
      report.records.dailyTasks = { action: 'skipped', reason: 'already migrated' }
    } else {
      let count = 0
      const planId = localStorageData.currentPlan?.id
      for (const task of localStorageData.dailyTasks) {
        const transformed = transformDailyTask(task, planId, userId)
        if (transformed) {
          upsertDailyTask(transformed)
          count++
        }
      }
      markMigrated('dailyTasks', count)
      report.records.dailyTasks = { action: 'migrated', count }
    }
  }

  // 5. Migrate checkins (array)
  if (localStorageData.checkins?.length > 0) {
    if (isMigrated('checkins')) {
      report.records.checkins = { action: 'skipped', reason: 'already migrated' }
    } else {
      let count = 0
      for (const checkin of localStorageData.checkins) {
        const transformed = transformDailyCheckin(checkin, userId)
        if (transformed) {
          upsertDailyCheckin(transformed)
          count++
        }
      }
      markMigrated('checkins', count)
      report.records.checkins = { action: 'migrated', count }
    }
  }

  // 6. Migrate interviews (array)
  if (localStorageData.interviews?.length > 0) {
    if (isMigrated('interviews')) {
      report.records.interviews = { action: 'skipped', reason: 'already migrated' }
    } else {
      let count = 0
      for (const interview of localStorageData.interviews) {
        const transformed = transformInterview(interview, userId)
        if (transformed) {
          upsertInterview(transformed)
          count++
        }
      }
      markMigrated('interviews', count)
      report.records.interviews = { action: 'migrated', count }
    }
  }

  // 7. Migrate leads (array)
  if (localStorageData.leads?.length > 0) {
    if (isMigrated('leads')) {
      report.records.leads = { action: 'skipped', reason: 'already migrated' }
    } else {
      let count = 0
      for (const lead of localStorageData.leads) {
        const transformed = transformLead(lead, userId)
        if (transformed) {
          upsertLead(transformed)
          count++
        }
      }
      markMigrated('leads', count)
      report.records.leads = { action: 'migrated', count }
    }
  }

  // 8. Migrate coach messages (array)
  if (localStorageData.coachMessages?.length > 0) {
    if (isMigrated('coachMessages')) {
      report.records.coachMessages = { action: 'skipped', reason: 'already migrated' }
    } else {
      let count = 0
      for (const msg of localStorageData.coachMessages) {
        const transformed = transformCoachMessage(msg, userId)
        if (transformed) {
          upsertCoachMessage(transformed)
          count++
        }
      }
      markMigrated('coachMessages', count)
      report.records.coachMessages = { action: 'migrated', count }
    }
  }

  // 9. Migrate weekly reviews (array)
  if (localStorageData.weeklyReviews?.length > 0) {
    if (isMigrated('weeklyReviews')) {
      report.records.weeklyReviews = { action: 'skipped', reason: 'already migrated' }
    } else {
      let count = 0
      for (const review of localStorageData.weeklyReviews) {
        const transformed = transformWeeklyReview(review, userId)
        if (transformed) {
          upsertWeeklyReview(transformed)
          count++
        }
      }
      markMigrated('weeklyReviews', count)
      report.records.weeklyReviews = { action: 'migrated', count }
    }
  }

  // Calculate totals
  report.completedAt = new Date().toISOString()
  report.summary = {
    totalTablesMigrated: Object.values(report.records).filter(r => r.action === 'migrated').length,
    totalRecordsMigrated: Object.values(report.records)
      .filter(r => r.action === 'migrated')
      .reduce((sum, r) => sum + r.count, 0),
    tablesSkipped: Object.values(report.records).filter(r => r.action === 'skipped').length,
  }

  return report
}

// Run as CLI script for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[migration] This module should be imported by server/index.js')
  process.exit(0)
}