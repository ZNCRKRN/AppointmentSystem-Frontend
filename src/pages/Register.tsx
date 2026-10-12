import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterRequest } from '../types';

const initialForm: RegisterRequest = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  role: 'Student',
  studentNumber: '',
  department: '',
  grade: '',
  specialization: '',
};

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterRequest>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingMessage, setPendingMessage] = useState('');

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const setField = (field: keyof RegisterRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPendingMessage('');

    try {
      const response = await register(form);
      if ('pending' in response) {
        setPendingMessage(response.message);
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } }).response?.data;
      if (typeof data === 'string') {
        setError(data);
      } else if (data && typeof data === 'object' && 'errors' in data) {
        // ASP.NET model validation errors: { errors: { Field: ["message"] } }
        const errors = (data as { errors: Record<string, string[]> }).errors;
        setError(Object.values(errors).flat().join(' '));
      } else {
        setError('Kayıt başarısız. Bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Hesap Oluştur</h2>
          <p className="text-lg text-gray-600">Randevu Sistemi'ne kaydolun</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {pendingMessage ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                {pendingMessage}
              </div>
              <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800">
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: 'Student' }))}
                  className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
                    form.role === 'Student'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Öğrenci
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: 'Advisor' }))}
                  className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
                    form.role === 'Advisor'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Danışman
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                <input
                  id="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.firstName}
                  onChange={setField('firstName')}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                <input
                  id="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.lastName}
                  onChange={setField('lastName')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Adresi</label>
              <input
                id="email"
                type="email"
                required
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={form.email}
                onChange={setField('email')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="En az 6 karakter"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.password}
                  onChange={setField('password')}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Şifre Tekrar</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                />
              </div>
            </div>

            {form.role === 'Student' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700 mb-2">Öğrenci No</label>
                  <input
                    id="studentNumber"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.studentNumber}
                    onChange={setField('studentNumber')}
                  />
                </div>
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">Sınıf</label>
                  <input
                    id="grade"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.grade}
                    onChange={setField('grade')}
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Bölüm</label>
                  <input
                    id="department"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.department}
                    onChange={setField('department')}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Bölüm</label>
                  <input
                    id="department"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.department}
                    onChange={setField('department')}
                  />
                </div>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık</label>
                  <input
                    id="specialization"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={form.specialization}
                    onChange={setField('specialization')}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </form>
          )}
        </div>

        <div className="text-center">
          <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800">
            Zaten hesabınız var mı? Giriş yapın
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
