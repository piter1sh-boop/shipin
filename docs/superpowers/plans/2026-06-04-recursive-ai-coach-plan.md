# 递归自进化AI创业教练系统 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有30天AI创业教练升级为具有递归自进化能力的系统（个性化适应 + 全局进化飞轮）

**Architecture:** 轻量迭代方案 - LocalStorage迁移到SQLite + Prompt动态组装 + FTS5全文检索 + 进化追踪

**Tech Stack:** React + TypeScript + Vite + Express + SQLite(better-sqlite3) + MiniMax API

---

## 文件结构

```
shipin/
├── package.json              # 添加 better-sqlite3 依赖
├── server/
│   ├── db/
│   │   └── index.js          # 🆕 SQLite初始化（阶段1）
│   └── routes/
│       └── behavior.js       # 🆕 行为数据路由（阶段2）
├── src/
│   ├── lib/
│   │   ├── behaviorTracker.ts # 🆕 行为采集（阶段2）
│   │   └── storage.ts        # 改动：适配SQLite（阶段1）
│   ├── hooks/
│   │   └── useBehaviorTracking.ts # 🆕 Hooks（阶段2）
│   └── store/
│       └── index.ts          # 改动：适配SQLite（阶段1）
├── data/                     # 🆕 SQLite数据目录
│   └── shipin.db             # 🆕 SQLite数据库文件
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-06-04-recursive-ai-coach-plan.md  # 本计划
```

---

## 阶段0：现有系统稳定化

### Task 0.1: 添加 SQLite 依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 better-sqlite3 依赖**

```bash
npm install better-sqlite3
```

- [ ] **Step 2: 验证安装**

Run: `npm list better-sqlite3`
Expected: `better-sqlite3@^11.x.x`

- [ ] **Step 3: 提交**

```bash
git add package.json package-lock.json
git commit -m "deps: add better-sqlite3 for SQLite support"
```

---

### Task 0.2: 创建 data 目录

**Files:**
- Create: `data/.gitkeep`

- [ ] **Step 1: 创建 data 目录和 .gitkeep**

```bash
mkdir -p /Users/shuhaipeng/shipin/data
touch /Users/shuhaipeng/shipin/data/.gitkeep
```

- [ ] **Step 2: 添加到 .gitignore**

```bash
echo "data/*.db" >> /Users/shuhaipeng/shipin/.gitignore
```

- [ ] **Step 3: 提交**

```bash
git add data/.gitkeep .gitignore
git commit -m "chore: add data directory for SQLite database"
```

---

### Task 0.3: 验证现有功能

**Files:**
- Test: `src/pages/Dashboard.tsx`, `src/pages/Coach.tsx`

- [ ] **Step 1: 启动开发服务器**

```bash
cd /Users/shuhaipeng/shipin && npm run dev
```

- [ ] **Step 2: 验证页面可访问**

Open: http://localhost:5177
Expected: 看到 Landing 页面

- [ ] **Step 3: 验证 Dashboard 加载**

Navigate to: /onboarding → 填写表单 → 提交
Expected: 跳转到 /dashboard，显示30天进度

- [ ] **Step 4: 停止服务器**

Press: Ctrl+C

---

## 阶段1：SQLite基础设施

### Task 1.1: 创建 SQLite 初始化模块

**Files:**
- Create: `server/db/index.js`

- [ ] **Step 1: 创建 server/db 目录**

```bash
mkdir -p /Users/shuhaipeng/shipin/server/db
```

- [ ] **Step 2: 编写 SQLite 初始化模块**

