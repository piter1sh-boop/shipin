# Plan: 30天AI创业执行教练 MVP 前端开发

## Context

用户在 `/Users/shuhaipeng/shipin/` 目录下需要一个全新 Vite/React 前端 MVP，基于 PRD `30-day-ai-startup-coach-mvp-prd.md`。
PRD 定义了 9 个页面路由、完整数据模型、AI 工作流和 7 天开发计划。
当前 `shipin/` 目录无任何现有项目。

**约束：** MVP 阶段先不做后端，数据用 localStorage + mock 驱动，先跑通 onboarding → dashboard → today 主路径闭环。

---

## 实施计划

### Step 1: 脚手架（Day 1 前置）

- [ ] `npm create vite@latest . -- --template react-ts` 在 `/Users/shuhaipeng/shipin/` 下初始化
- [ ] 安装依赖：`react-router-dom`, `zustand`（状态管理）, `@tanstack/react-query`（可选，本阶段可省略）, `tailwindcss` + ` autoprefixer` + `postcss`, `lucide-react`（图标）, ` clsx`
- [ ] 配置 Tailwind CSS
- [ ] 配置路由：`react-router-dom` v6，9个路由

### Step 2: 目录结构

```
src/
  components/     # 可复用组件
    ui/           # Button, Card, Input, Badge, ProgressBar, etc.
    layout/       # Sidebar, TopNav
  pages/
    Landing/     # /
    Onboarding/  # /onboarding
    Dashboard/   # /dashboard
    Today/       # /today
    Plan/         # /plan
    Interviews/  # /interviews
    Leads/       # /leads
    Coach/       # /coach
    Review/      # /review
    Admin/       # /admin
  store/          # Zustand store（auth + startup profile + tasks）
  lib/            # localStorage 工具、AI service（mock）
  types/          # TypeScript interfaces
  App.tsx
  main.tsx
```

### Step 3: 页面开发顺序（按 PRD Day 1-7）

| 顺序 | 页面 | 路由 | 优先级 |
|------|------|------|--------|
| 1 | Landing | `/` | Day 7 |
| 2 | Onboarding | `/onboarding` | Day 2 |
| 3 | Dashboard | `/dashboard` | Day 1 |
| 4 | Today | `/today` | Day 4 |
| 5 | Plan | `/plan` | Day 3 |
| 6 | Interviews | `/interviews` | Day 5 |
| 7 | Leads | `/leads` | Day 5 |
| 8 | Coach | `/coach` | Day 6 |
| 9 | Review | `/review` | Day 6 |
| 10 | Admin | `/admin` | Day 7 |

**主路径闭环（最先完成）：**
`/onboarding` → `/dashboard` → `/today`

### Step 4: 数据层（MVP localStorage 方案）

**为什么不用后端：** MVP 阶段减少复杂度，5个测试用户用本地数据足够验证核心假设。

**实现方式：**
- `src/lib/storage.ts` — localStorage 读写封装，带 `JSON.parse` 异常处理
- Zustand store 订阅 storage，初始化时加载，自动持久化
- 关键实体：`user`, `startupProfile`, `plan`, `dailyTasks`, `dailyCheckins`, `interviews`, `leads`, `coachMessages`

**数据模型映射（按 PRD 7.1-7.9）：**
- `users` → localStorage `user`
- `startup_profiles` → localStorage `startupProfile`
- `plans` → localStorage `currentPlan`
- `daily_tasks` → localStorage `dailyTasks[]`
- `daily_checkins` → localStorage `checkins[]`
- `interviews` → localStorage `interviews[]`
- `leads` → localStorage `leads[]`
- `coach_messages` → localStorage `coachMessages[]`
- `weekly_reviews` → localStorage `weeklyReviews[]`

### Step 5: AI Service（Mock → 真实）

