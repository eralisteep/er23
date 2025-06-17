'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    </div>
  );
}