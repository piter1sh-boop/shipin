# 30 天 AI 创业执行教练 MVP PRD

版本：v0.1  
日期：2026-06-04  
目标用户：AI 独立开发者 / 程序员创业者  
阶段目标：先服务 5 个免费测试用户，验证 30 天陪跑闭环是否能创造真实价值。

## 1. 产品一句话

面向 AI 独立开发者和程序员创业者的 30 天创业执行教练 Web App，帮助用户从模糊创业想法推进到可验证 MVP，并完成 20 次用户访谈、1 个落地页、1 个可演示原型、3 个潜在付费线索。

## 2. MVP 验证假设

### 2.1 核心假设

如果 AI 每天给用户明确创业任务、追踪执行结果、帮助复盘卡点，并由人工辅助校准方向，那么早期创业者会更快从想法进入真实验证。

### 2.2 要验证的问题

1. 用户是否愿意连续 30 天使用这个产品。
2. AI 给出的每日任务是否能推动真实行动。
3. 用户是否真的会完成访谈、落地页、原型和潜在付费线索。
4. 人工陪跑的介入点在哪里最有效。
5. 30 天结束后，用户是否愿意付费继续使用。

### 2.3 成功标准

第一批 5 个测试用户中：

1. 至少 4 人完成 14 天以上连续使用。
2. 至少 3 人完成 20 次用户访谈。
3. 至少 3 人完成落地页和可演示原型。
4. 至少 2 人获得 3 个潜在付费线索。
5. 至少 3 人表示愿意付费继续使用或推荐给朋友。

## 3. 用户画像

### 3.1 目标用户

AI 独立开发者 / 程序员创业者。

典型特征：

1. 有技术能力，可以独立做原型。
2. 对 AI 工具接受度高。
3. 有创业想法，但经常卡在定位、验证、获客和持续执行。
4. 容易沉迷做产品，逃避用户访谈和销售。
5. 希望有人每天推动自己做正确动作。

### 3.2 不服务的人

第一版暂不服务：

1. 已经有成熟团队和融资的公司。
2. 完全没有技术能力的用户。
3. 想做纯投资、短视频带货、线下门店等非软件产品的人。
4. 只想学习创业知识但不愿每天执行的人。

## 4. 30 天结果承诺

用户完成 30 天后，应至少获得：

1. 一个清晰的目标用户定义。
2. 一个经过验证的问题陈述。
3. 一份竞品和替代方案分析。
4. 20 次用户访谈记录。
5. 1 个落地页。
6. 1 个可演示 MVP。
7. 3 个潜在付费线索。
8. 一份创业验证报告。
9. 下一阶段行动建议：继续、转向或停止。

## 5. 产品范围

### 5.1 MVP 必做

1. Onboarding：收集创业想法、目标用户、当前阶段、技能、时间和卡点。
2. Dashboard：展示 30 天进度、今日任务、关键指标和风险提醒。
3. 30 天计划：生成 4 周计划和每日任务。
4. 今日执行：展示 1 到 3 个关键任务，支持提交完成情况。
5. 用户访谈记录：记录访谈对象、痛点、证据、付费意愿。
6. 线索记录：记录潜在付费用户、状态、下一步。
7. AI 教练对话：基于用户上下文提供创业建议。
8. 周复盘：每周生成进展、风险和下周重点。
9. 管理视图：人工教练查看 5 个用户的进展和卡点。

### 5.2 MVP 不做

1. 支付系统。
2. 社区功能。
3. 团队协作。
4. 复杂多 Agent 自动工作流。
5. 自动发邮件、自动发帖、自动联系用户。
6. 模型微调。
7. 原生移动 App。
8. 通用创业者全行业适配。

## 6. 信息架构

页面路由建议：

```text
/
/onboarding
/dashboard
/plan
/today
/interviews
/leads
/coach
/review
/admin
```

### 6.1 `/`

落地页和测试用户招募页。

