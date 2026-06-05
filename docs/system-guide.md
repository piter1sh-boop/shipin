# 30天AI创业教练系统 - 系统说明

## 1. 系统简介

这是一个**递归自进化AI创业教练系统**，帮助用户在30天内完成创业核心验证动作（定位访谈、落地页、MVP、销售线索）。

核心闭环：**用户行为 -> 数据收集 -> persona更新 -> AI理解 -> 个性化建议 -> 用户行为**

### 解决的问题
- 独立开发者缺乏创业执行框架和纪律
- 无法判断产品假设是否成立
- 难以坚持完成核心验证动作
- AI教练无法适应用户特点，给出个性化建议

### 核心特性
- **动态Prompt**: AI教练根据用户画像+RAG上下文+历史对话生成回复
- **FTS5 RAG**: 访谈和教练回复被索引，支持语义搜索
- **用户画像**: 跟踪行为模式（任务完成率、薄弱环节）
- **自进化**: `hit_rate_low` + `persona_drift` 触发进化日志

---

## 2. 技术架构

### 技术栈
| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind + Zustand |
| 后端 | Express + better-sqlite3 + FTS5 |
| AI | MiniMax API (chat + embedding) |
| 数据库 | SQLite (`data/shipin.db`) |

### 架构图
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React    │────▶│  Express   │────▶│   SQLite    │
│  (Zustand) │◀────│   Server   │◀────│  (FTS5 RAG) │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  MiniMax    │
                    │     AI      │
                    └─────────────┘
```

### 环境变量 (.env)
```bash
MINIMAX_API_KEY=your_api_key
MINIMAX_BASE_URL=https://api.minimax.chat/v1
MINIMAX_MODEL=MiniMax-M2.7
PORT=3001
```

---

## 3. 数据模型

### 14张核心表

| 表名 | 说明 |
|------|------|
| `users` | 用户基本信息 |
| `startup_profiles` | 创业想法分析结果 |
| `plans` | 30天执行计划 |
| `daily_tasks` | 每日任务清单 |
| `daily_checkins` | 每日签到/复盘 |
| `interviews` | 用户访谈记录 |
| `leads` | 销售线索 |
| `coach_messages` | AI教练对话历史 |
| `weekly_reviews` | 周复盘 |
| `user_persona` | 用户画像 |
| `behavior_logs` | 行为日志 |
| `task_recommendations` | 任务推荐日志（含命中率） |
| `evolution_logs` | 系统进化触发日志 |
| `rag_index` (FTS5) | RAG知识库索引 |

### 关键关系
```
users (1) ──┬── (N) startup_profiles
           ├── (N) plans
           ├── (N) daily_tasks
           ├── (N) daily_checkins
           ├── (N) interviews
           ├── (N) leads
           ├── (N) coach_messages
           ├── (N) weekly_reviews
           ├── (N) behavior_logs
           ├── (N) task_recommendations
           ├── (N) evolution_logs
           └── (1) user_persona
