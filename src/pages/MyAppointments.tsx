import React, { useState } from 'react';
import { format } from 'date-fns';
import { useAppointments, useDeleteAppointment, useAppointmentAction } from '../hooks/useAppointments';
import type { AppointmentAction } from '../hooks/useAppointments';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI } from '../services/api';
import type { Appointment, AppointmentStatus } from '../types';

const PAGE_SIZE = 10;
const EXPORT_BATCH_SIZE = 100;

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  Scheduled: 'Bekleyen',
  Confirmed: 'Onaylanan',
  Completed: 'Tamamlandı',
  Cancelled: 'İptal',
};

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Scheduled: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-green-100 text-green-800',
  Completed: 'bg-blue-100 text-blue-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const FILTER_OPTIONS: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tüm Randevular' },
  { value: 'Scheduled', label: 'Bekleyen' },
  { value: 'Confirmed', label: 'Onaylanan' },
  { value: 'Completed', label: 'Tamamlanan' },
  { value: 'Cancelled', label: 'İptal Edilen' },
];

const counterpartName = (appointment: Appointment, isStudent: boolean) =>
  isStudent ? appointment.advisorName : appointment.studentName;

const buildCsv = (appointments: Appointment[], isStudent: boolean) => {
  const header = ['Konu', isStudent ? 'Danışman' : 'Öğrenci', 'Başlangıç', 'Bitiş', 'Durum', 'Tür'];
  const rows = appointments.map((a) => [
    a.subject,
    counterpartName(a, isStudent),
    format(new Date(a.startTime), 'yyyy-MM-dd HH:mm'),
    format(new Date(a.endTime), 'yyyy-MM-dd HH:mm'),
    STATUS_LABELS[a.status],
    a.appointmentType,
  ]);

  // Semicolons and a BOM so Turkish Excel opens the file with the right separator and characters
  return '﻿' + [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n');
};

const MyAppointments: React.FC = () => {
  const { user } = useAuth();
  const isStudent = user?.role === 'Student';
  const isAdvisor = user?.role === 'Advisor';

  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  const listParams = {
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter === 'all' ? undefined : statusFilter,
  };
  const { data: appointments = [], isLoading } = useAppointments(listParams);
  const appointmentAction = useAppointmentAction();
  const deleteAppointment = useDeleteAppointment();

  const hasNextPage = appointments.length === PAGE_SIZE;

  const changeFilter = (value: AppointmentStatus | 'all') => {
    setStatusFilter(value);
    setPage(1);
  };

  const runAction = async (id: number, action: AppointmentAction, successText: string) => {
    setMessage(null);
    try {
      await appointmentAction.mutateAsync({ id, action });
      setMessage({ type: 'success', text: successText });
    } catch {
      setMessage({ type: 'error', text: 'İşlem gerçekleştirilemedi. Randevu durumu değişmiş olabilir.' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) return;

    setMessage(null);
    try {
      await deleteAppointment.mutateAsync(id);
      setMessage({ type: 'success', text: 'Randevu silindi.' });
    } catch {
      setMessage({ type: 'error', text: 'Randevu silinemedi.' });
    }
  };

  // Exports every appointment matching the current filter, not only the visible page
  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const all: Appointment[] = [];
      for (let p = 1; ; p++) {
        const batch = await appointmentsAPI.getAll({
          page: p,
          pageSize: EXPORT_BATCH_SIZE,
          status: statusFilter === 'all' ? undefined : statusFilter,
        });
        all.push(...batch);
        if (batch.length < EXPORT_BATCH_SIZE) break;
      }

      const blob = new Blob([buildCsv(all, isStudent)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `randevular-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: 'Dışa aktarma başarısız oldu.' });
    } finally {
      setExporting(false);
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
          <h1 className="text-4xl font-bold text-white mb-2">Randevularım</h1>
          <p className="text-xl text-blue-100">Tüm randevularınızı görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Filter and export */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => changeFilter(e.target.value as AppointmentStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {exporting ? 'Hazırlanıyor...' : 'CSV İndir'}
          </button>
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

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Randevu Listesi</h2>
          <p className="text-gray-600 mt-1">Sayfa {page} · {appointments.length} kayıt gösteriliyor</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Konu</th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {isStudent ? 'Danışman' : 'Öğrenci'}
                </th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Tarih & Saat</th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Durum</th>
                <th className="px-8 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-8 py-6">
                    <div className="text-lg font-semibold text-gray-900 mb-1">{appointment.subject}</div>
                    {appointment.description && (
                      <div className="text-sm text-gray-600 max-w-xs truncate">{appointment.description}</div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-gray-900">
                      {counterpartName(appointment, isStudent)}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(appointment.startTime), 'dd MMMM yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(appointment.startTime), 'HH:mm')} - {format(new Date(appointment.endTime), 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[appointment.status]}`}>
                      {STATUS_LABELS[appointment.status]}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {isAdvisor && appointment.status === 'Scheduled' && (
                        <>
                          <button
                            onClick={() => runAction(appointment.id, 'confirm', 'Randevu onaylandı.')}
                            disabled={appointmentAction.isPending}
                            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => runAction(appointment.id, 'cancel', 'Randevu reddedildi.')}
                            disabled={appointmentAction.isPending}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                          >
                            Reddet
                          </button>
                        </>
                      )}

                      {isAdvisor && appointment.status === 'Confirmed' && (
                        <button
                          onClick={() => runAction(appointment.id, 'complete', 'Randevu tamamlandı olarak işaretlendi.')}
                          disabled={appointmentAction.isPending}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          Tamamlandı
                        </button>
                      )}

                      {isStudent && (appointment.status === 'Scheduled' || appointment.status === 'Confirmed') && (
                        <button
                          onClick={() => runAction(appointment.id, 'cancel', 'Randevu iptal edildi.')}
                          disabled={appointmentAction.isPending}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          İptal Et
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(appointment.id)}
                        disabled={deleteAppointment.isPending}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
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

        {appointments.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Randevu bulunamadı</h3>
            <p className="text-gray-500">Seçilen kriterlere uygun randevu bulunmuyor.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-40"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-600">Sayfa {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-40"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
