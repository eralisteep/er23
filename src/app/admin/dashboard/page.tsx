'use client';

export default function AdminDashboard() {
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Админ-панель</h1>
            <div className="dashboard-links">
                <a className="dashboard-link" href="/admin/dashboard/register">Добавление новых пользователей</a>
                <a className="dashboard-link" href="/admin/dashboard/trips">Управление маршрутами</a>
                <a className="dashboard-link" href="/admin/dashboard/locations">Управление точками маршрута</a>
                <a className="dashboard-link" href="/admin/dashboard/users">Изменить роли пользователей</a>
                <a className="dashboard-link" href="/dashboard">Личный кабинет</a>
            </div>
        </div>
    );
}