核心内容：

1. 产品一句话。
2. 适合谁。
3. 30 天能获得什么。
4. 每天如何执行。
5. 第一批免费测试，只招 5 人。
6. 申请入口。

### 6.2 `/onboarding`

用户第一次进入时填写。

字段：

1. 你想做什么产品。
2. 目标用户是谁。
3. 你认为他们有什么痛点。
4. 现在进展到哪一步。
5. 你每天能投入多少时间。
6. 你最容易卡在哪里。
7. 你希望 30 天后拿到什么结果。
8. 是否已有原型、落地页、访谈记录、用户线索。

提交后，AI 生成：

1. 创业画像。
2. 风险判断。
3. 第 1 周计划。
4. 今日第一个任务。

### 6.3 `/dashboard`

用户主驾驶舱。

模块：

1. 30 天进度条。
2. 今日关键任务。
3. 当前阶段：定位、验证、MVP、销售、复盘。
4. 核心指标：访谈数、落地页状态、原型状态、线索数。
5. 本周风险提醒。
6. AI 下一步建议。

### 6.4 `/plan`

展示完整 30 天计划。

结构：

1. 第 1 周：定位和用户访谈。
2. 第 2 周：落地页和 MVP 原型。
3. 第 3 周：真实测试和线索获取。
4. 第 4 周：复盘、决策和下一阶段路线图。

每一天包含：

1. 当天目标。
2. 任务列表。
3. 产出物。
4. 成功判定。

### 6.5 `/today`

每日执行页。

用户看到：

1. 今天最重要的 1 件事。
2. 额外 1 到 2 个任务。
3. AI 给出的执行建议。
4. 提交完成情况。

用户提交：

1. 完成了什么。
2. 没完成什么。
3. 为什么没完成。
4. 今天接触了几个真实用户。
5. 是否获得新线索。
6. 今天的主观价值评分。

### 6.6 `/interviews`

用户访谈记录页。

字段：

1. 访谈对象。
2. 联系方式，可选。
3. 用户类型。
4. 当前替代方案。
5. 最强痛点。
6. 原话证据。
7. 付费意愿，1 到 5 分。
8. 是否愿意继续试用。
9. 下一步行动。

### 6.7 `/leads`

潜在付费线索页。

字段：

1. 线索名称。
2. 用户类型。
3. 来源。
4. 痛点。
5. 预算或付费意愿。
6. 当前状态：新线索、已沟通、试用中、愿意付费、流失。
7. 下一步。

### 6.8 `/coach`

AI 教练对话页。

能力：

1. 回答创业问题。
2. 根据用户计划给下一步建议。
3. 分析访谈记录。
4. 修改任务计划。
5. 生成落地页文案。
6. 生成访谈问题。
7. 生成 MVP 功能范围。
8. 帮用户判断继续、转向或停止。

限制：

1. 不替用户做高风险决策。
2. 不把猜测包装成事实。
3. 涉及对外发送内容时只生成草稿，不自动发送。

### 6.9 `/review`

复盘页。

每日复盘：

1. 今天完成了什么。
2. 最大卡点是什么。
3. 明天最重要的任务是什么。

每周复盘：

1. 本周完成情况。
2. 访谈质量。
3. 线索质量。
4. AI 判断的主要风险。
5. 下周计划调整。

30 天报告：

1. 初始假设。
2. 用户证据。
3. MVP 结果。
4. 付费线索。
5. 继续、转向或停止建议。
6. 下一阶段 14 天计划。

### 6.10 `/admin`

人工教练管理页。

模块：

1. 5 个测试用户列表。
2. 每个用户当前阶段。
3. 连续未执行天数。
4. 访谈数。
5. 线索数。
6. 高风险卡点。
7. 人工备注。

## 7. 数据模型

第一版可以先用 PostgreSQL，也可以先用本地 JSON 或 SQLite 快速验证。建议最终迁移到 PostgreSQL。

