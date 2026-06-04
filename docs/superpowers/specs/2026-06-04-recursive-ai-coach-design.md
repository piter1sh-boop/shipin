# 递归自进化AI创业教练系统 - 设计文档

版本：v0.1  
日期：2026-06-04  
作者：shuhaipeng  
状态：已批准，等待实施

## 1. 背景与目标

### 1.1 项目起源

现有项目 [shipin](../..) 是一个「30天AI创业执行教练」Web App，帮助AI独立开发者完成创业验证。当前系统：
- 已完成10个页面（Dashboard、Today、Plan、Interviews、Leads、Coach、Review等）
- 使用LocalStorage存储数据
- AI通过固定Prompt提供建议
- 无真正的自我进化能力

### 1.2 新增目标

在现有基础上，增加递归自进化能力：

> AI帮助用户获得巨大价值 → 用户行为数据反馈到系统 → AI不断进化 → 更精准地帮助用户 → 形成递归迭代循环

核心指标：**30天后，AI的任务推荐准确率相比初始版本有可衡量的提升**

### 1.3 成功标准

- **进化标准**：任务推荐命中率（AI推荐的任务 / 用户实际完成的任务）相比初始版本提升
- **MVP标准**（同步验证）：5个测试用户中至少3人完成核心验证动作

---

## 2. 技术方案选择

### 2.1 方案选择

**选择方案A（轻量迭代方案）**

| 选择项 | 决策 |
|--------|------|
| 进化方向 | C（个性化适应 + 全局进化） |
| 进化手段 | D（Prompt工程 + RAG混合） |
| 数据反馈 | C（核心验证 + 交互行为 + 用户体验数据） |
| 优先场景 | A（智能任务推荐）+ B（智能教练对话） |
| 时间范围 | C（30天密集验证 → 长期陪跑） |
| 成功标准 | B（进化标准） |
| 开发方式 | A（纯AI开发者） |
| 数据存储 | B（SQLite嵌入式） |
| 方案选择 | A（轻量迭代） |

### 2.2 方案A核心架构

```
┌─────────────────────────────────────────────────────┐
│                    用户界面 (React)                  │
│    Dashboard / Today / Coach / Interviews / Leads    │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│           Express API 服务（保持现有）                │
│    /api/onboarding  /api/coach  /api/daily-task     │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│         Node.js SQLite 接入层（新增加）               │
│      - 数据存储与查询                                │
│      - Prompt 动态组装                               │
│      - 用户行为追踪                                  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              SQLite 数据库文件                       │
│      - 用户行为表（JSON）                           │
│      - RAG 索引（FTS5）                             │
│      - 进化日志                                      │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              MiniMax API（保持不变）                  │
└─────────────────────────────────────────────────────┘
```

---

## 3. 数据模型

