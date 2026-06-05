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