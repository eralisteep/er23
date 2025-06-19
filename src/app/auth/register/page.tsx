'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        else setUser(null);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Ошибка регистрации');
    } else {
      const role = data.user.user_metadata.role;
      console.log(role === 'admin')
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'staff') router.push('/staff/bookings');
      else router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1 className='dashboard-title'>Регистрация</h1 >
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
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
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      {user && (
        <div style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'flex-start',
          padding: '10px 20px'
        }}>
          <a
            href="/dashboard"
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
            ← В личный кабинет
          </a>
        </div>
      )}
    </div>
  );
}