### 7.1 `users`

```sql
id uuid primary key
name text
email text unique
role text
created_at timestamp
updated_at timestamp
```

### 7.2 `startup_profiles`

```sql
id uuid primary key
user_id uuid references users(id)
product_idea text
target_user text
problem_statement text
current_stage text
daily_time_budget text
main_blocker text
desired_30_day_outcome text
ai_summary text
risk_level text
created_at timestamp
updated_at timestamp
```

### 7.3 `plans`

```sql
id uuid primary key
user_id uuid references users(id)
title text
start_date date
end_date date
status text
created_at timestamp
updated_at timestamp
```

### 7.4 `daily_tasks`

```sql
id uuid primary key
plan_id uuid references plans(id)
user_id uuid references users(id)
day_number integer
task_date date
title text
description text
task_type text
priority integer
success_criteria text
status text
created_by text
created_at timestamp
updated_at timestamp
```

`task_type` 可选：

```text
positioning
interview
landing_page
prototype
sales
review
```

### 7.5 `daily_checkins`

```sql
id uuid primary key
user_id uuid references users(id)
task_date date
completed_text text
blocked_text text
interview_count integer
lead_count integer
value_score integer
energy_score integer
ai_feedback text
created_at timestamp
updated_at timestamp
```

### 7.6 `interviews`

```sql
id uuid primary key
user_id uuid references users(id)
interview_date date
person_name text
person_type text
contact text
current_solution text
pain_points text
verbatim_quotes text
willingness_to_pay integer
follow_up_status text
notes text
created_at timestamp
updated_at timestamp
```

### 7.7 `leads`

```sql
id uuid primary key
user_id uuid references users(id)
name text
source text
person_type text
pain_point text
budget_signal text
status text
next_step text
created_at timestamp
updated_at timestamp
```

### 7.8 `coach_messages`

```sql
id uuid primary key
user_id uuid references users(id)
role text
content text
context_snapshot jsonb
created_at timestamp
```

### 7.9 `weekly_reviews`

```sql
id uuid primary key
user_id uuid references users(id)
week_number integer
summary text
completed_tasks integer
interview_count integer
lead_count integer
risks text
next_week_focus text
ai_recommendation text
created_at timestamp
updated_at timestamp
```

## 8. AI 工作流

### 8.1 Onboarding 分析

输入：

1. 用户创业想法。
2. 目标用户。
3. 当前阶段。
4. 时间预算。
5. 卡点。

输出：

1. 一句话产品假设。
2. 目标用户假设。
3. 风险判断。
4. 第一周目标。
5. 今天第一项任务。

### 8.2 30 天计划生成

输出必须包含：

1. 4 周主题。
2. 每周关键产出。
3. 每日任务。
4. 每日成功标准。
5. 访谈数量安排。
6. 落地页和 MVP 节点。
7. 线索获取节点。

### 8.3 每日任务推荐

AI 每天根据以下信息推荐任务：

1. 原始目标。
2. 昨日执行情况。
3. 当前访谈数。
4. 当前线索数。
5. 当前 MVP 状态。
6. 用户卡点。

推荐原则：

1. 每天最多 3 个任务。
2. 必须至少有 1 个任务接触真实用户或推进真实验证。
3. 不鼓励用户连续多天只写代码。
4. 如果用户连续 2 天未执行，降低任务难度。

### 8.4 访谈分析

AI 分析访谈记录，输出：

1. 高频痛点。
2. 用户原话证据。
3. 是否存在强需求。
4. 当前替代方案。
5. 付费意愿判断。
6. 下一批应访谈的人。

### 8.5 周复盘

输入：

1. 本周任务完成情况。
2. 访谈记录。
3. 线索记录。
4. 每日 check-in。

输出：

1. 本周进展。
2. 最重要证据。
3. 最大风险。
4. 是否需要调整目标用户。
5. 下周重点。
6. 人工教练应关注的问题。

