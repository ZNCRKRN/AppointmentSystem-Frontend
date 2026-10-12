import React, { useState } from 'react';
import { useAdvisors } from '../hooks/useAdvisors';
import { useCreateAppointment } from '../hooks/useAppointments';
import { useAvailableSlots } from '../hooks/useAvailability';
import { format } from 'date-fns';
import type { AvailableSlot } from '../types';

interface AppointmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const APPOINTMENT_MINUTES = 60;

const APPOINTMENT_TYPES = [
  { value: 'Consultation', label: 'Danışmanlık' },
  { value: 'Academic', label: 'Akademik' },
  { value: 'Career', label: 'Kariyer' },
  { value: 'Personal', label: 'Kişisel' },
];

const todayInput = () => format(new Date(), 'yyyy-MM-dd');
const tomorrowInput = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return format(d, 'yyyy-MM-dd');
};

// Local "yyyy-MM-ddTHH:mm" string for the API (no timezone suffix, same as before)
const toApiLocal = (isoLike: string) => format(new Date(isoLike), "yyyy-MM-dd'T'HH:mm");

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onClose, onSuccess }) => {
  // Step 1: advisor and day. Step 2: pick a free time in the grid. Step 3: details.
  const [advisorId, setAdvisorId] = useState('');
  const [day, setDay] = useState(tomorrowInput());
  const [selected, setSelected] = useState<AvailableSlot | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [appointmentType, setAppointmentType] = useState('Consultation');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: advisors = [] } = useAdvisors();
  const createAppointment = useCreateAppointment();

  const advisorNumber = advisorId ? parseInt(advisorId, 10) : null;
  const { data: slots = [], isFetching: slotsLoading } = useAvailableSlots(advisorNumber, day, APPOINTMENT_MINUTES);

  const changeAdvisor = (value: string) => {
    setAdvisorId(value);
    setSelected(null);
  };

  const changeDay = (value: string) => {
    setDay(value);
    setSelected(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || advisorNumber === null) return;

    setErrorMessage('');
    try {
      await createAppointment.mutateAsync({
        advisorId: advisorNumber,
        subject,
        description: description || undefined,
        startTime: toApiLocal(selected.startTime),
        endTime: toApiLocal(selected.endTime),
        appointmentType,
      });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const data = (error as { response?: { data?: unknown } }).response?.data;
      if (typeof data === 'string') {
        setErrorMessage(data);
      } else {
        setErrorMessage('Randevu oluşturulamadı. Seçilen saat dolu olabilir, lütfen başka bir saat seçin.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-6 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mb-10">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Yeni Randevu Oluştur</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">1. Danışman</label>
              <select
                value={advisorId}
                onChange={(e) => changeAdvisor(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Danışman seçin</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.firstName} {advisor.lastName} - {advisor.department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gün</label>
              <input
                type="date"
                value={day}
                min={todayInput()}
                onChange={(e) => changeDay(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Step 2: the advisor's day as a table of times */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">2. Saat seçin</p>
            {!advisorNumber ? (
              <p className="text-sm text-gray-500">Önce bir danışman seçin.</p>
            ) : slotsLoading ? (
              <p className="text-sm text-gray-500">Müsaitlik yükleniyor...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-500">Bu danışmanın bu gün için müsaitlik saati yok.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                  {slots.map((slot) => {
                    const isSelected = selected?.startTime === slot.startTime;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setSelected(slot)}
                        title={slot.isAvailable ? 'Boş' : 'Dolu'}
                        className={`w-16 py-2 text-sm rounded-md border font-medium ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : slot.isAvailable
                              ? 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed'
                        }`}
                      >
                        {format(new Date(slot.startTime), 'HH:mm')}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Yeşil boş, gri dolu. Seçilen randevu {APPOINTMENT_MINUTES} dakika sürer.
                </p>
              </>
            )}
            {selected && (
              <p className="text-sm text-indigo-700 mt-2">
                Seçilen: {format(new Date(selected.startTime), 'dd.MM.yyyy HH:mm')} - {format(new Date(selected.endTime), 'HH:mm')}
              </p>
            )}
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">3. Konu</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={200}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Randevu konusu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Randevu Türü</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {APPOINTMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={1000}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-y"
              placeholder="Detaylar (opsiyonel)"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">{errorMessage}</div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={!selected || !subject || createAppointment.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
            >
              {createAppointment.isPending ? 'Oluşturuluyor...' : 'Randevu Talep Et'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
