# 并行用户系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现真实用户注册登录 + AI用户创建管理 + Agent执行引擎

**Architecture:** 基于现有SQLite数据库扩展，新增auth认证体系、users表扩展、ai_profiles表、ai_agent_logs表。前端新增登录注册页面，管理后台扩展AI用户创建和监控。

**Tech Stack:** Express + better-sqlite3 + JWT + bcrypt + Node.js定时任务

---

## 文件结构

```
server/
├── db/index.js              # 新增users扩展、ai_profiles、ai_agent_logs表
├── routes/
│   ├── auth.js              # 新增：注册/登录/登出
│   ├── admin.js             # 修改：管理员功能扩展
│   └── ai-user.js           # 新增：AI用户管理
├── services/
│   ├── ai-profile-generator.js  # 新增：虚拟画像生成
│   └── ai-agent-engine.js        # 新增：Agent执行引擎
├── middleware/
│   └── auth.js              # 新增：JWT验证中间件
└── index.js                 # 修改：添加认证路由

src/
├── pages/
│   ├── Login.tsx            # 新增：登录页
│   ├── Register.tsx         # 新增：注册页
│   └── Admin.tsx             # 修改：AI用户管理tab
├── store/index.ts           # 修改：用户状态管理
├── lib/auth.ts              # 新增：认证工具函数
└── App.tsx                  # 修改：添加登录注册路由

tests/
├── auth.test.ts             # 新增：认证测试
└── ai-user.test.ts          # 新增：AI用户测试
```

---

## Phase 1: 认证系统

### Task 1: 数据库扩展 - users表新增字段

**Files:**
- Modify: `server/db/index.js:22-32`

- [ ] **Step 1: 修改users表**

在现有users表定义中添加 `is_ai_user`、`password_hash` 字段：

```javascript
// 修改 server/db/index.js 第22-32行的users表定义
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'user',
    is_ai_user INTEGER DEFAULT 0,
    ai_profile_id TEXT,
    created_at TEXT,
    updated_at TEXT
  );
`);
```

- [ ] **Step 2: 添加新表**

在 `server/db/index.js` 第195行（Evolution logs之后）添加：

```javascript
// AI用户画像表
CREATE TABLE IF NOT EXISTS ai_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT,
  age INTEGER,
  occupation TEXT,
  education TEXT,
  city TEXT,
  personality TEXT,
  skills TEXT,
  background TEXT,
  thinking_habits TEXT,
  predicted_blockers TEXT,
  goals_30days TEXT,
  created_at TEXT,
  updated_at TEXT
);

// AI用户执行日志表
CREATE TABLE IF NOT EXISTS ai_agent_logs (
  id TEXT PRIMARY KEY,
  ai_user_id TEXT REFERENCES users(id),
  action_type TEXT,
  details TEXT,
  created_at TEXT
);
```

- [ ] **Step 3: 添加索引**

在第214行索引之后添加：

```javascript
CREATE INDEX IF NOT EXISTS idx_ai_profiles_user ON ai_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_logs_user ON ai_agent_logs(ai_user_id, created_at);
```

- [ ] **Step 4: 测试验证**

```bash
node -e "import { db } from './server/db/index.js'; console.log(db.prepare('SELECT sql FROM sqlite_master WHERE name=\"users\"').get())"
```

- [ ] **Step 5: 提交**

```bash
git add server/db/index.js
git commit -m "feat(db): add is_ai_user field and new tables for parallel users"
```

---

### Task 2: 认证中间件

**Files:**
- Create: `server/middleware/auth.js`

- [ ] **Step 1: 创建JWT验证中间件**

```javascript
// server/middleware/auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shipin-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'token无效或已过期' });
  }
  req.userId = decoded.userId;
  next();
}

