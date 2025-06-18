'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at?: string;
};

const ROLES = ['user', 'staff', 'admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>('user');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Получение списка пользователей
  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/register')
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Ошибка загрузки пользователей');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Начать редактирование роли
  const handleEdit = (user: User) => {
    setEditId(user.id);
    setEditRole(user.role);
    setEditError('');
  };

  // Сохранить роль
  const handleEditSave = async () => {
    setEditLoading(true);
    setEditError('');
    try {
      const res = await fetch(`/api/admin/register/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка изменения роли');
      }
      fetchUsers();
      setEditId(null);
    } catch (e: any) {
      setEditError(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24 }}>
      <h1 className="dashboard-title">Пользователи</h1>
      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', marginBottom: 32 }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Роль</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user =>
              editId === user.id ? (
                <tr key={user.id} style={{ background: '#222' }}>
                  <td>{user.email}</td>
                  <td>{user.name || ''}</td>
                  <td>
                    <select
                      value={editRole}
                      onChange={e => setEditRole(e.target.value)}
                      style={{ minWidth: 90 }}
                    >
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td>
                  <td>
                    <button onClick={handleEditSave} disabled={editLoading}>Сохранить</button>
                    <button onClick={() => setEditId(null)} style={{ marginLeft: 8 }}>Отмена</button>
                    {editError && <div style={{ color: 'red' }}>{editError}</div>}
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.name || ''}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => handleEdit(user)}>Изменить роль</button>
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