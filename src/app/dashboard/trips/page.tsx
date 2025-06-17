'use client';

import { useEffect, useState } from 'react';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/user/trips')
      .then(res => res.json())
      .then(data => {
        setTrips(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки поездок');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-[200px]">Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Поездки</h2>
      <div style={{ width: '100%' }}>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 24, padding: 0, listStyle: 'none', justifyContent: 'center' }}>
          {trips.map((trip: any) => (
            <li
              key={trip.id}
              style={{
                flex: '1 1 260px',
                minWidth: 260,
                maxWidth: 340,
                background: '#181818',
                borderRadius: 14,
                boxShadow: '0 2px 12px 0 rgba(46,134,222,0.08)',
                margin: 0,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1.5px solid #2e86de',
                transition: 'box-shadow 0.2s, border 0.2s',
              }}
            >
              <a
                href={`trips/${trip.id}`}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'block',
                  height: '100%',
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ fontSize: '1.2rem', color: '#5dade2' }}>{trip.title}</strong>
                  <div style={{ color: '#aaa', fontSize: 14, margin: '8px 0' }}>
                    {trip.start_date} — {trip.end_date}
                  </div>
                  <div style={{ fontWeight: 500, color: '#2e86de', fontSize: 18 }}>
                    {trip.price} тг.
                  </div>
                </div>
                <div style={{ marginTop: 16, textAlign: 'right' }}>
                  <span
                    style={{
                      background: '#2e86de',
                      color: '#fff',
                      borderRadius: 6,
                      padding: '6px 16px',
                      fontWeight: 600,
                      fontSize: 15,
                      transition: 'background 0.2s',
                    }}
                  >
                    Подробнее →
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
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
    </div>
  );
}