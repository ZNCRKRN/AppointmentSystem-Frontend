import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
    } finally {
      // The API answers the same way for known and unknown emails, so always show the same message
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h2>
          <p className="text-gray-600">Hesabınızın e-posta adresini girin, sıfırlama bağlantısı gönderelim.</p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
            E-posta adresiniz sistemde kayıtlıysa sıfırlama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol edin.
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Adresi
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ornek@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-800">
            Giriş ekranına dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
