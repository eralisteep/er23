'use client';

import { useEffect, useState } from 'react';

type Trip = {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  price: number;
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Omit<Trip, 'id'>>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    price: 0,
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Для редактирования
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<Trip, 'id'>>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    price: 0,
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Получение списка маршрутов
  useEffect(() => {
    fetch('/api/admin/trips')
      .then(res => res.json())
      .then(data => {
        setTrips(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки маршрутов');
        setLoading(false);
      });
  }, []);

  // Создание новой маршрута
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    if (!form.title || !form.description || !form.start_date || !form.end_date || !form.price) {
      setFormError('Заполните все поля');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка создания маршрута');
      }
      setFormSuccess('маршрут успешно создана!');
      setForm({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        price: 0,
      });
      // Обновить список
      fetch('/api/admin/trips')
        .then(res => res.json())
        .then(data => setTrips(Array.isArray(data) ? data : []));
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Начать редактирование
  const handleEdit = (trip: Trip) => {
    setEditId(trip.id);
    setEditForm({
      title: trip.title,
      description: trip.description,
      start_date: trip.start_date,
      end_date: trip.end_date,
      price: trip.price,
    });
    setEditError('');
  };

  // Сохранить изменения
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    try {
      const res = await fetch(`/api/admin/trips/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка редактирования');
      }
      // Обновить список
      fetch('/api/admin/trips')
        .then(res => res.json())
        .then(data => setTrips(Array.isArray(data) ? data : []));
      setEditId(null);
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Удаление маршрута
  const handleDelete = async (id: number) => {
    if (!confirm('Удалить маршрут?')) return;
    try {
      const res = await fetch(`/api/admin/trips/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка удаления');
      }
      setTrips(trips.filter(trip => trip.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <h1 className="dashboard-title">Управление маршрутами</h1>
      {/* Форма создания */}
      <form onSubmit={handleCreate} style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Создать маршрут</h2>
        <div>
          <label>Заголовок:</label>
          <input
            name="title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label>Описание:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />
        </div>
        <div>
          <label>Дата начала:</label>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <label>Дата окончания:</label>
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <label>Цена:</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
            required
          />
        </div>
        {formError && <div style={{ color: 'red', marginTop: 10 }}>{formError}</div>}
        {formSuccess && <div style={{ color: 'green', marginTop: 10 }}>{formSuccess}</div>}
        <button type="submit" disabled={formLoading}>
                    {formLoading ? 'Создание...' : 'Создать'}
        </button>
      </form>

      {/* Таблица trips */}
      <h2 className="dashboard-title" style={{ marginTop: 40 }}>Список маршрутов</h2>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', marginBottom: 32 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Заголовок</th>
              <th>Описание</th>
              <th>Начало</th>
              <th>Окончание</th>
              <th>Цена</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip =>
              editId === trip.id ? (
                <tr key={trip.id} style={{ background: '#222' }}>
                  <td>{trip.id}</td>
                  <td>
                    <input
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </td>
                  <td>
                    <textarea
                      value={editForm.description}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={e => setEditForm(f => ({ ...f, start_date: e.target.value }))}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={e => setEditForm(f => ({ ...f, end_date: e.target.value }))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))}
                    />
                  </td>
                  <td>
                    <button onClick={handleEditSave} disabled={editLoading}>Сохранить</button>
                    <button onClick={() => setEditId(null)} style={{ marginLeft: 8 }}>Отмена</button>
                    {editError && <div style={{ color: 'red' }}>{editError}</div>}
                  </td>
                </tr>
              ) : (
                <tr key={trip.id}>
                  <td>{trip.id}</td>
                  <td>{trip.title}</td>
                  <td>{trip.description}</td>
                  <td>{trip.start_date}</td>
                  <td>{trip.end_date}</td>
                  <td>{trip.price}</td>
                  <td>
                    <button onClick={() => handleEdit(trip)} style={{ marginRight: 8 }}>Редактировать</button>
                    <button onClick={() => handleDelete(trip.id)}>Удалить</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
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