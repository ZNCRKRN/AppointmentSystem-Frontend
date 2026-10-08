import React, { useState } from 'react';
import { useAvailabilities, useAdvisorAvailabilities, useCreateAvailability, useDeleteAvailability } from '../hooks/useAvailability';
import { useAdvisors } from '../hooks/useAdvisors';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Availability: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  // Advisors see their own schedule; admins pick an advisor and can view, add to, or delete that schedule
  const [advisorChoice, setAdvisorChoice] = useState('');
  const { data: advisors = [] } = useAdvisors();
  const ownSchedule = useAvailabilities(!isAdmin);
  const advisorSchedule = useAdvisorAvailabilities(isAdmin && advisorChoice ? parseInt(advisorChoice, 10) : null);
  const availabilities = (isAdmin ? advisorSchedule.data : ownSchedule.data) ?? [];
  const isLoading = isAdmin ? !!advisorChoice && advisorSchedule.isLoading : ownSchedule.isLoading;
  const createAvailability = useCreateAvailability();
  const deleteAvailability = useDeleteAvailability();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true,
    specificDate: '',
  });

  const dayNames = [
    'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createAvailability.mutateAsync({
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isRecurring: formData.isRecurring,
        specificDate: formData.specificDate || undefined,
        advisorId: isAdmin ? parseInt(advisorChoice, 10) : undefined,
      });

      setShowForm(false);
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: true,
        specificDate: '',
      });
    } catch (error) {
      console.error('Availability creation failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu müsaitlik kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await deleteAvailability.mutateAsync(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Müsaitlik Saatleri
            </h3>
            {(!isAdmin || advisorChoice) && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Yeni Müsaitlik Ekle
              </button>
            )}
          </div>

          {isAdmin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Danışman</label>
              <select
                value={advisorChoice}
                onChange={(e) => setAdvisorChoice(e.target.value)}
                className="mt-1 block w-full sm:w-96 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Danışman seçin</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.firstName} {advisor.lastName} - {advisor.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saat Aralığı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availabilities.map((availability) => (
                  <tr key={availability.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {availability.isRecurring 
                          ? dayNames[availability.dayOfWeek]
                          : format(new Date(availability.specificDate!), 'dd MMMM yyyy', { locale: tr })
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {availability.startTime} - {availability.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        availability.isRecurring 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {availability.isRecurring ? 'Tekrarlanan' : 'Tek Seferlik'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(availability.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteAvailability.isPending}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {availabilities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">{isAdmin && !advisorChoice ? 'Müsaitliğini görmek için bir danışman seçin.' : 'Henüz müsaitlik saati eklenmemiş.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Yeni Müsaitlik Ekle
              </h3>
              {isAdmin && (
                <p className="text-sm text-gray-500 mb-3">
                  {advisors.find((a) => a.id === parseInt(advisorChoice, 10))?.firstName}{' '}
                  {advisors.find((a) => a.id === parseInt(advisorChoice, 10))?.lastName} adına ekleniyor
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tür
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        checked={formData.isRecurring}
                        onChange={() => setFormData(prev => ({ ...prev, isRecurring: true }))}
                        className="mr-2"
                      />
                      Tekrarlanan (Haftalık)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        checked={!formData.isRecurring}
                        onChange={() => setFormData(prev => ({ ...prev, isRecurring: false }))}
                        className="mr-2"
                      />
                      Tek Seferlik
                    </label>
                  </div>
                </div>

                {formData.isRecurring ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gün
                    </label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {dayNames.map((day, index) => (
                        <option key={index} value={index}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tarih
                    </label>
                    <input
                      type="date"
                      value={formData.specificDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, specificDate: e.target.value }))}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Başlangıç Saati
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bitiş Saati
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                    min={formData.startTime}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={createAvailability.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    {createAvailability.isPending ? 'Ekleniyor...' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;





