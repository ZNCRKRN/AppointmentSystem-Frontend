import React, { useState } from 'react';
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from '../hooks/useAppointments';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const { data: appointments = [], isLoading } = useAppointments();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedStatus !== 'all' && appointment.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateAppointment.mutateAsync({ id, appointment: { status } as any });
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteAppointment.mutateAsync(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="w-full space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
        <div className="px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Randevularım
          </h1>
          <p className="text-xl text-blue-100">
            Tüm randevularınızı görüntüleyin ve yönetin
          </p>
        </div>
      </div>

      {/* Filter and Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
            >
              <option value="all">Tüm Randevular</option>
              <option value="Pending">Bekleyen</option>
              <option value="Confirmed">Onaylanan</option>
              <option value="Completed">Tamamlanan</option>
              <option value="Cancelled">İptal Edilen</option>
            </select>
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600">Bekleyen: {appointments.filter(a => a.status === 'Pending').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Onaylanan: {appointments.filter(a => a.status === 'Confirmed').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-gray-600">Tamamlanan: {appointments.filter(a => a.status === 'Completed').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Randevu Listesi</h2>
          <p className="text-gray-600 mt-1">Toplam {filteredAppointments.length} randevu</p>
        </div>
        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Konu
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {user?.roles.includes('Student') ? 'Danışman' : 'Öğrenci'}
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Tarih & Saat
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-8 py-6">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                          {appointment.subject}
                        </div>
                        {appointment.description && (
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {appointment.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {user?.roles.includes('Student') 
                              ? `${appointment.advisor?.firstName?.[0]}${appointment.advisor?.lastName?.[0]}`
                              : `${appointment.student?.firstName?.[0]}${appointment.student?.lastName?.[0]}`
                            }
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user?.roles.includes('Student') 
                              ? `${appointment.advisor?.firstName} ${appointment.advisor?.lastName}`
                              : `${appointment.student?.firstName} ${appointment.student?.lastName}`
                            }
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.roles.includes('Student') 
                              ? appointment.advisor?.department
                              : appointment.student?.studentNumber
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(appointment.startTime), 'dd MMMM yyyy', { locale: tr })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(appointment.startTime), 'HH:mm')} - {format(new Date(appointment.endTime), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status === 'Pending' && 'Bekleyen'}
                        {appointment.status === 'Confirmed' && 'Onaylanan'}
                        {appointment.status === 'Cancelled' && 'İptal'}
                        {appointment.status === 'Completed' && 'Tamamlandı'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        {user?.roles.includes('Advisor') && appointment.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'Confirmed')}
                              className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                              disabled={updateAppointment.isPending}
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(appointment.id, 'Cancelled')}
                              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                              disabled={updateAppointment.isPending}
                            >
                              Reddet
                            </button>
                          </>
                        )}
                        
                        {appointment.status === 'Confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(appointment.id, 'Completed')}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                            disabled={updateAppointment.isPending}
                          >
                            Tamamlandı
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                          disabled={deleteAppointment.isPending}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Randevu bulunamadı</h3>
              <p className="text-gray-500">Seçilen kriterlere uygun randevu bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;