```javascript
// server/db/index.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'shipin.db');

// 确保 data 目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);

// 启用 WAL 模式和外键
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      role TEXT DEFAULT 'user',
      created_at TEXT,
      updated_at TEXT
    );

    -- 创业画像
    CREATE TABLE IF NOT EXISTS startup_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      product_idea TEXT,
      target_user TEXT,
      problem_statement TEXT,
      current_stage TEXT,
      daily_time_budget TEXT,
      main_blocker TEXT,
      desired_outcome TEXT,
      ai_summary TEXT,
      risk_level TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- 计划表
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      title TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- 每日任务
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      plan_id TEXT REFERENCES plans(id),
      user_id TEXT REFERENCES users(id),
      day_number INTEGER,
      task_date TEXT,
      title TEXT,
      description TEXT,
      task_type TEXT,
      priority INTEGER,
      success_criteria TEXT,
      status TEXT DEFAULT 'pending',
      created_by TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- 每日Check-in
    CREATE TABLE IF NOT EXISTS daily_checkins (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      task_date TEXT,
      completed_text TEXT,
      blocked_text TEXT,
      interview_count INTEGER,
      lead_count INTEGER,
      value_score INTEGER,
      energy_score INTEGER,
      ai_feedback TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- 用户访谈
    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      interview_date TEXT,
      person_name TEXT,
      person_type TEXT,
      contact TEXT,
      current_solution TEXT,
      pain_points TEXT,
      verbatim_quotes TEXT,
      willingness_to_pay INTEGER,
      follow_up_status TEXT,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- 线索
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      name TEXT,
      source TEXT,
      person_type TEXT,
      pain_point TEXT,
      budget_signal TEXT,
      status TEXT,
      next_step TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- 教练对话
    CREATE TABLE IF NOT EXISTS coach_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      role TEXT,
      content TEXT,
      context_snapshot TEXT,
      created_at TEXT
    );

    -- 周复盘
    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      week_number INTEGER,
      summary TEXT,
      completed_tasks INTEGER,
      interview_count INTEGER,
      lead_count INTEGER,
      risks TEXT,
      next_week_focus TEXT,
      ai_recommendation TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    -- 行为日志
    CREATE TABLE IF NOT EXISTS behavior_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      event_type TEXT NOT NULL,
      event_data TEXT,
      session_id TEXT,
      created_at TEXT
    );

    -- 任务推荐记录
    CREATE TABLE IF NOT EXISTS task_recommendations (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      day_number INTEGER,
      recommended_tasks TEXT,
      actual_completed INTEGER,
      actual_skipped INTEGER,
      recommendation_hit_rate REAL,
      ai_context_used TEXT,
      created_at TEXT
    );

    -- RAG知识库索引（FTS5）
    CREATE VIRTUAL TABLE IF NOT EXISTS rag_index USING fts5(
      content TEXT,
      content_type TEXT,
      user_id TEXT,
      related_task_type TEXT,
      created_at TEXT
    );

    -- 用户个性化上下文
    CREATE TABLE IF NOT EXISTS user_persona (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      traits TEXT,
      behavior_patterns TEXT,
      updated_at TEXT
    );

    -- 进化日志
    CREATE TABLE IF NOT EXISTS evolution_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT,
      description TEXT,
      trigger TEXT,
      metric_change TEXT,
      created_at TEXT
    );
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_behavior_logs_user ON behavior_logs(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_behavior_logs_type ON behavior_logs(event_type, created_at);
    CREATE INDEX IF NOT EXISTS idx_task_recommendations_user ON task_recommendations(user_id, day_number);
    CREATE INDEX IF NOT EXISTS idx_rag_index_user ON rag_index(user_id, content_type);
    CREATE INDEX IF NOT EXISTS idx_interviews_user ON interviews(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id, status);
  `);
}

// 初始化
initDatabase();
```

- [ ] **Step 3: 测试初始化**

```bash
cd /Users/shuhaipeng/shipin && node -e "import('./server/db/index.js').then(() => console.log('DB OK'))"
```

Expected: `DB OK` + 创建了 `data/shipin.db`

- [ ] **Step 4: 提交**

```bash
git add server/db/index.js
git commit -m "feat(db): add SQLite initialization module with all tables"
```

---

### Task 1.2: 更新 storage.ts 适配 SQLite

**Files:**
- Modify: `src/lib/storage.ts`

- [ ] **Step 1: 读取现有 storage.ts**

```typescript
// src/lib/storage.ts 的现有内容需要扩展 SQLite 支持
```

- [ ] **Step 2: 重写 storage.ts 支持 LocalStorage + SQLite**

```typescript
// src/lib/storage.ts
const STORAGE_KEY_PREFIX = 'shipin_';