## 9. Prompt 模板

### 9.1 系统角色

```text
你是一个严厉但务实的 30 天创业执行教练，服务对象是 AI 独立开发者和程序员创业者。
你的目标不是让用户感觉良好，而是推动用户每天完成真实创业动作。
你必须优先推动用户接触真实用户、验证问题、获得付费信号，而不是沉迷写代码。
你给出的建议必须具体、可执行、可在 24 小时内完成。
当证据不足时，你必须指出证据不足，不允许假装确定。
```

### 9.2 每日任务生成 Prompt

```text
基于以下用户上下文，为用户生成今天的创业执行任务。

要求：
1. 最多 3 个任务。
2. 每个任务必须有清晰完成标准。
3. 至少 1 个任务必须接触真实用户或推动真实验证。
4. 如果用户过去 2 天执行失败，降低任务难度。
5. 不要给泛泛建议。

用户上下文：
{{context}}

输出 JSON：
{
  "main_task": {
    "title": "",
    "description": "",
    "success_criteria": "",
    "estimated_minutes": 0
  },
  "secondary_tasks": [],
  "coach_note": "",
  "risk_warning": ""
}
```

### 9.3 周复盘 Prompt

```text
请根据用户本周执行数据生成创业复盘。

你需要判断：
1. 用户是否在逃避真实验证。
2. 用户是否获得了足够的用户证据。
3. 当前产品假设是否还站得住。
4. 下周最重要的 3 个动作是什么。

输入数据：
{{weekly_data}}

输出：
1. 本周事实。
2. 关键证据。
3. 最大风险。
4. 下周任务。
5. 对人工教练的提醒。
```

## 10. 前端设计要求

设计方向：

1. 像工作台，不像营销页。
2. 信息密度适中，适合每天打开执行。
3. 明确展示进度、任务、指标和风险。
4. 避免大面积装饰性视觉。
5. 重点突出“今天该做什么”。

核心组件：

1. 顶部导航。
2. 侧边栏。
3. 30 天进度条。
4. 指标卡片。
5. 任务列表。
6. Check-in 表单。
7. 访谈记录表单。
8. 线索看板。
9. AI 对话面板。
10. 周复盘报告卡片。

## 11. 后端接口

### 11.1 Onboarding

```text
POST /api/onboarding
GET /api/profile
```

### 11.2 Plan

```text
POST /api/plans/generate
GET /api/plans/current
PATCH /api/tasks/:id
```

### 11.3 Daily Execution

```text
GET /api/today
POST /api/checkins
```

### 11.4 Interviews

```text
GET /api/interviews
POST /api/interviews
PATCH /api/interviews/:id
DELETE /api/interviews/:id
```

### 11.5 Leads

```text
GET /api/leads
POST /api/leads
PATCH /api/leads/:id
DELETE /api/leads/:id
```

### 11.6 Coach

```text
GET /api/coach/messages
POST /api/coach/messages
```

### 11.7 Reviews

```text
POST /api/reviews/weekly/generate
GET /api/reviews
```

### 11.8 Admin

```text
GET /api/admin/users
GET /api/admin/users/:id
POST /api/admin/users/:id/note
```

## 12. 7 天开发计划

### Day 1：信息架构和基础页面

任务：

1. 建立路由。
2. 建立基础布局。
3. 搭 Dashboard 静态页面。
4. 准备 mock 数据。

验收：

1. 可以在浏览器访问主要页面。
2. Dashboard 能展示 30 天进度、今日任务和指标。

### Day 2：Onboarding

任务：

1. 实现 onboarding 表单。
2. 保存用户创业画像。
3. 调用 AI 生成初始分析。

验收：

1. 用户提交后进入 Dashboard。
2. 系统生成创业画像和第 1 天任务。

### Day 3：30 天计划

任务：

1. 生成 4 周计划。
2. 生成每日任务。
3. 实现 `/plan` 页面。

