import React, { useState } from 'react';
import { useAdminUsers, useDeleteUser } from '../hooks/useAdmin';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types';

const ROLE_LABELS: Record<Role, string> = {
  Admin: 'Admin',
  Advisor: 'Danışman',
  Student: 'Öğrenci',
};

const ROLE_COLORS: Record<Role, string> = {
  Admin: 'bg-red-100 text-red-800',
  Advisor: 'bg-blue-100 text-blue-800',
  Student: 'bg-green-100 text-green-800',
};

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useAdminUsers();
  const deleteUser = useDeleteUser();
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const visibleUsers = users.filter((u) => roleFilter === 'all' || u.role === roleFilter);
  const count = (role: Role) => users.filter((u) => u.role === role).length;

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`${email} hesabı silinecek. Bu kullanıcının tüm randevuları da silinir. Emin misiniz?`)) return;

    setMessage(null);
    try {
      await deleteUser.mutateAsync(id);
      setMessage({ type: 'success', text: `${email} silindi.` });
    } catch (error: unknown) {
      const data = (error as { response?: { data?: unknown } }).response?.data;
      setMessage({ type: 'error', text: typeof data === 'string' ? data : 'Kullanıcı silinemedi.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500">Toplam Kullanıcı</dt>
          <dd className="text-2xl font-semibold text-gray-900">{users.length}</dd>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500">Danışman</dt>
          <dd className="text-2xl font-semibold text-gray-900">{count('Advisor')}</dd>
        </div>
        <div className="bg-white shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500">Öğrenci</dt>
          <dd className="text-2xl font-semibold text-gray-900">{count('Student')}</dd>
        </div>
      </div>

      {message && (
        <div
          role="status"
          className={`px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900">Kullanıcılar</h3>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="all">Tüm roller</option>
            <option value="Advisor">Danışman</option>
            <option value="Student">Öğrenci</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bölüm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {u.firstName || u.lastName ? `${u.firstName} ${u.lastName}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.department || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={isSelf || deleteUser.isPending}
                        title={isSelf ? 'Kendi hesabınızı silemezsiniz' : 'Hesabı sil'}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {visibleUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Bu filtrede kullanıcı yok.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