export function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'token无效或已过期' });
  }
  // 检查管理员权限
  const { db } = require('../db/index.js');
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  req.userId = decoded.userId;
  next();
}
```

- [ ] **Step 2: 安装jsonwebtoken**

```bash
npm install jsonwebtoken --prefix /Users/shuhaipeng/shipin
```

- [ ] **Step 3: 提交**

```bash
git add server/middleware/auth.js package.json package-lock.json
git commit -m "feat(auth): add JWT middleware"
```

---

### Task 3: 认证路由

**Files:**
- Create: `server/routes/auth.js`

- [ ] **Step 1: 创建注册路由**

```javascript
// server/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { db } from '../db/index.js';
import { signToken } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/auth/register - 注册
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码必填' });
    }
    // 检查是否已存在
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }
    // 创建用户
    const userId = uuid();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'user', ?, ?)
    `).run(userId, name || '', email, passwordHash, now, now);
    const token = signToken(userId);
    res.json({ token, user: { id: userId, email, name } });
  } catch (err) {
    console.error('[/api/auth/register]', err.message);
    res.status(500).json({ error: '注册失败' });
  }
});

// POST /api/auth/login - 登录
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码必填' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    if (user.is_ai_user) {
      return res.status(401).json({ error: 'AI用户无法登录' });
    }
    const valid = await bcrypt.compare(password, user.password_hash || '');
    if (!valid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('[/api/auth/login]', err.message);
    res.status(500).json({ error: '登录失败' });
  }
});

// GET /api/auth/me - 获取当前用户
authRouter.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  const token = authHeader.split(' ')[1];
  const { verifyToken } = require('../middleware/auth.js');
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'token无效' });
  }
  const user = db.prepare('SELECT id, name, email, role, is_ai_user FROM users WHERE id = ?').get(decoded.userId);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  res.json({ user });
});
```

- [ ] **Step 2: 在server/index.js中注册路由**

在 `server/index.js` 第6行后添加：
```javascript
import { authRouter } from './routes/auth.js';
```

在路由注册部分添加：
```javascript
app.use('/api/auth', authRouter);
```

- [ ] **Step 3: 安装bcryptjs**

```bash
npm install bcryptjs --prefix /Users/shuhaipeng/shipin
```

- [ ] **Step 4: 测试**

```bash
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123"}'
```

- [ ] **Step 5: 提交**

```bash
git add server/routes/auth.js server/index.js package.json package-lock.json
git commit -m "feat(auth): add register/login/me endpoints"
```

---

### Task 4: 前端登录注册页面

**Files:**
- Create: `src/pages/Login.tsx`
- Create: `src/pages/Register.tsx`
- Create: `src/lib/auth.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建auth工具**

```typescript
// src/lib/auth.ts
const API_BASE = '/api/auth';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '登录失败');
  }
  return res.json();
}

export async function register(email: string, password: string, name?: string) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || '注册失败');
  }
  return res.json();
}

export function getToken() {
  return localStorage.getItem('shipin_token');
}

export function setToken(token: string) {
  localStorage.setItem('shipin_token', token);
}

