'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/app/components/map'), { ssr: false });

type Review = {
  id: number;
  user_id: string;
  user_email: string;
  user_name: string;
  trip_id: number;
  comment: string;
  created_at: string;
};

export default function TripPage() {
  const params = useParams();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Состояния для формы бронирования
  const [date, setDate] = useState('');
  const [details, setDetails] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Состояния для комментариев
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Получаем trip, locations, userId и отзывы
  useEffect(() => {
    if (!tripId) return;

    setLoading(true);

    fetch(`/api/user/trips/${tripId}`)
      .then(res => res.json())
      .then(data => setTrip(Array.isArray(data) ? data[0] : data));

    fetch(`/api/user/locations?trip_id=${tripId}`)
      .then(res => res.json())
      .then(data => setLocations(Array.isArray(data) ? data : []));

    // Получаем отзывы
    fetch(`/api/user/reviews?trip_id=${tripId}`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []));

    // Получаем userId (через /api/auth/me)
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUserId(data?.user?.id || null))
      .finally(() => setLoading(false));
  }, [tripId]);

  // Форма бронирования
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    if (!date) {
      setFormError('Заполните дату');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          trip_id: tripId,
          trip_title: trip.title,
          details,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка бронирования');
      }
      setFormSuccess('Бронирование успешно создано!');
      setDate('');
      setDetails('');
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Форма добавления комментария
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewLoading(true);

    if (!reviewComment) {
      setReviewError('Комментарий не может быть пустым');
      setReviewLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: reviewComment,
          trip_id: tripId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка добавления комментария');
      }
      setReviewComment('');
      // Обновляем список отзывов
      fetch(`/api/user/reviews?trip_id=${tripId}`)
        .then(res => res.json())
        .then(data => setReviews(Array.isArray(data) ? data : []));
    } catch (e: any) {
      setReviewError(e.message);
    } finally {
      setReviewLoading(false);
    }
  };

  // Удаление комментария
  const handleDeleteReview = async (id: number) => {
    if (!confirm('Удалить комментарий?')) return;
    try {
      const res = await fetch(`/api/user/reviews/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка удаления');
      }
      setReviews(reviews.filter(r => r.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Начать редактирование
  const handleEditReview = (id: number, comment: string) => {
    setEditingReviewId(id);
    setEditingComment(comment);
  };

  // Сохранить редактирование
  const handleSaveEdit = async (id: number) => {
    try {
      const res = await fetch(`/api/user/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: editingComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка редактирования');
      }
      // Обновляем список отзывов
      fetch(`/api/user/reviews?trip_id=${tripId}`)
        .then(res => res.json())
        .then(data => setReviews(Array.isArray(data) ? data : []));
      setEditingReviewId(null);
      setEditingComment('');
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[300px]">Загрузка...</div>;
  if (!trip) return <div className="text-center text-red-600">Поездка не найдена</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8">
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-2">{trip.title}</h2>
        <p className="mb-2 text-gray-700">{trip.description}</p>
        <div className="flex flex-wrap gap-4 mb-4 text-gray-600">
          <span>Начало: <b>{new Date(trip.start_date).toLocaleDateString()}</b></span>
          <span>Окончание: <b>{new Date(trip.end_date).toLocaleDateString()}</b></span>
          <span>Цена: <b>{trip.price} тг.</b></span>
        </div>
        <div className="rounded-lg overflow-hidden border mb-4">
          <Map locations={locations} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Забронировать поездку</h3>
        <form onSubmit={handleBooking} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Дата:</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Детали:</label>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="border rounded px-3 py-2 w-full min-h-[60px]"
              placeholder="(необязательно)"
            />
          </div>
          {formError && <div className="text-red-600">{formError}</div>}
          {formSuccess && <div className="text-green-600">{formSuccess}</div>}
          <button
            type="submit"
            disabled={formLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold transition"
          >
            {formLoading ? 'Бронирование...' : 'Забронировать'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Комментарии</h3>
        {/* Форма добавления комментария */}
        <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3 mb-6">
          <textarea
            placeholder="Ваш комментарий"
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            required
            className="border rounded px-3 py-2 w-full min-h-[60px]"
          />
          {reviewError && <div className="text-red-600">{reviewError}</div>}
          <button
            type="submit"
            disabled={reviewLoading}
            className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-semibold transition w-fit"
          >
            {reviewLoading ? 'Отправка...' : 'Оставить комментарий'}
          </button>
        </form>

        {/* Список комментариев */}
        <div>
          {reviews.length === 0 ? (
            <div className="text-gray-500">Комментариев пока нет</div>
          ) : (
            <ul className="flex flex-col gap-4">
              {reviews.map(r => (
                <li key={r.id} className="border-b pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{r.user_name || r.user_email}</span>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  {editingReviewId === r.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editingComment}
                        onChange={e => setEditingComment(e.target.value)}
                        className="border rounded px-3 py-2 w-full min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(r.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-1 text-sm"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditingReviewId(null)}
                          className="bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 text-sm"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2">{r.comment}</div>
                  )}
                  {userId === r.user_id && editingReviewId !== r.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(r.id, r.comment)}
                        className="bg-yellow-400 hover:bg-yellow-500 rounded px-3 py-1 text-sm"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div style={{
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'flex-start',
        padding: '10px 20px',
      }}>
        <a
          href="/dashboard/trips"
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
          ← Маршруты
        </a>
      </div>
    </div>
  );
}