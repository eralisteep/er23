'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        const user = data.user;
        setRole(user?.user_metadata?.role || user?.role || null);
      });
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Личный кабинет</h1>
      <div className="dashboard-links">
        <a className="dashboard-link" href="/dashboard/trips">Маршруты</a>
        <a className="dashboard-link" href="/dashboard/bookings">Мои бронирование</a>
        <a className="dashboard-link" href="/auth/login">Войти под другим пользователем</a>
        <a className="dashboard-link" href="/auth/register">Зарегистрировать нового пользователя</a>
        {role === 'admin' && (
          <a className="dashboard-link dashboard-link-admin" href="/admin/dashboard">Админ-панель</a>
        )}
        {role === 'staff' && (
          <a className="dashboard-link dashboard-link-staff" href="/staff/dashboard">Панель сотрудника</a>
        )}
      </div>
    </div>
  );
}