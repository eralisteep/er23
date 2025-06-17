'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Ошибка регистрации');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1 className='dashboard-title'>Добавление пользователя</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label>Nickname:</label>
          <input
            type="text"
            value={name}
            required
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Роль:</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="user">Пользователь</option>
            <option value="staff">Сотрудник</option>
            <option value="admin">Админ</option>
          </select>
        </div>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
            <div style={{
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'flex-start',
        padding: '10px 20px'
      }}>
        <a
          href="/admin/dashboard"
          className="dashboard-link"
          style={{
            maxWidth: 220,
            background: '#2e86de',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 500,
            textDecoration: 'none',
            boxShadow: '0 2px 8px 0 rgba(46,134,222,0.08)',
            transition: 'background 0.2s, color 0.2s'
          }}
        >
          ← Админ панель
        </a>
      </div>
    </div>
  );
}