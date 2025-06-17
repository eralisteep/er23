'use client';

import { useEffect, useState } from 'react';

type Booking = {
  id: number;
  trip_id: number;
  trip_title: string;
  date: string;
  details: string;
  created_at: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user/bookings');
      if (!res.ok) throw new Error('Ошибка загрузки бронирований');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id: number) => {
    setDeleteError('');
    setDeletingId(id);
    try {
      const res = await fetch(`/api/user/bookings/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка удаления');
      }
      setBookings(bookings.filter(b => b.id !== id));
    } catch (e: any) {
      setDeleteError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Мои бронирования</h1>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">Загрузка...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : bookings.length === 0 ? (
        <>
          <div className="text-gray-500 mb-4">Нет бронирований</div>
          <a className="dashboard-link" href="/dashboard/trips">Забронировать поездку</a>
        </>
      ) : (
        <div className="flex flex-col gap-6">
          {bookings.map(b => (
            <div
              key={b.id}
              className="bg-[#181818] border border-[#2e86de] rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg transition"
              style={{ cursor: 'pointer' }}
              onClick={() => window.location.href = `/dashboard/trips/${b.trip_id}`}
            >
              <div className="flex-1">
                <div className="font-bold text-lg text-[#5dade2] mb-1">{b.trip_title}</div>
                <div className="text-gray-400 text-sm mb-1">
                  Дата: <span className="text-white">{b.date}</span>
                </div>
                {b.details && (
                  <div className="text-gray-300 text-sm mb-1">
                    Детали: <span className="text-white">{b.details}</span>
                  </div>
                )}
                <div className="text-gray-500 text-xs">
                  Создано: {new Date(b.created_at).toLocaleString()}
                </div>
              </div>
              <div>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 font-semibold transition"
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(b.id);
                  }}
                  disabled={deletingId === b.id}
                >
                  {deletingId === b.id ? 'Отмена...' : 'Отменить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {deleteError && <div style={{ color: 'red', marginTop: 10 }}>{deleteError}</div>}
    </div>
  );
}