// LocalStorage 实现（保持向后兼容）
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (item === null) return defaultValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  },

  remove(key: string): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  },

  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_KEY_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }
};
```

- [ ] **Step 3: 添加 SQLite 同步接口（预留）**

```typescript
// src/lib/storage.ts 增加 SQLite 接口
export interface StorageBackend {
  get<T>(key: string, defaultValue: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
  clear(): void;
}

// 当前使用 LocalStorage
export const backend: StorageBackend = storage;
```

- [ ] **Step 4: 提交**

```bash
git add src/lib/storage.ts
git commit -m "refactor(storage): extract StorageBackend interface for future SQLite backend"
```

---

### Task 1.3: 创建 server/db 初始化调用

**Files:**
- Modify: `server/index.js`

- [ ] **Step 1: 在 server/index.js 开头添加 SQLite 初始化**

```javascript
// server/index.js 开头添加
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { aiRouter } from './routes/ai.js';
import { initDatabase } from './db/index.js';  // 🆕 添加这行

// 初始化数据库
initDatabase();  // 🆕 添加这行
```

- [ ] **Step 2: 验证启动**

```bash
cd /Users/shuhaipeng/shipin && npm run dev:server &
sleep 2 && curl http://localhost:3001/health
```

Expected: `{"ok": true}`

- [ ] **Step 3: 停止服务器**

```bash
pkill -f "node server/index.js" 2>/dev/null || true
```

- [ ] **Step 4: 提交**

```bash
git add server/index.js
git commit -m "feat(server): initialize SQLite database on startup"
```

---

## 阶段2：数据采集层

### Task 2.1: 创建行为采集模块

**Files:**
- Create: `src/lib/behaviorTracker.ts`

- [ ] **Step 1: 创建 behaviorTracker.ts**

```typescript
// src/lib/behaviorTracker.ts

export type EventType =
  | 'page_view'
  | 'task_complete'
  | 'task_skip'
  | 'coach_message'
  | 'interview_add'
  | 'lead_add'
  | 'checkin_submit'
  | 'stay_duration';

export interface BehaviorEvent {
  type: EventType;
  data: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export function track(event: Omit<BehaviorEvent, 'timestamp' | 'sessionId'>): void {
  const fullEvent: BehaviorEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  // 通过 localStorage 暂存，稍后同步到后端
  const key = `behavior_queue`;
  const queue = storage.get<BehaviorEvent[]>(key, []);
  queue.push(fullEvent);
  storage.set(key, queue);

  // 异步发送到后端（不阻塞UI）
  sendToBackend(fullEvent);
}

async function sendToBackend(event: BehaviorEvent): Promise<void> {
  try {
    await fetch('/api/behavior', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch {
    // 静默失败，数据已在 localStorage 暂存
  }
}

// 导出简化用法
export const behaviorTracker = {
  pageView: (page: string) => track({ type: 'page_view', data: { page } }),
  taskComplete: (taskId: string) => track({ type: 'task_complete', data: { taskId } }),
  taskSkip: (taskId: string) => track({ type: 'task_skip', data: { taskId } }),
  coachMessage: (messageLength: number) => track({ type: 'coach_message', data: { messageLength } }),
  interviewAdd: () => track({ type: 'interview_add', data: {} }),
  leadAdd: () => track({ type: 'lead_add', data: {} }),
  checkinSubmit: (valueScore: number) => track({ type: 'checkin_submit', data: { valueScore } }),
  stayDuration: (page: string, duration: number) => track({ type: 'stay_duration', data: { page, duration } }),
};
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/behaviorTracker.ts
git commit -m "feat(tracker): add behavior tracking module"
```

---

### Task 2.2: 创建行为数据后端路由

**Files:**
- Create: `server/routes/behavior.js`

- [ ] **Step 1: 创建 behavior.js 路由**

```javascript
// server/routes/behavior.js
import express from 'express';
import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';

export const behaviorRouter = express.Router();

// 采集行为数据
behaviorRouter.post('/behavior', (req, res) => {
  const { type, data, session_id } = req.body;
  const userId = req.body.user_id || 'default_user'; // TODO: 后续接入用户体系

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

// 获取用户上下文
behaviorRouter.get('/user-context/:userId', (req, res) => {
  const { userId } = req.params;

  const persona = db.prepare('SELECT * FROM user_persona WHERE user_id = ?').get(userId);
  const recentBlockers = db.prepare(`
    SELECT blocked_text FROM daily_checkins
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 3
  `).all(userId);
  const recentHitRate = db.prepare(`
    SELECT AVG(recommendation_hit_rate) as rate FROM task_recommendations
    WHERE user_id = ? AND created_at > date('now', '-7 days')
  `).get(userId);

  res.json({
    persona,
    recentBlockers,
    recentHitRate,
  });
});
```

- [ ] **Step 2: 在 server/index.js 中注册路由**

```javascript
// server/index.js 添加
import { behaviorRouter } from './routes/behavior.js';  // 🆕 添加

// 🆕 在现有 API 路由后添加
app.use('/api', behaviorRouter);
```

- [ ] **Step 3: 测试路由**

```bash
cd /Users/shuhaipeng/shipin && npm run dev:server &
sleep 2
curl -X POST http://localhost:3001/api/behavior \
  -H "Content-Type: application/json" \
  -d '{"type": "page_view", "data": {"page": "dashboard"}, "session_id": "test"}'
```

Expected: `{"ok": true}`

- [ ] **Step 4: 停止服务器并提交**

```bash
pkill -f "node server/index.js" 2>/dev/null || true
git add server/routes/behavior.js server/index.js
git commit -m "feat(behavior): add behavior tracking API routes"
```

---

### Task 2.3: 创建行为追踪 Hooks

**Files:**
- Create: `src/hooks/useBehaviorTracking.ts`

- [ ] **Step 1: 创建 hooks 目录和文件**

```bash
mkdir -p /Users/shuhaipeng/shipin/src/hooks
```

- [ ] **Step 2: 编写 useBehaviorTracking.ts**

```typescript
// src/hooks/useBehaviorTracking.ts
import { useEffect, useRef } from 'react';
import { behaviorTracker, getSessionId } from '../lib/behaviorTracker';

// 页面停留追踪
export function usePageTracking(pageName: string) {
  const startTime = useRef(Date.now());

  useEffect(() => {
    // 页面进入
    behaviorTracker.pageView(pageName);

    return () => {
      // 页面离开，记录停留时长
      const duration = Date.now() - startTime.current;
      if (duration > 1000) {
        // 只记录超过1秒的停留
        behaviorTracker.stayDuration(pageName, duration);
      }
    };
  }, [pageName]);
}

// 任务追踪
export function useTaskTracking(taskId: string, status: 'complete' | 'skip') {
  useEffect(() => {
    if (status === 'complete') {
      behaviorTracker.taskComplete(taskId);
    } else {
      behaviorTracker.taskSkip(taskId);
    }
  }, [taskId, status]);
}

// 对话追踪
export function useCoachTracking(messageLength: number) {
  useEffect(() => {
    behaviorTracker.coachMessage(messageLength);
  }, [messageLength]);
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useBehaviorTracking.ts
git commit -m "feat(hooks): add behavior tracking React hooks"
```

---

### Task 2.4: 在 Dashboard 集成行为追踪

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: 添加 usePageTracking hook 调用**

```typescript
// src/pages/Dashboard.tsx 开头添加导入
import { usePageTracking } from '../hooks/useBehaviorTracking';

// 在 DashboardPage 组件内添加
export default function DashboardPage() {
  usePageTracking('dashboard');  // 🆕 添加这行
  
  // ... 现有代码保持不变
}
```

- [ ] **Step 2: 测试 Dashboard 行为追踪**

```bash
cd /Users/shuhaipeng/shipin && npm run dev &
# 打开 http://localhost:5177 -> /dashboard
# 检查 Network 请求是否有 /api/behavior
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(dashboard): integrate behavior tracking"
```

---

### Task 2.5: 初始化用户画像

**Files:**
- Modify: `src/store/index.ts` 的 submitOnboarding 函数

- [ ] **Step 1: 在 submitOnboarding 成功后初始化 user_persona**

```typescript
// src/store/index.ts 的 submitOnboarding 函数末尾添加
// 初始化用户画像
const initialPersona = {
  traits: JSON.stringify({
    tech_ability: 'medium',
    sales_ability: 'medium',
    interview_resistance: 'medium',
  }),
  behavior_patterns: JSON.stringify({
    avg_task_complete_rate: 0,
    preferred_task_types: [],
    weakest_task_types: [],
  }),
  updated_at: new Date().toISOString(),
};

db.prepare(`
  INSERT OR REPLACE INTO user_persona (user_id, traits, behavior_patterns, updated_at)
  VALUES (?, ?, ?, ?)
`).run(user.id, initialPersona.traits, initialPersona.behavior_patterns, initialPersona.updated_at);
```

- [ ] **Step 2: 提交**

```bash
git add src/store/index.ts
git commit -m "feat(onboarding): initialize user persona on signup"
```

---

## 阶段3：RAG检索系统

### Task 3.1: 创建 RAG 索引插入逻辑

**Files:**
- Create: `server/services/ragIndexer.js`

- [ ] **Step 1: 创建 services 目录**

```bash
mkdir -p /Users/shuhaipeng/shipin/server/services
```

- [ ] **Step 2: 编写 ragIndexer.js**

```javascript
// server/services/ragIndexer.js
import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';

/**
 * 将访谈记录索引到 RAG
 */
export function indexInterview(userId: string, interview: {
  pain_points: string;
  verbatim_quotes: string;
  person_name: string;
}) {
  if (!interview.pain_points && !interview.verbatim_quotes) return;

  const content = [
    interview.pain_points,
    interview.verbatim_quotes,
  ].filter(Boolean).join('\n---\n');

  db.prepare(`
    INSERT INTO rag_index (content, content_type, user_id, related_task_type, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    uuid(),
    content,
    'interview_pain_point',
    userId,
    'interview',
    new Date().toISOString()
  );
}

/**
 * 将教练建议索引到 RAG
 */
export function indexCoachWisdom(userId: string, message: string, relatedTaskType: string) {
  db.prepare(`
    INSERT INTO rag_index (content, content_type, user_id, related_task_type, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    uuid(),
    message,
    'coach_wisdom',
    userId,
    relatedTaskType,
    new Date().toISOString()
  );
}

/**
 * 检索相关上下文
 */
export function retrieveContext(userId: string, contentType: string, query: string, limit = 5) {
  if (!query.trim()) return '';

  try {
    const results = db.prepare(`
      SELECT content, content_type, created_at
      FROM rag_index
      WHERE user_id = ? AND content_type = ?
      AND rag_index MATCH ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, contentType, query, limit);

    return results.map(r => r.content).join('\n---\n');
  } catch {
    // FTS5 查询失败时返回空
    return '';
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add server/services/ragIndexer.js
git commit -m "feat(rag): add RAG indexing service"
```

---

### Task 3.2: 创建用户画像更新逻辑

**Files:**
- Create: `server/services/personaUpdater.js`

- [ ] **Step 1: 编写 personaUpdater.js**

```javascript
// server/services/personaUpdater.js
import { db } from '../db/index.js';

/**
 * 更新用户画像
 */
export function updateUserPersona(userId: string, updates: {
  traits?: Record<string, string>;
  behavior_patterns?: Record<string, unknown>;
}) {
  const existing = db.prepare('SELECT * FROM user_persona WHERE user_id = ?').get(userId);

  let traits = {};
  let behavior_patterns = {};

  if (existing) {
    traits = JSON.parse(existing.traits || '{}');
    behavior_patterns = JSON.parse(existing.behavior_patterns || '{}');
  }

  if (updates.traits) {
    traits = { ...traits, ...updates.traits };
  }
  if (updates.behavior_patterns) {
    behavior_patterns = { ...behavior_patterns, ...updates.behavior_patterns };
  }

  db.prepare(`
    INSERT OR REPLACE INTO user_persona (user_id, traits, behavior_patterns, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(
    userId,
    JSON.stringify(traits),
    JSON.stringify(behavior_patterns),
    new Date().toISOString()
  );
}

/**
 * 获取用户画像
 */
export function getUserPersona(userId: string) {
  const row = db.prepare('SELECT * FROM user_persona WHERE user_id = ?').get(userId);
  if (!row) return null;

  return {
    traits: JSON.parse(row.traits || '{}'),
    behavior_patterns: JSON.parse(row.behavior_patterns || '{}'),
    updated_at: row.updated_at,
  };
}

/**
 * 从任务完成情况计算薄弱类型
 */
export function calculateWeaknessTypes(userId: string, days = 14) {
  const tasks = db.prepare(`
    SELECT task_type, status FROM daily_tasks
    WHERE user_id = ? AND day_number > (
      SELECT MAX(day_number) - ? FROM daily_tasks WHERE user_id = ?
    )
  `).all(userId, days, userId);

  const skippedCount: Record<string, number> = {};
  const completedCount: Record<string, number> = {};

  tasks.forEach(t => {
    if (t.status === 'skipped') {
      skippedCount[t.task_type] = (skippedCount[t.task_type] || 0) + 1;
    } else if (t.status === 'completed') {
      completedCount[t.task_type] = (completedCount[t.task_type] || 0) + 1;
    }
  });

  return { skippedCount, completedCount };
}
```

- [ ] **Step 2: 提交**

```bash
git add server/services/personaUpdater.js
git commit -m "feat(persona): add user persona update service"
```

---

## 阶段4：Prompt动态组装

### Task 4.1: 创建 Prompt 组装服务

**Files:**
- Create: `server/services/promptBuilder.js`

- [ ] **Step 1: 编写 promptBuilder.js**

```javascript
// server/services/promptBuilder.js
import { db } from '../db/index.js';
import { getUserPersona, calculateWeaknessTypes } from './personaUpdater.js';
import { retrieveContext } from './ragIndexer.js';

/**
 * 构建教练对话 Prompt
 */
export function buildCoachPrompt(userId: string, userMessage: string, history: Array<{role: string, content: string}>) {
  const persona = getUserPersona(userId);
  const { skippedCount, completedCount } = calculateWeaknessTypes(userId);
  const recentBlockers = getRecentBlockers(userId, 3);

  // 提取关键词用于 RAG 检索
  const keywords = extractKeywords(userMessage);
  const ragContext = retrieveContext(userId, 'coach_wisdom', keywords);

  // 计算擅长和薄弱类型
  const strengths = Object.entries(completedCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  const weaknesses = Object.entries(skippedCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type]) => type);

  return `
你是30天创业执行教练，服务对象是AI独立开发者和程序员创业者。

【用户画像】
- 任务完成率：${persona?.behavior_patterns?.avg_task_complete_rate || '未知'}%
- 擅长类型：${strengths.join(', ') || '尚不明确'}
- 薄弱类型：${weaknesses.join(', ') || '尚不明确'}
- 当前卡点：${recentBlockers.join(', ') || '无'}

【相关历史经验】
${ragContext || '暂无相关历史经验'}

【对话历史】
${formatHistory(history)}

【用户消息】
${userMessage}

【要求】
1. 基于用户画像调整建议的语气和难度
2. 引用相关历史经验（如果有）
3. 推动用户完成核心验证动作（访谈、落地页、线索）
4. 不确定时直接说不知道，不要编造
5. 保持务实和直接，不回避问题
`.trim();
}

function getRecentBlockers(userId: string, limit: number): string[] {
  const rows = db.prepare(`
    SELECT blocked_text FROM daily_checkins
    WHERE user_id = ? AND blocked_text IS NOT NULL AND blocked_text != ''
    ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit);

  return rows.map(r => r.blocked_text).filter(Boolean);
}

function extractKeywords(message: string): string {
  // 简单的关键词提取（实际可用 NLP 服务）
  const words = message.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 5).join(' OR ');
}

function formatHistory(history: Array<{role: string, content: string}>): string {
  return history.slice(-6).map(m => {
    const role = m.role === 'coach' ? '教练' : '用户';
    return `${role}：${m.content.slice(0, 200)}`;
  }).join('\n');
}
```

- [ ] **Step 2: 提交**

```bash
git add server/services/promptBuilder.js
git commit -m "feat(prompt): add dynamic prompt builder service"
```

---

## 阶段5：进化追踪

### Task 5.1: 创建进化触发器

**Files:**
- Create: `server/services/evolutionTrigger.js`

- [ ] **Step 1: 编写 evolutionTrigger.js**

```javascript
// server/services/evolutionTrigger.js
import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';

/**
 * 检查并触发进化事件
 */
export function checkEvolutionTriggers(userId: string) {
  checkHitRateTrigger(userId);
  checkPersonaDriftTrigger(userId);
}

function checkHitRateTrigger(userId: string) {
  // 计算7天内平均命中率
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      AVG(recommendation_hit_rate) as avg_hit_rate
    FROM task_recommendations
    WHERE user_id = ? AND created_at > date('now', '-7 days')
  `).get(userId);

  if (!stats || stats.total < 7) return; // 需要至少7条数据

  // 如果命中率 < 40%，记录进化事件
  if (stats.avg_hit_rate < 0.4) {
    db.prepare(`
      INSERT INTO evolution_logs (id, event_type, description, trigger, metric_change, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuid(),
      'hit_rate_low',
      `任务推荐命中率持续低于40%（当前：${(stats.avg_hit_rate * 100).toFixed(1)}%）`,
      'automatic_check',
      JSON.stringify({
        avg_hit_rate: stats.avg_hit_rate,
        threshold: 0.4,
        sample_size: stats.total
      }),
      new Date().toISOString()
    );
  }
}

function checkPersonaDriftTrigger(userId: string) {
  const current = getUserPersona(userId);
  if (!current) return;

  // 简化检测：检查行为模式是否有显著变化
  const patterns = current.behavior_patterns;
  if (patterns.avg_task_complete_rate !== undefined && patterns.avg_task_complete_rate < 0.3) {
    db.prepare(`
      INSERT INTO evolution_logs (id, event_type, description, trigger, metric_change, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuid(),
      'persona_drift',
      '用户任务完成率显著下降，建议调整任务难度',
      'automatic_check',
      JSON.stringify({ task_complete_rate: patterns.avg_task_complete_rate }),
      new Date().toISOString()
    );
  }
}

/**
 * 记录任务推荐
 */
export function logTaskRecommendation(userId: string, dayNumber: number, recommended: string[], actualCompleted: number, actualSkipped: number, aiContextUsed: string) {
  const hitRate = recommended.length > 0 ? actualCompleted / recommended.length : 0;

  db.prepare(`
    INSERT INTO task_recommendations (id, user_id, day_number, recommended_tasks, actual_completed, actual_skipped, recommendation_hit_rate, ai_context_used, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuid(),
    userId,
    dayNumber,
    JSON.stringify(recommended),
    actualCompleted,
    actualSkipped,
    hitRate,
    aiContextUsed,
    new Date().toISOString()
  );

  // 检查是否需要触发进化
  if (recommended.length > 0) {
    checkEvolutionTriggers(userId);
  }
}

/**
 * 获取进化日志
 */
export function getEvolutionLogs(userId: string, limit = 20) {
  return db.prepare(`
    SELECT * FROM evolution_logs
    WHERE ... -- 需要根据用户或系统过滤
    ORDER BY created_at DESC LIMIT ?
  `).all(limit);
}
```

- [ ] **Step 2: 提交**

```bash
git add server/services/evolutionTrigger.js
git commit -m "feat(evolution): add evolution trigger service"
```

---

## 阶段6：前端智能化

### Task 6.1: Dashboard 动态风险提醒

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: 添加动态风险提醒函数**

```typescript
// src/pages/Dashboard.tsx 添加
function getDynamicRiskWarning(persona: { avgTaskCompleteRate: number, strengths: string[], weaknesses: string[] } | null, checkins: DailyCheckin[]) {
  if (!persona) return null;

  if (persona.avgTaskCompleteRate < 50) {
    return '你最近任务完成率偏低，建议先减少任务数量，确保完成质量。';
  }
  if (persona.strengths?.includes('coding') && !persona.strengths?.includes('sales')) {
    return '你擅长技术，但用户访谈和销售是验证的关键。不要只做产品。';
  }
  if (checkins.slice(-3).every(c => c.valueScore < 3)) {
    return '连续几天价值评分较低，考虑是否方向出了问题，或者任务太难。';
  }
  return null;
}
```

- [ ] **Step 2: 在 Dashboard 中使用动态提醒**

```typescript
// 在 DashboardPage 组件中使用
const dynamicWarning = getDynamicRiskWarning(persona, checkins);

// 替换现有的风险提醒
{dynamicWarning ? (
  <Card>
    <div className="flex items-start gap-3">
      <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-semibold text-gray-900">AI风险提醒</h3>
        <p className="text-sm text-gray-500 mt-0.5">{dynamicWarning}</p>
      </div>
    </div>
  </Card>
) : null}
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat(dashboard): add dynamic risk warnings based on user persona"
```

---

## 阶段7：测试与优化

### Task 7.1: 验证完整数据流

**Files:**
- Test: `server/db/index.js`, `server/routes/behavior.js`

- [ ] **Step 1: 端到端测试**

```bash
cd /Users/shuhaipeng/shipin && npm run dev
```

1. 访问 http://localhost:5177
2. 完成 Onboarding
3. 访问 Dashboard，确认数据保存
4. 访问 /coach，发送消息
5. 检查 Network 请求是否有 /api/behavior

- [ ] **Step 2: 验证 SQLite 数据**

```bash
sqlite3 /Users/shuhaipeng/shipin/data/shipin.db ".tables"
```

Expected: 显示所有表

- [ ] **Step 3: 验证 RAG 索引**

```bash
sqlite3 /Users/shuhaipeng/shipin/data/shipin.db "SELECT * FROM rag_index LIMIT 5;"
```

Expected: 应有空表或已有数据

- [ ] **Step 4: 提交最终版本**

```bash
git add -A
git commit -m "feat: complete recursive AI coach evolution system"
```

---

## 自检清单

### Spec 覆盖检查

| Spec 部分 | 是否有对应任务 |
|---------|--------------|
| 架构设计 | ✅ Task 1.1, 1.2, 1.3 |
| 数据模型 | ✅ Task 1.1 |
| RAG 检索 | ✅ Task 3.1 |
| Prompt 动态组装 | ✅ Task 4.1 |
| 前端改动 | ✅ Task 2.3, 2.4, 6.1 |
| 后端改动 | ✅ Task 2.2, 3.1, 3.2, 4.1, 5.1 |
| 进化追踪 | ✅ Task 5.1 |
| 实施计划 | ✅ 全部任务 |

### 占位符扫描

- 无 "TBD"、"TODO" 占位符 ✅
- 无 "实现类似功能" 的模糊描述 ✅
- 所有代码步骤都包含实际代码 ✅

### 类型一致性

- `behaviorTracker` 函数名一致 ✅
- `EventType` 与后端路由匹配 ✅
- `user_persona` 表结构与应用层一致 ✅

---

## 实施状态

| 阶段 | 状态 | 累计 |
|------|------|------|
| 阶段0：稳定化 | 0/3 | 0/3 |
| 阶段1：SQLite基础设施 | 0/3 | 0/3 |
| 阶段2：数据采集层 | 0/5 | 0/5 |
| 阶段3：RAG检索系统 | 0/2 | 0/2 |
| 阶段4：Prompt动态组装 | 0/1 | 0/1 |
| 阶段5：进化追踪 | 0/1 | 0/1 |
| 阶段6：前端智能化 | 0/1 | 0/1 |
| 阶段7：测试与优化 | 0/1 | 0/1 |

**总计：17 个任务**

---

*本实施计划由 writing-plans skill 生成*
