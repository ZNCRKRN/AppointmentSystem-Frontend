import React, { useState } from 'react';
import { useAdvisors } from '../hooks/useAdvisors';
import { useCreateAppointment } from '../hooks/useAppointments';
import { useAvailableSlots } from '../hooks/useAvailability';
import { addMinutes, format } from 'date-fns';

interface AppointmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const APPOINTMENT_MINUTES = 60;

// datetime-local value format; built from local time so it matches what the user sees
const toLocalInput = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

const APPOINTMENT_TYPES = [
  { value: 'Consultation', label: 'Danışmanlık' },
  { value: 'Academic', label: 'Akademik' },
  { value: 'Career', label: 'Kariyer' },
  { value: 'Personal', label: 'Kişisel' },
];

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    advisorId: '',
    subject: '',
    description: '',
    startTime: '',
    endTime: '',
    appointmentType: 'Consultation',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const { data: advisors = [] } = useAdvisors();
  const createAppointment = useCreateAppointment();

  const advisorId = formData.advisorId ? parseInt(formData.advisorId, 10) : null;
  const selectedDay = formData.startTime ? formData.startTime.slice(0, 10) : null;
  const { data: slots = [], isFetching: slotsLoading } = useAvailableSlots(advisorId, selectedDay, APPOINTMENT_MINUTES);
  const freeSlots = slots.filter((slot) => slot.isAvailable);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await createAppointment.mutateAsync({
        advisorId: parseInt(formData.advisorId, 10),
        subject: formData.subject,
        description: formData.description || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        appointmentType: formData.appointmentType,
      });

      onSuccess();
      onClose();
    } catch (error: unknown) {
      const data = (error as { response?: { data?: unknown } }).response?.data;
      // Validation errors from the API arrive as plain text or as a ModelState object
      if (typeof data === 'string') {
        setErrorMessage(data);
      } else {
        setErrorMessage('Randevu oluşturulamadı. Seçilen saat dolu veya geçersiz olabilir.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Ending time follows the start time by the default appointment length
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime: startTime
        ? toLocalInput(addMinutes(new Date(startTime), APPOINTMENT_MINUTES))
        : '',
    }));
  };

  const pickSlot = (startIso: string, endIso: string) => {
    setFormData(prev => ({
      ...prev,
      startTime: toLocalInput(new Date(startIso)),
      endTime: toLocalInput(new Date(endIso)),
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Yeni Randevu Oluştur
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Danışman
              </label>
              <select
                name="advisorId"
                value={formData.advisorId}
                onChange={handleChange}
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
              <label className="block text-sm font-medium text-gray-700">
                Konu
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                maxLength={200}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Randevu konusu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Detaylar (opsiyonel)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Başlangıç Zamanı
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleStartTimeChange}
                required
                min={toLocalInput(new Date())}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Free slots of the selected advisor on the selected day */}
            {advisorId && selectedDay && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Müsait saatler</p>
                {slotsLoading ? (
                  <p className="text-sm text-gray-500">Yükleniyor...</p>
                ) : freeSlots.length === 0 ? (
                  <p className="text-sm text-gray-500">Bu tarihte müsait saat bulunmuyor.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                    {freeSlots.map((slot) => {
                      const isChosen = formData.startTime === toLocalInput(new Date(slot.startTime));
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => pickSlot(slot.startTime, slot.endTime)}
                          className={`px-2 py-1 text-xs rounded-md border ${
                            isChosen
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                          }`}
                        >
                          {format(new Date(slot.startTime), 'HH:mm')}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bitiş Zamanı
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                min={formData.startTime}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Randevu Türü
              </label>
              <select
                name="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {APPOINTMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={createAppointment.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                {createAppointment.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
