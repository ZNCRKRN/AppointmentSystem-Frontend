import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../contexts/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'tr': tr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: appointments = [], isLoading } = useAppointments();

  const events = appointments.map(appointment => ({
    id: appointment.id,
    title: `${appointment.subject} - ${appointment.advisor?.firstName} ${appointment.advisor?.lastName}`,
    start: new Date(appointment.startTime),
    end: new Date(appointment.endTime),
    resource: appointment,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
        <div className="px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hoş geldiniz, {user?.email}!
          </h1>
          <p className="text-xl text-indigo-100">
            Randevu sisteminize hoş geldiniz. Aşağıdan randevularınızı görüntüleyebilir ve yönetebilirsiniz.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Toplam Randevu</h4>
              <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Onaylanan</h4>
              <p className="text-3xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'Confirmed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Bekleyen</h4>
              <p className="text-3xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Tamamlanan</h4>
              <p className="text-3xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'Completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Randevu Takvimi</h2>
          <p className="text-gray-600 mt-1">Randevularınızı takvim görünümünde görüntüleyin</p>
        </div>
        <div className="p-8">
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              culture="tr"
              messages={{
                next: 'Sonraki',
                previous: 'Önceki',
                today: 'Bugün',
                month: 'Ay',
                week: 'Hafta',
                day: 'Gün',
                agenda: 'Ajanda',
                date: 'Tarih',
                time: 'Saat',
                event: 'Randevu',
                noEventsInRange: 'Bu aralıkta randevu yok.',
              }}
              onSelectEvent={(event) => {
                alert(`Randevu: ${event.title}`);
              }}
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





