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