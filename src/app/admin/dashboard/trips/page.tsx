'use client';

import { useState } from 'react';

export default function CreateTripPage() {
  const [form, setForm] = useState({
    user_id: '',
    start_date: '',
    end_date: '',
    price: '',
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const res = await fetch('/api/admin/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Ошибка создания поездки');
    } else {
      setSuccess('Поездка успешно создана!');
      setForm({
        user_id: '',
        start_date: '',
        end_date: '',
        price: '',
        title: '',
        description: '',
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h1 className='dashboard-title'>Создать поездку</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Дата начала:</label>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Дата окончания:</label>
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Цена:</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Заголовок:</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Описание:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать'}
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