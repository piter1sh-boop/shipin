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
        <h1 className="text-xl font-bold text-gray-900">注册</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="名字（可选）"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="密码（最少8位）"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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