```

### user_persona 结构
```json
{
  "traits": {
    "tech_ability": "medium",
    "sales_ability": "medium",
    "interview_resistance": "medium"
  },
  "behavior_patterns": {
    "avg_task_complete_rate": 0.75,
    "preferred_task_types": ["interview", "landing_page"],
    "weakest_task_types": ["sales"]
  }
}
```

---

## 4. API 文档

### AI 核心接口

#### POST /api/onboarding
分析创业想法，生成AI摘要和风险判断。

**请求体:**
```json
{
  "productIdea": "AI代码审查工具",
  "targetUser": "中小团队CTO",
  "problemStatement": "代码审查耗时且反馈慢",
  "currentStage": "想法阶段",
  "dailyTimeBudget": "2小时",
  "mainBlocker": "不知道从何验证",
  "desiredOutcome": "获得10个付费用户"
}
```

**响应:**
```json
{
  "oneLiner": "一句话产品假设",
  "targetUserHypothesis": "目标用户假设",
  "riskJudgment": "low|medium|high",
  "firstWeekGoal": "第一周目标",
  "firstTask": { "title": "", "description": "", "taskType": "interview", "priority": 1 }
}
```

---

#### POST /api/plan
生成30天执行计划（第1-7天定位访谈，第8-14天落地页MVP，第15-21天测试线索，第22-30天复盘）。

**请求体:**
```json
{ "productIdea": "AI代码审查工具" }
```

**响应:** `DailyTask[]` 数组，共30条任务。

---

#### POST /api/coach
AI教练对话（动态Prompt + RAG上下文）。

**请求体:**
```json
{
  "message": "我不知道如何开始访谈",
  "history": [{ "role": "user|coach", "content": "..." }]
}
```

**响应:**
```json
{ "reply": "教练回复内容" }
```

**动态Prompt构建逻辑:**
1. 获取用户画像（任务完成率、擅长/薄弱环节）
2. 获取最近卡点（从daily_checkins）
3. 关键词提取 + RAG检索历史教练智慧
4. 组装完整Prompt

---

#### POST /api/review/weekly
生成周复盘。

**请求体:**
```json
{
  "weekData": {
    "completedTasks": 5,
    "interviewCount": 3,
    "leadCount": 1,
    "risks": "定位未经验证"
  }
}
```

---

### 行为数据接口

#### POST /api/behavior
收集行为数据到 `behavior_logs`。

```json
{ "type": "task_complete", "data": {...}, "session_id": "uuid" }
```

---

#### POST /api/update-persona
更新用户画像。

```json
{
  "userId": "uuid",
  "traits": { "tech_ability": "high" },
  "behavior_patterns": { "avg_task_complete_rate": 0.8 }
}
```

---

#### POST /api/index-interview
将访谈内容索引到RAG知识库。

```json
{
  "userId": "uuid",
  "interview": {
    "pain_points": "代码审查反馈慢",
    "verbatim_quotes": "我们希望2小时内拿到反馈"
  }
}
```

---

#### POST /api/daily-task
生成个性化每日任务推荐。

```json
{
  "userId": "uuid",
  "dayNumber": 3,
  "interviewCount": 2,
  "leadCount": 0
}
```

---

#### GET /api/user-context/:userId
获取用户上下文（画像+最近卡点+命中率）。

---

### 管理接口

#### GET /api/admin/users
获取所有用户及统计数据（任务完成率、访谈数、线索数）。

#### GET /api/admin/evolution-logs
获取进化日志（最近50条）。

---

## 5. 核心流程

### 流程一：Onboarding -> Dashboard
```
用户提交创业想法
    ↓
POST /api/onboarding (AI分析)
    ↓
POST /api/plan (生成30天计划)
    ↓
前端跳转 Dashboard
```

### 流程二：Today页面 -> 任务执行
```
用户查看今日任务 (getTodayTasks)
    ↓
完成任务 / 跳过任务
    ↓
completeTask/skipTask (更新本地+POST /api/update-persona)
    ↓
更新 user_persona.behavior_patterns
```

### 流程三：Coach对话 -> RAG索引
```
用户发送消息
    ↓
buildCoachPrompt (画像+RAG+历史)
    ↓
POST /api/coach (AI回复)
    ↓
indexCoachWisdom (RAG索引)
    ↓
用户看到回复
```

### 流程四：添加访谈 -> RAG索引
```
用户添加访谈记录
    ↓
addInterview (本地存储+POST /api/index-interview)
    ↓
indexInterview (RAG索引pain_points和verbatim_quotes)
    ↓
后续Coach对话时可检索
```

### 流程五：每日任务推荐 -> 进化触发
```
POST /api/daily-task (AI推荐任务)
    ↓
logTaskRecommendation (记录推荐+实际完成)
    ↓
checkHitRateTrigger (命中率<40% -> evolution_logs)
    ↓
checkPersonaDriftTrigger (完成率<30% -> evolution_logs)
```

---

## 6. 开发指南

### 启动开发服务器
```bash
# 同时启动前端 + 后端
npm run dev

