'use client';

export default function StaffDashboard() {
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Панель сотрудника</h1>
            <div className="dashboard-links">
                <a className="dashboard-link" href="/staff/dashboard/bookings">Управление бронированиями</a>
                <a className="dashboard-link" href="/dashboard">Личный кабинет</a>
            </div>
        </div>
    );
}