验收：

1. 用户能看到完整 30 天计划。
2. 每天有任务、产出物和成功标准。

### Day 4：每日执行

任务：

1. 实现 `/today` 页面。
2. 完成任务状态更新。
3. 实现 check-in 表单。

验收：

1. 用户能提交当天完成情况。
2. Dashboard 指标会更新。

### Day 5：访谈和线索

任务：

1. 实现 `/interviews`。
2. 实现 `/leads`。
3. 增加访谈数和线索数统计。

验收：

1. 用户可以记录访谈。
2. 用户可以记录潜在付费线索。

### Day 6：AI 教练和复盘

任务：

1. 实现 `/coach`。
2. 接入用户上下文。
3. 实现周复盘生成。

验收：

1. AI 能基于用户数据回答。
2. 可以生成一份周复盘。

### Day 7：测试和招募

任务：

1. 打磨落地页。
2. 完成 5 个测试用户申请表。
3. 准备人工陪跑后台。
4. 修复主要体验问题。

验收：

1. 可以让真实用户注册或提交申请。
2. 可以开始第一批 5 人测试。

## 13. 30 天运营 SOP

### 每天

人工教练要检查：

1. 用户是否完成今日任务。
2. 是否连续 2 天未执行。
3. 是否有真实用户接触。
4. 是否只在写代码而没有验证。
5. AI 建议是否需要人工修正。

### 每周

人工教练要做：

1. 生成周复盘。
2. 和用户进行一次 20 到 30 分钟沟通。
3. 判断是否需要调整目标用户或产品范围。
4. 明确下周最重要的 3 个动作。

### 第 30 天

输出最终报告：

1. 用户最初的创业假设。
2. 30 天实际完成情况。
3. 用户访谈证据。
4. 付费线索质量。
5. 产品是否值得继续。
6. 下一阶段路线图。
7. 是否建议用户付费继续陪跑。

## 14. 招募页文案

标题：

```text
30 天 AI 创业执行教练
```

副标题：

```text
面向 AI 独立开发者和程序员创业者，帮你从模糊想法推进到可验证 MVP。
```

价值承诺：

```text
30 天内，你将完成 20 次用户访谈、1 个落地页、1 个可演示原型和 3 个潜在付费线索。
```

适合你，如果：

1. 你有一个 AI 产品或 SaaS 想法。
2. 你能自己做原型。
3. 你经常卡在方向、验证或持续执行。
4. 你愿意每天投入 1 到 2 小时。
5. 你愿意真的去访谈用户。

不适合你，如果：

1. 你只想听创业课，不想执行。
2. 你不愿接触真实用户。
3. 你希望 AI 替你完成所有创业决策。

申请文案：

```text
第一批只招 5 人，免费测试。
我会用 AI + 人工陪跑的方式，每天帮你明确下一步，并每周复盘一次。
```

## 15. 第一批用户访谈问题

招募前先问潜在用户：

1. 你现在在做什么 AI 产品或创业想法。
2. 你卡住最久的问题是什么。
3. 你过去 30 天做了哪些真实验证。
4. 你访谈过多少目标用户。
5. 你有没有做落地页或原型。
6. 你有没有潜在付费用户。
7. 为什么你还没有推进到下一步。
8. 如果每天有 AI 教练给你任务和复盘，你愿意用吗。
9. 你最希望它帮你解决什么。
10. 如果 30 天后真的帮你拿到验证结果，你愿意为它付多少钱。

## 16. 下一步执行清单

立刻要做：

1. 确认产品名。
2. 确认第一版是嵌入当前 Vite 项目，还是新建独立 Next.js 项目。
3. 写招募页。
4. 做 onboarding 和 dashboard。
5. 准备 5 个测试用户名单。
6. 开始第 1 批访谈。

建议顺序：

```text
PRD -> 招募页 -> Onboarding -> Dashboard -> Today -> Plan -> Coach -> Review
```