### 3.1 基础表（从LocalStorage迁移）

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE startup_profiles (
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

CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  title TEXT,
  start_date TEXT,
  end_date TEXT,
  status TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE daily_tasks (
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

CREATE TABLE daily_checkins (
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

CREATE TABLE interviews (
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

CREATE TABLE leads (
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

CREATE TABLE coach_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  role TEXT,
  content TEXT,
  context_snapshot TEXT,
  created_at TEXT
);

CREATE TABLE weekly_reviews (
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
```

### 3.2 进化相关表（新增）

```sql
-- 行为日志（采集用户交互数据）
CREATE TABLE behavior_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  event_type TEXT NOT NULL,        -- 'page_view' | 'task_complete' | 'task_skip' | 'coach_message' | 'interview_add'
  event_data TEXT,                -- JSON: {page, duration, task_id, ...}
  session_id TEXT,
  created_at TEXT
);

-- 任务推荐记录（追踪AI推荐的命中情况）
CREATE TABLE task_recommendations (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  day_number INTEGER,
  recommended_tasks TEXT,         -- JSON array of recommended tasks
  actual_completed INTEGER,       -- 实际完成数
  actual_skipped INTEGER,         -- 实际跳过的
  recommendation_hit_rate REAL,  -- 命中率 = completed / recommended
  ai_context_used TEXT,           -- 构造推荐时用的上下文摘要
  created_at TEXT
);

-- RAG知识库索引（用户访谈+痛点）
CREATE VIRTUAL TABLE rag_index USING fts5(
  content TEXT,                   -- 原文（访谈痛点、教练建议）
  content_type TEXT,              -- 'interview_pain_point' | 'coach_wisdom'
  user_id TEXT,
  related_task_type TEXT,         -- 关联的任务类型
  created_at TEXT
);

-- 用户个性化上下文（动态更新）
CREATE TABLE user_persona (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  traits TEXT,                    -- JSON: {interview_resistance, sales_skill, tech_ability...}
  behavior_patterns TEXT,         -- JSON: {avg_task_complete_rate, preferred_task_types...}
  updated_at TEXT
);

-- 进化日志（追踪AI能力变化）
CREATE TABLE evolution_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT,               -- 'prompt_update' | 'rag_updated' | 'threshold_adjusted'
  description TEXT,
  trigger TEXT,                  -- 什么触发了这次变化
  metric_change TEXT,            -- JSON: {hit_rate_before, hit_rate_after}
  created_at TEXT
);
```

### 3.3 索引

```sql
CREATE INDEX idx_behavior_logs_user ON behavior_logs(user_id, created_at);
CREATE INDEX idx_behavior_logs_type ON behavior_logs(event_type, created_at);
CREATE INDEX idx_task_recommendations_user ON task_recommendations(user_id, day_number);
CREATE INDEX idx_rag_index_user ON rag_index(user_id, content_type);
CREATE INDEX idx_interviews_user ON interviews(user_id, created_at);
CREATE INDEX idx_leads_user ON leads(user_id, status);
```

---

## 4. RAG检索系统

### 4.1 FTS5 全文检索

SQLite FTS5提供本地全文检索能力，适合轻量方案。

**索引内容示例**：
```sql
INSERT INTO rag_index (content, content_type, user_id, related_task_type, created_at)
VALUES 
  ('用户张总反馈：现在用ChatGPT辅助编程，但上下文丢失问题严重',
   'interview_pain_point', 'user_123', 'interview', '2026-06-04'),
  ('教练建议：对于技术背景用户，先展示demo再谈价格转化率高40%',
   'coach_wisdom', 'system', 'sales', '2026-06-01');
```

### 4.2 检索流程

```typescript
async function retrieveContext(userId: string, taskType: string, query: string) {
  const results = await db.prepare(`
    SELECT content, content_type, created_at
    FROM rag_index
    WHERE user_id = ? AND content_type = ?
    AND rag_index MATCH ?
    ORDER BY created_at DESC
    LIMIT 5
  `).all(userId, `${taskType}_pain_point`, query);

  return results.map(r => r.content).join('\n---\n');
}
```

---

## 5. Prompt动态组装

### 5.1 教练Prompt模板

```typescript
function buildCoachPrompt(userId: string, userMessage: string, history: any[]) {
  const persona = getUserPersona(userId);
  const ragContext = await retrieveContext(userId, 'general', extractKeywords(userMessage));
  const recentBlockers = getRecentBlockers(userId, 3);

  return `
你是30天创业执行教练。

用户画像：
- 任务完成率：${persona.avgTaskCompleteRate}%
- 擅长类型：${persona.strengths.join(', ')}
- 薄弱类型：${persona.weaknesses.join(', ')}
- 当前卡点：${recentBlockers.join(', ') || '无'}

相关历史经验：
${ragContext}

对话历史：
${formatHistory(history)}

用户消息：${userMessage}

要求：
1. 基于用户画像调整建议的语气和难度
2. 引用相关历史经验（如果有）
3. 推动用户完成核心验证动作
4. 不确定时直接说不知道，不要编造
`;
}
```

### 5.2 任务推荐Prompt

```typescript
async function recommendDailyTasks(userId: string, dayNumber: number) {
  const persona = getUserPersona(userId);
  const weaknessTypes = getWeaknessTypes(userId);

  let taskTypes = ['interview'];
  if (getInterviewCount(userId) >= 10) taskTypes.push('sales');
  if (getInterviewCount(userId) >= 5) taskTypes.push('landing_page');
  
  Object.entries(weaknessTypes).forEach(([type, count]) => {
    if (count >= 2) taskTypes.unshift(type);
  });

  return {
    mainTask: generateTask(taskTypes[0]),
    secondaryTasks: taskTypes.slice(1, 3).map(t => generateTask(t)),
    adjustmentNote: `因为你最近${Object.keys(weaknessTypes)[0]}较弱，今天重点突破`
  };
}
```

---

## 6. 前端改动

### 6.1 行为采集点

| 页面 | 采集事件 |
|------|---------|
| Dashboard | `page_view`, `stay_duration` |
| Today | `task_complete`, `task_skip` |
| Coach | `coach_message` |
| Interviews | `interview_add` |
| Leads | `lead_add` |
| Check-in | `checkin_submit` |

### 6.2 Hooks

```typescript
// 页面停留追踪
export function usePageTracking(pageName: string) {
  const startTime = useRef(Date.now());
  
  useEffect(() => {
    track({ type: 'page_view', data: { page: pageName }, ... });
    return () => {
      const duration = Date.now() - startTime.current;
      track({ type: 'stay_duration', data: { page: pageName, duration }, ... });
    };
  }, [pageName]);
}

// 任务追踪
export function useTaskTracking(taskId: string, action: 'complete' | 'skip') {
  useEffect(() => {
    track({ type: action === 'complete' ? 'task_complete' : 'task_skip', data: { taskId }, ... });
  }, [taskId, action]);
}
```

### 6.3 动态风险提醒

```typescript
function getDynamicRiskWarning(persona: UserPersona, checkins: DailyCheckin[]) {
  if (persona.avgTaskCompleteRate < 50) {
    return '你最近任务完成率偏低，建议先减少任务数量，确保完成质量。';
  }
  if (persona.strengths.includes('coding') && !persona.strengths.includes('sales')) {
    return '你擅长技术，但用户访谈和销售是验证的关键。不要只做产品。';
  }
  if (checkins.slice(-3).every(c => c.valueScore < 3)) {
    return '连续几天价值评分较低，考虑是否方向出了问题，或者任务太难。';
  }
  return null;
}
```

---

## 7. 后端改动

### 7.1 新增API路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/behavior` | POST | 采集行为数据 |
| `/api/user-context/:userId` | GET | 获取用户上下文 |
| `/api/evolution-logs` | GET | 获取进化日志 |

### 7.2 进化触发器

```typescript
function checkHitRateTrigger(userId: string) {
  const stats = db.prepare(`
    SELECT AVG(recommendation_hit_rate) as rate FROM task_recommendations
    WHERE user_id = ? AND created_at > date('now', '-7 days')
  `).get(userId);
  
  if (stats && stats.rate < 0.4) {
    db.prepare(`INSERT INTO evolution_logs ...`).run(...);
  }
}

function checkPersonaDriftTrigger(userId: string) {
  const drift = calculateDrift(getUserPersona(userId), getHistoricalPersona(userId, 14));
  if (drift > 0.3) {
    db.prepare(`INSERT INTO evolution_logs ...`).run(...);
  }
}
```

---

## 8. 实施计划

### 阶段划分

| 阶段 | 内容 | 时间 | 累计 |
|------|------|------|------|
| 阶段0 | 现有系统稳定化 | 1天 | 1天 |
| 阶段1 | SQLite基础设施 | 2天 | 3天 |
| 阶段2 | 数据采集层 | 2天 | 5天 |
| 阶段3 | RAG检索系统 | 2天 | 7天 |
| 阶段4 | Prompt动态组装 | 2天 | 9天 |
| 阶段5 | 进化追踪 | 2天 | 11天 |
| 阶段6 | 前端智能化 | 2天 | 13天 |
| 阶段7 | 测试与优化 | 2天 | 15天 |

### 阶段0：稳定化

- 添加 `better-sqlite3` 依赖
- 创建 `data` 目录
- 验证现有功能

### 阶段1：SQLite基础设施

- 创建 `server/db/index.js`
- 迁移 LocalStorage → SQLite
- 创建进化相关表
- 添加索引

### 阶段2：数据采集层

- 创建 `src/lib/behaviorTracker.ts`
- 创建 `/api/behavior` 路由
- 创建 `usePageTracking`, `useTaskTracking` Hooks
- 在各页面注入Hook
- 初始化user_persona

### 阶段3：RAG检索系统

- 创建RAG索引插入逻辑
- 实现FTS5检索函数
- 创建用户画像更新逻辑

### 阶段4：Prompt动态组装

- 创建 `promptBuilder.js`
- 重构 `/api/coach` 路由
- 重构 `/api/daily-task` 路由
- 创建个性化Prompt模板

### 阶段5：进化追踪

- 创建进化触发器服务
- 实现命中率计算
- 实现用户画像漂移检测
- 创建进化日志查看

### 阶段6：前端智能化

- Dashboard风险提醒增强
- 今日任务个性化排序
- Coach对话上下文注入
- 进化状态可视化

### 阶段7：测试与优化

- 单元测试
- 集成测试
- 性能测试
- Prompt调优

**总工期：约15个工作日**

---

## 9. 文件结构

```
shipin/
├── server/
│   ├── index.js              # 保持不变
│   ├── db/
│   │   └── index.js          # 🆕 SQLite初始化
│   ├── routes/
│   │   ├── ai.js             # 保持不变
│   │   └── behavior.js       # 🆕 行为数据路由
│   └── services/
│       ├── minimax.js        # 保持不变
│       ├── promptBuilder.js  # 🆕 Prompt动态组装
│       └── evolutionTrigger.js # 🆕 进化触发器
├── src/
│   ├── lib/
│   │   ├── storage.ts        # 保持不变
│   │   ├── aiService.ts      # 改动：接入动态Prompt
│   │   └── behaviorTracker.ts # 🆕 行为采集
│   ├── hooks/
│   │   └── useBehaviorTracking.ts # 🆕 Hooks
│   ├── pages/
│   │   └── [各页面]          # 接入行为追踪
│   └── store/
│       └── index.ts          # 改动：接入SQLite
├── data/
│   └── shipin.db            # 🆕 SQLite数据库文件
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-04-recursive-ai-coach-design.md # 本文档
```

---

## 10. 依赖清单

```json
{
  "dependencies": {
    "better-sqlite3": "^11.x"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.x"
  }
}
```

---

## 11. 下一步

1. 用户审阅本设计文档
2. 批准后进入实施阶段
3. 调用 `writing-plans` 技能创建详细实施计划

---

*本设计文档由 brainstorming skill 生成，已通过 spec self-review 检查*
