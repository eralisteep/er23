'use client';

import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

const LocationMap = dynamic(() => import('@/app/components/clickableMap'), {
  ssr: false,
});

type Location = {
  id: number;
  trip_id: number;
  name: string;
  lat: number;
  lng: number;
  order: number;
};

export default function LocationsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState({
    trip_id: '',
    name: '',
    lat: '',
    lng: '',
    order: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [latLng, setlatLng] = useState<{ lat: number; lng: number } | null>(null);

  // Для редактирования
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    trip_id: '',
    name: '',
    lat: '',
    lng: '',
    order: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Получение trips и locations
  useEffect(() => {
    fetch('/api/admin/trips')
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch(() => setTrips([]));

    fetch('/api/admin/locations')
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch(() => setLocations([]));
  }, []);

  // Добавление новой локации
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!form.trip_id || !form.name || !form.lat || !form.lng || !form.order) {
      setFormError('Заполните все поля');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: Number(form.trip_id),
          name: form.name,
          lat: Number(form.lat),
          lng: Number(form.lng),
          order: Number(form.order),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка добавления');
      }
      setForm({ trip_id: form.trip_id, name: '', lat: '', lng: '', order: '' });
      // Обновить список
      fetch('/api/admin/locations')
        .then((res) => res.json())
        .then((data) => setLocations(data));
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Удаление локации
  const handleDelete = async (id: number) => {
    if (!confirm('Удалить локацию?')) return;
    await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' });
    setLocations(locations.filter((l) => l.id !== id));
  };

  // Начать редактирование
  const handleEdit = (loc: Location) => {
    setEditId(loc.id);
    setEditForm({
      trip_id: String(loc.trip_id),
      name: loc.name,
      lat: String(loc.lat),
      lng: String(loc.lng),
      order: String(loc.order),
    });
    setEditError(null);
  };

  // Сохранить изменения
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await fetch(`/api/admin/locations/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: Number(editForm.trip_id),
          name: editForm.name,
          lat: Number(editForm.lat),
          lng: Number(editForm.lng),
          order: Number(editForm.order),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка редактирования');
      }
      // Обновить список
      fetch('/api/admin/locations')
        .then((res) => res.json())
        .then((data) => setLocations(data));
      setEditId(null);
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Вместо setlatLng используйте универсальную функцию:
  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    if (editId !== null) {
      setEditForm((prev) => ({
        ...prev,
        lat: latlng.lat.toString(),
        lng: latlng.lng.toString(),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        lat: latlng.lat.toString(),
        lng: latlng.lng.toString(),
      }));
    }
    setlatLng(latlng);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <h1 className='dashboard-title'>Добавить локацию</h1>
        <div>
          <label htmlFor="trip_id">Поездка:</label>
          <select
            id="trip_id"
            name="trip_id"
            value={form.trip_id}
            onChange={e => setForm({ ...form, trip_id: e.target.value })}
            required
          >
            <option value="">Выберите поездку</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="name">Название:</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="order">Порядковый номер:</label>
          <input
            id="order"
            name="order"
            value={form.order}
            onChange={e => setForm({ ...form, order: e.target.value })}
            type="number"
            step="any"
            required
          />
        </div>
        <div>
          <label htmlFor="lat">Широта:</label>
          <input
            id="lat"
            name="lat"
            value={form.lat}
            onChange={e => setForm({ ...form, lat: e.target.value })}
            type="number"
            step="any"
            required
          />
        </div>
        <div>
          <label htmlFor="lng">Долгота:</label>
          <input
            id="lng"
            name="lng"
            value={form.lng}
            onChange={e => setForm({ ...form, lng: e.target.value })}
            type="number"
            step="any"
            required
          />
        </div>
        <LocationMap latLng={latLng} setLatLng={handleMapClick} />
        {formError && <div style={{ color: 'red' }}>{formError}</div>}
        <button type="submit" disabled={formLoading}>
          {formLoading ? 'Добавление...' : 'Добавить'}
        </button>
      </form>

      <h2 className="dashboard-title" style={{ marginTop: 40 }}>Список локаций</h2>
      <table style={{ width: '100%', marginBottom: 32 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Поездка</th>
            <th>Название</th>
            <th>Широта</th>
            <th>Долгота</th>
            <th>Порядок</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {locations.map(loc =>
            editId === loc.id ? (
              <tr key={loc.id} style={{ background: '#222' }}>
                <td>{loc.id}</td>
                <td>
                  <select
                    value={editForm.trip_id}
                    onChange={e => setEditForm({ ...editForm, trip_id: e.target.value })}
                  >
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={editForm.lat}
                    onChange={e => setEditForm({ ...editForm, lat: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={editForm.lng}
                    onChange={e => setEditForm({ ...editForm, lng: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={editForm.order}
                    onChange={e => setEditForm({ ...editForm, order: e.target.value })}
                  />
                </td>
                <td>
                  <button onClick={handleEditSave} disabled={editLoading}>Сохранить</button>
                  <button onClick={() => setEditId(null)} style={{ marginLeft: 8 }}>Отмена</button>
                  {editError && <div style={{ color: 'red' }}>{editError}</div>}
                </td>
              </tr>
            ) : (
              <tr key={loc.id}>
                <td>{loc.id}</td>
                <td>{trips.find(t => t.id === loc.trip_id)?.title || loc.trip_id}</td>
                <td>{loc.name}</td>
                <td>{loc.lat}</td>
                <td>{loc.lng}</td>
                <td>{loc.order}</td>
                <td>
                  <button onClick={() => handleEdit(loc)} style={{ marginRight: 8 }}>Редактировать</button>
                  <button onClick={() => handleDelete(loc.id)}>Удалить</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
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