# 仅后端
npm run dev:server

# 仅前端
npm run dev:client
```

前端: http://localhost:5177
后端: http://localhost:3001

### 数据库
```bash
# 查看数据库文件
ls -la data/shipin.db

# SQLite交互
sqlite3 data/shipin.db ".tables"
sqlite3 data/shipin.db "SELECT * FROM users LIMIT 5;"
```

### 测试
```bash
npm test          # 运行所有测试
npm run build    # 构建生产版本
```

### 目录结构
```
shipin/
├── server/
│   ├── index.js              # Express入口，CORS配置，路由挂载
│   ├── db/index.js           # SQLite初始化，14张表创建，索引创建
│   ├── migrate-from-storage.js # LocalStorage -> SQLite迁移
│   ├── routes/
│   │   ├── ai.js             # onboarding/plan/coach/review路由
│   │   └── behavior.js       # 行为收集/persona/管理接口
│   └── services/
│       ├── minimax.js        # MiniMax API调用 (chat/chatJson)
│       ├── promptBuilder.js  # 动态Prompt构建 (buildCoachPrompt)
│       ├── ragIndexer.js     # FTS5索引 (indexInterview/indexCoachWisdom/retrieveContext)
│       ├── personaUpdater.js # 画像更新 (updateUserPersona/getUserPersona/calculateWeaknessTypes)
│       └── evolutionTrigger.js # 进化触发检查 (logTaskRecommendation/checkEvolutionTriggers)
├── src/
│   ├── store/index.ts        # Zustand store，所有业务状态和actions
│   ├── lib/
│   │   ├── aiService.ts      # 前端AI服务代理 (analyzeOnboarding/generate30DayPlan/coachReply)
│   │   ├── storage.ts        # LocalStorage封装
│   │   └── behaviorTracker.ts # 行为追踪
│   └── pages/
│       ├── Landing.tsx       # 落地页
│       ├── Onboarding.tsx    # 创业想法提交页
│       ├── Dashboard.tsx     # 总览仪表盘
│       ├── Today.tsx         # 今日任务
│       ├── Plan.tsx          # 30天计划查看
│       ├── Interviews.tsx    # 访谈管理
│       ├── Leads.tsx         # 线索管理
│       ├── Coach.tsx         # AI教练对话
│       ├── Review.tsx        # 周复盘
│       └── Admin.tsx         # 管理面板
├── data/shipin.db            # SQLite数据库文件
└── tests/
    ├── api.test.ts           # API测试
    └── flows.test.ts        # 流程测试
```

### 关键文件说明

| 文件 | 作用 |
|------|------|
| `server/db/index.js` | 数据库schema定义，所有表在此创建 |
| `server/services/promptBuilder.js` | 动态Prompt是AI教练个性化的核心 |
| `server/services/ragIndexer.js` | FTS5全文检索，支撑"相关历史经验" |
| `server/services/personaUpdater.js` | 画像更新逻辑，计算薄弱环节 |
| `server/services/evolutionTrigger.js` | 进化触发，满足条件写入evolution_logs |
| `src/store/index.ts` | Zustand状态管理，前端所有状态和action |

---

## 7. MiniMax API配置

需要设置 `.env` 文件：
```bash
MINIMAX_API_KEY=your_key_here
MINIMAX_BASE_URL=https://api.minimax.chat/v1
MINIMAX_MODEL=MiniMax-M2.7
```

`minimax.js` 提供两个函数：
- `chat(messages)` - 返回文本回复
- `chatJson(messages)` - 自动解析JSON（支持markdown代码块和裸JSON）

---

## 8. 前端状态流

Zustand store 是前端唯一真相源：

```
用户操作 → Store Action → 更新本地storage → POST后端同步
                ↓
         AI服务调用 → 更新Store状态 → UI自动更新
```

LocalStorage 负责持久化（页面刷新不丢数据），后端 SQLite 负责服务端存储和RAG索引。