**MVP 阶段用 Mock：**
- `src/lib/aiService.ts` — 假AI，返回预设的JSON响应
- Onboarding 分析 → 返回固定创业画像 + 第一周任务
- 每日任务 → 返回 mock 任务列表
- Coach 对话 → 返回预设回复或简单的关键词匹配

**后期切换真实 AI：**
只需替换 `aiService.ts` 实现，调用 Claude API，Prompt 按 PRD 9.1-9.3

### Step 6: UI 组件库

基础 UI 组件（Tilwind 样式）：
- `Button` — primary / secondary / ghost 变体
- `Card` — 带 title/body/footer 插槽
- `Badge` — task_type 颜色映射（positioning=蓝, interview=绿, landing_page=橙...）
- `ProgressBar` — 30天进度条
- `Input` / `Textarea` — 表单字段
- `StatCard` — Dashboard 指标卡片

Layout：
- `Sidebar` — 左侧导航，固定，9个菜单项 + 用户信息
- `TopNav` — 顶部，当前页面名 + 日期

### Step 7: 页面详细说明

#### Dashboard（第一个完成的页面）
- 30天进度条（当前第N天 / 30）
- 今日任务卡片（1-3个任务，状态切换）
- 核心指标行：访谈数 | 落地页状态 | 原型状态 | 线索数
- 当前阶段 Badge（定位/验证/MVP/销售/复盘）
- 本周风险提醒（无数据时显示"暂无风险"）
- AI 建议（mock）

#### Onboarding
- 8个字段表单（按 PRD 6.2）
- 提交后 → 生成 startupProfile + 30天 plan + dailyTasks
- 跳转到 Dashboard

#### Today
- 展示今日任务（来自 dailyTasks 中 task_date=今天）
- Check-in 表单：完成情况、未完成原因、访谈数、线索数、价值评分
- 提交后更新 checkins[]，刷新 Dashboard 指标

#### Plan
- 4周折叠面板，每周展开显示每日任务
- 每天显示：任务 + 产出物 + 成功标准

#### Interviews / Leads
- 列表页 + 新增表单
- 字段完全按 PRD 6.6 / 6.7

#### Coach
- 类似 ChatGPT 的对话界面
- 左列显示历史消息，右列输入框
- 发送时携带用户上下文（startupProfile + 当前计划）
- Coach 消息展示 Markdown

#### Review
- 每日复盘表单
- 每周复盘（按 week_number 聚合生成）
- 30天最终报告

#### Admin
- 用户列表（5个测试用户）
- 每个用户的：阶段、连续未打卡天数、访谈数、线索数
- 教练备注输入

### Step 8: 路由守卫

- 未完成 onboarding → 重定向到 `/onboarding`
- 已完成 onboarding → `/` 或 `/dashboard` 均可访问
- Admin 页面可以简单路由级守卫

---

## 关键文件清单

| 文件 | 作用 |
|------|------|
| `src/lib/storage.ts` | localStorage 读写封装 |
| `src/store/index.ts` | Zustand store（auth + 数据） |
| `src/lib/aiService.ts` | AI 服务（mock） |
| `src/types/index.ts` | 所有 TypeScript interfaces |
| `src/components/ui/*` | 基础 UI 组件 |
| `src/components/layout/*` | Sidebar + TopNav |
| `src/pages/*/index.tsx` | 9个页面组件 |

---

## 验证计划

1. `npm run dev` — 浏览器打开，首页显示正常
2. 完整走一遍 onboarding → dashboard → today → check-in → dashboard 刷新数据更新
3. 手动 localStorage 注入 mock 数据，验证 Dashboard 各指标展示
4. 验证所有 9 个路由可正常访问
5. 在「其他」目录下看看有没有相关的 html 项目可以参考组件风格

---

## PRD 快速参考

- **成功标准：** onboarding 后 3 步闭环就跑通，主路径验证通过即可推进
- **task_type 可选值：** positioning, interview, landing_page, prototype, sales, review
- **task_status 可选值：** pending, completed, skipped
- **lead_status 可选值：** new, contacted, trial, paying, churned