export function removeToken() {
  localStorage.removeItem('shipin_token');
}
```

- [ ] **Step 2: 创建登录页**

```typescript
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, setToken } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await login(email, password);
      setToken(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h1 className="text-xl font-bold">登录</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          登录
        </button>
        <p className="text-sm text-center text-gray-600">
          还没有账号？<Link to="/register" className="text-blue-600">注册</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: 创建注册页**

```typescript
// src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, setToken } from '../lib/auth';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await register(email, password, name);
      setToken(data.token);
      navigate('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
        <h1 className="text-xl font-bold">注册</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="名字（可选）"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="密码（最少8位）"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
          minLength={8}
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          注册
        </button>
        <p className="text-sm text-center text-gray-600">
          已有账号？<Link to="/login" className="text-blue-600">登录</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: 更新App.tsx路由**

在现有路由中添加登录注册页面：

```typescript
// 修改 src/App.tsx
// 添加路由：
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />
// 添加import:
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
```

- [ ] **Step 5: 更新store中的initUser**

修改 `src/store/index.ts` 的 `initUser`:

```typescript
import { getToken } from './lib/auth';

initUser: () => {
  const token = getToken();
  if (!token) {
    // 未登录，不加载数据，重定向到登录
    return;
  }
  // 现有逻辑...
}
```

- [ ] **Step 6: 提交**

```bash
git add src/pages/Login.tsx src/pages/Register.tsx src/lib/auth.ts src/App.tsx src/store/index.ts
git commit -m "feat(auth): add login/register pages and auth utilities"
```

---

## Phase 2: AI用户基础架构

### Task 5: AI画像生成器

**Files:**
- Create: `server/services/ai-profile-generator.js`

- [ ] **Step 1: 创建AI画像生成器**

```javascript
// server/services/ai-profile-generator.js
import { v4 as uuid } from 'uuid';

// 创业领域配置
const DOMAIN_CONFIG = {
  'AI开发者': {
    occupations: ['全栈工程师', '前端工程师', 'AI研究员', '独立开发者'],
    products: ['AI工具', 'SaaS平台', 'Chrome扩展', 'API服务'],
    blockers: ['产品沉迷', '技术完美主义', '忽视用户验证'],
  },
  '电商': {
    occupations: ['淘宝卖家', '跨境电商从业者', '微商', '传统零售转型'],
    products: ['垂直电商平台', '一件代发', '私域电商', '直播带货'],
    blockers: ['流量焦虑', '选品纠结', '客服逃避'],
  },
  'SaaS': {
    occupations: ['企业销售', '产品经理', '连续创业者', '技术创始人'],
    products: ['B2B工具', '企业管理SaaS', '垂直行业解决方案', 'API集成平台'],
    blockers: ['企业销售恐惧', '定价纠结', '客户成功担忧'],
  },
  '内容创作': {
    occupations: ['自媒体博主', '知识付费创作者', '视频博主', '编剧'],
    products: ['付费社群', '知识星球', '视频号', '播客'],
    blockers: ['内容创作瓶颈', '流量获取困难', '变现模式迷茫'],
  },
  '本地服务': {
    occupations: ['餐饮老板', '房产中介', '培训师', '导游'],
    products: ['本地服务平台', '预约系统', '会员体系', '社区团购'],
    blockers: ['线下执行困难', '用户获取成本高', '复购率低'],
  },
};

// 城市列表
const CITIES = ['北京', '上海', '深圳', '杭州', '广州', '成都', '南京', '武汉', '西安', '苏州'];

// 姓氏和名字
const XING = ['李', '王', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
const MING = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '桂英', '建华', '志强'];

// 随机选择
function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 生成随机整数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 性格生成
function generatePersonality(domain) {
  const traits = ['外向', '内向', '中间偏外向', '中间偏内向'];
  return {
    tendency: randomPick(traits),
    executionScore: randomInt(5, 9),
    decisionStyle: randomPick(['果断', '犹豫', '分析 paralysis', '快速试错']),
    stressResponse: randomPick(['寻求支持', '独自消化', '暂时逃避', '积极面对']),
  };
}

// 技能雷达
function generateSkills() {
  return {
    tech: randomInt(3, 10),
    product: randomInt(3, 10),
    sales: randomInt(2, 8),
    operations: randomInt(3, 9),
  };
}

// 思维习惯
function generateThinkingHabits() {
  return {
    analysis: randomPick(['系统分析', '直觉判断', '先模仿再创新', '数据驱动']),
    difficulty: randomPick(['先查资料', '先问人', '自己试错', '拖延回避']),
    learning: randomPick(['实践学习', '理论学习', '边学边做', '系统学习']),
  };
}

export function generateAIProfile(domain, stage) {
  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG['AI开发者'];
  const firstName = randomPick(XING);
  const lastName = randomPick(MING);
  const name = firstName + lastName;

  return {
    id: uuid(),
    name,
    age: randomInt(25, 45),
    occupation: randomPick(config.occupations),
    education: randomPick(['大专', '本科', '硕士']),
    city: randomPick(CITIES),
    personality: generatePersonality(domain),
    skills: generateSkills(),
    background: {
      whyEntrepreneur: `放弃了${randomPick(['大厂高薪', '稳定工作', '海外就业', '研究生录取'])}来创业`,
      expectedGain: randomPick(['财务自由', '个人成长', '证明自己', '帮助更多人']),
      biggestFear: randomPick(['浪费时间', '家人失望', '产品没人用', '经济压力']),
    },
    thinkingHabits: generateThinkingHabits(),
    predictedBlockers: {
      mainBlocker: randomPick(config.blockers),
      secondaryBlocker: randomPick([...config.blockers, '执行拖延', '方向迷茫']),
      triggerCondition: '当任务连续失败2次以上时触发卡点',
    },
    goals30days: {
      product: randomPick(config.products),
      targetUser: `${randomPick(['中小卖家', '独立开发者', '中小企业', '个人用户'])}`,
      coreHypothesis: `${randomPick(['刚需高频', '痛点明显', '付费意愿强', '决策链短'])}的需求存在`,
    },
  };
}
```

- [ ] **Step 2: 提交**

```bash
git add server/services/ai-profile-generator.js
git commit -m "feat(ai-user): add AI profile generator"
```

---

### Task 6: AI用户管理API

**Files:**
- Create: `server/routes/ai-user.js`

- [ ] **Step 1: 创建AI用户管理路由**

```javascript
// server/routes/ai-user.js
import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../db/index.js';
import { adminMiddleware } from '../middleware/auth.js';
import { generateAIProfile } from '../services/ai-profile-generator.js';

export const aiUserRouter = Router();

// POST /api/admin/ai-users - 创建AI用户
aiUserRouter.post('/', adminMiddleware, (req, res) => {
  try {
    const { domain, stage } = req.body;
    if (!domain || !stage) {
      return res.status(400).json({ error: 'domain和stage必填' });
    }

    // 生成AI画像
    const profile = generateAIProfile(domain, stage);

    // 创建AI用户账号
    const userId = uuid();
    const now = new Date().toISOString();

    // 使用唯一邮箱（AI用户不需要真实邮箱）
    const aiEmail = `ai_${userId}@localhost`;

    db.prepare(`
      INSERT INTO users (id, name, email, role, is_ai_user, created_at, updated_at)
      VALUES (?, ?, ?, 'user', 1, ?, ?)
    `).run(userId, profile.name, aiEmail, now, now);

    // 保存AI画像
    db.prepare(`
      INSERT INTO ai_profiles (id, user_id, name, age, occupation, education, city, personality, skills, background, thinking_habits, predicted_blockers, goals_30days, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      profile.id,
      userId,
      profile.name,
      profile.age,
      profile.occupation,
      profile.education,
      profile.city,
      JSON.stringify(profile.personality),
      JSON.stringify(profile.skills),
      JSON.stringify(profile.background),
      JSON.stringify(profile.thinkingHabits),
      JSON.stringify(profile.predictedBlockers),
      JSON.stringify(profile.goals30days),
      now,
      now
    );

    res.json({
      userId,
      profileId: profile.id,
      profile,
    });
  } catch (err) {
    console.error('[/api/admin/ai-users POST]', err.message);
    res.status(500).json({ error: '创建AI用户失败' });
  }
});

// GET /api/admin/ai-users - 获取所有AI用户
aiUserRouter.get('/', adminMiddleware, (req, res) => {
  try {
    const aiUsers = db.prepare(`
      SELECT u.id as userId, u.name, u.created_at, u.is_ai_user,
             ap.age, ap.occupation, ap.city, ap.personality, ap.skills, ap.background
      FROM users u
      LEFT JOIN ai_profiles ap ON u.id = ap.user_id
      WHERE u.is_ai_user = 1
      ORDER BY u.created_at DESC
    `).all();

    const result = aiUsers.map(u => ({
      ...u,
      personality: u.personality ? JSON.parse(u.personality) : null,
      skills: u.skills ? JSON.parse(u.skills) : null,
      background: u.background ? JSON.parse(u.background) : null,
    }));

    res.json({ aiUsers: result });
  } catch (err) {
    console.error('[/api/admin/ai-users GET]', err.message);
    res.status(500).json({ error: '获取AI用户列表失败' });
  }
});

// GET /api/admin/ai-users/:id/profile - 获取AI用户完整画像
aiUserRouter.get('/:id/profile', adminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const profile = db.prepare(`
      SELECT * FROM ai_profiles WHERE user_id = ?
    `).get(id);

    if (!profile) {
      return res.status(404).json({ error: 'AI用户不存在' });
    }

    res.json({
      ...profile,
      personality: JSON.parse(profile.personality || '{}'),
      skills: JSON.parse(profile.skills || '{}'),
      background: JSON.parse(profile.background || '{}'),
      thinking_habits: JSON.parse(profile.thinking_habits || '{}'),
      predicted_blockers: JSON.parse(profile.predicted_blockers || '{}'),
      goals_30days: JSON.parse(profile.goals_30days || '{}'),
    });
  } catch (err) {
    console.error('[/api/admin/ai-users/:id/profile GET]', err.message);
    res.status(500).json({ error: '获取AI用户画像失败' });
  }
});
```

- [ ] **Step 2: 在server/index.js注册路由**

添加：
```javascript
import { aiUserRouter } from './routes/ai-user.js';
// ...
app.use('/api/admin/ai-users', aiUserRouter);
```

- [ ] **Step 3: 提交**

```bash
git add server/routes/ai-user.js server/index.js
git commit -m "feat(admin): add AI user management API"
```

---

### Task 7: 管理后台扩展 - AI用户创建UI

**Files:**
- Modify: `src/pages/Admin.tsx`

- [ ] **Step 1: 添加AI用户创建Tab**

在Admin.tsx中添加：

```typescript
// 添加state
const [activeTab2, setActiveTab2] = useState<'users' | 'ai-users' | 'create'>('users');

// 添加领域和阶段选项
const DOMAINS = ['AI开发者', '电商', 'SaaS', '内容创作', '本地服务'];
const STAGES = ['定位', '验证', 'MVP', '销售', '复盘'];

// 创建AI用户函数
async function createAIUser(domain: string, stage: string) {
  const res = await fetch('/api/admin/ai-users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ domain, stage }),
  });
  if (!res.ok) throw new Error('创建失败');
  const data = await res.json();
  return data;
}

// 在UI中添加创建表单
// (创建2步选择UI + 创建按钮)
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/Admin.tsx
git commit -m "feat(admin): add AI user creation UI"
```

---

## Phase 3: Agent执行引擎

### Task 8: Agent执行引擎基础

**Files:**
- Create: `server/services/ai-agent-engine.js`

- [ ] **Step 1: 创建Agent执行引擎骨架**

```javascript
// server/services/ai-agent-engine.js
import { db } from '../db/index.js';
import { v4 as uuid } from 'uuid';
import { chat } from './minimax.js';

export class AIAgentEngine {
  constructor(aiUserId) {
    this.aiUserId = aiUserId;
    this.currentDay = 1;
    this.taskHistory = [];
  }

  // 记录执行日志
  log(actionType, details) {
    db.prepare(`
      INSERT INTO ai_agent_logs (id, ai_user_id, action_type, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuid(), this.aiUserId, actionType, JSON.stringify(details), new Date().toISOString());
  }

  // 检查今日任务
  async getTodayTasks() {
    const tasks = db.prepare(`
      SELECT * FROM daily_tasks
      WHERE user_id = ? AND day_number = ?
      ORDER BY priority DESC
    `).all(this.aiUserId, this.currentDay);
    return tasks;
  }

  // 执行单个任务
  async executeTask(task) {
    // 模拟真实用户行为：70-80%完成率
    const willComplete = Math.random() > 0.25;
    if (willComplete) {
      db.prepare(`
        UPDATE daily_tasks SET status = 'completed', updated_at = ? WHERE id = ?
      `).run(new Date().toISOString(), task.id);
      this.log('task_complete', { taskId: task.id, title: task.title });
      return true;
    } else {
      // 检查是否是卡点型跳过
      const skipReason = this.getSkipReason();
      db.prepare(`
        UPDATE daily_tasks SET status = 'skipped', updated_at = ? WHERE id = ?
      `).run(new Date().toISOString(), task.id);
      this.log('task_skip', { taskId: task.id, title: task.title, reason: skipReason });
      return false;
    }
  }

  // 获取跳过原因（基于画像）
  getSkipReason() {
    const reasons = [
      '想再想想清楚再做',
      '感觉不是最重要的',
      '今天时间不够',
      '心情不好',
      '有更重要的事',
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  // 检查是否需要教练介入
  async checkCoachIntervention() {
    // 如果连续跳过2次以上，触发对话
    const recentSkips = db.prepare(`
      SELECT COUNT(*) as cnt FROM daily_tasks
      WHERE user_id = ? AND status = 'skipped' AND day_number >= ?
    `).get(this.aiUserId, this.currentDay - 1);

    if (recentSkips.cnt >= 2) {
      return true;
    }
    return false;
  }

  // 与教练对话
  async coachChat(message) {
    const profile = db.prepare('SELECT * FROM ai_profiles WHERE user_id = ?').get(this.aiUserId);
    const context = {
      startupProfile: db.prepare('SELECT * FROM startup_profiles WHERE user_id = ?').get(this.aiUserId),
      currentDay: this.currentDay,
    };

    const reply = await chat([
      { role: 'system', content: `你是30天创业教练。用户是一个AI模拟的创业者（${profile?.name}），性格：${profile?.personality}。` },
      { role: 'user', content: message },
    ]);

    this.log('coach_chat', { message, reply });
    return reply;
  }

  // 执行每日轮次
  async runDailyRound() {
    const tasks = await this.getTodayTasks();
    let completed = 0;
    let skipped = 0;

    for (const task of tasks) {
      const success = await this.executeTask(task);
      if (success) completed++;
      else skipped++;
    }

    // 检查是否需要教练介入
    const needIntervention = await this.checkCoachIntervention();
    if (needIntervention) {
      const reply = await this.coachChat('我最近总是跳过任务，感觉有点卡住了，给我一些建议。');
      this.log('coach_intervention', { reply });
    }

    // 更新当前天数
    this.currentDay = Math.min(30, this.currentDay + 1);

    return { completed, skipped, needIntervention };
  }
}

// 启动AI用户执行
export function startAIUserExecution(aiUserId) {
  const engine = new AIAgentEngine(aiUserId);
  return engine.runDailyRound();
}
```

- [ ] **Step 2: 提交**

```bash
git add server/services/ai-agent-engine.js
git commit -m "feat(ai-agent): add AIAgentEngine base"
```

---

### Task 9: AI用户执行API

**Files:**
- Modify: `server/routes/ai-user.js`

- [ ] **Step 1: 添加启动/停止AI用户执行端点**

```javascript
// POST /api/admin/ai-users/:id/start - 启动AI用户执行
aiUserRouter.post('/:id/start', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { startAIUserExecution } = require('../services/ai-agent-engine.js');
    const result = await startAIUserExecution(id);
    res.json({ ok: true, result });
  } catch (err) {
    console.error('[/api/admin/ai-users/:id/start]', err.message);
    res.status(500).json({ error: '启动AI用户失败' });
  }
});
```

- [ ] **Step 2: 提交**

```bash
git add server/routes/ai-user.js
git commit -m "feat(ai-agent): add start/stop AI user execution API"
```

---

## Phase 4: 完善管理后台

### Task 10: 管理后台完整UI

**Files:**
- Modify: `src/pages/Admin.tsx`

- [ ] **Step 1: 完善管理后台UI**

扩展Admin.tsx添加：
1. 用户类型筛选（真实用户/AI用户/全部）
2. AI用户完整画像展示
3. AI用户执行状态和操作按钮
4. 进化日志Tab

```typescript
// 用户类型筛选
<div className="flex gap-2 mb-4">
  <button onClick={() => setUserFilter('all')} className={...}>全部</button>
  <button onClick={() => setUserFilter('real')} className={...}>真实用户</button>
  <button onClick={() => setUserFilter('ai')} className={...}>AI用户</button>
</div>

// AI用户画像卡片展示
// 包含：基本信息、性格、技能雷达、卡点预测、30天目标
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/Admin.tsx
git commit -m "feat(admin): complete AI user management UI"
```

---

## 验证清单

- [ ] 注册新用户成功
- [ ] 登录成功，获取token
- [ ] 未登录访问 /dashboard 被重定向到 /login
- [ ] 创建AI用户成功，生成完整画像
- [ ] AI用户显示在管理后台
- [ ] 启动AI用户执行，产生任务日志
- [ ] 真实用户和AI用户数据隔离
- [ ] Admin用户可以看到所有数据，普通用户不行

---

## 执行选项

**1. Subagent-Driven (recommended)** - 每个Task由独立subagent执行，两阶段review

**2. Inline Execution** - 本session直接执行

**Which approach?**