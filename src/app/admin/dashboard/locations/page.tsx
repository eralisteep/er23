'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Location = {
  trip_id: number;
  name: string;
  lat: number;
  lng: number;
  order: number;
};

function LocationMarker({ setLatLng }: { setLatLng: (latLng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationsPage() {
  const [trips, setTrips] = useState<any[]>([]);
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

  // Update form lat/lng when latLng changes
  useEffect(() => {
    if (latLng) {
      setForm((prev) => ({
        ...prev,
        lat: latLng.lat.toString(),
        lng: latLng.lng.toString(),
      }));
    }
  }, [latLng]);

  useEffect(() => {
    fetch('/api/admin/trips')
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch(() => setTrips([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    // Проверка заполненности
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
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <h1 className='dashboard-title'>Добавить локацию</h1>
        <div>
          <label htmlFor="trip_id">Поездка:</label>
          <select
            id="trip_id"
            name="trip_id"
            value={form.trip_id}
            onChange={handleChange}
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
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="order">Порядковый номер:</label>
          <input
            id="order"
            name="order"
            value={form.order}
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            type="number"
            step="any"
            required
          />
        </div>
        <MapContainer center={[0, 0]} zoom={1} style={{ height: '400px' }}>
            <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker setLatLng={setlatLng} />
            {latLng && <Marker position={[latLng.lat, latLng.lng]} />}
        </MapContainer>
        {formError && <div style={{ color: 'red' }}>{formError}</div>}
        <button type="submit" disabled={formLoading}>
          {formLoading ? 'Добавление...' : 'Добавить'}
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
