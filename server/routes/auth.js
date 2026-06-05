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