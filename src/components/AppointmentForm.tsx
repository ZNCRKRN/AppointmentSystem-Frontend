import React, { useState } from 'react';
import { useAdvisors } from '../hooks/useAdvisors';
import { useCreateAppointment } from '../hooks/useAppointments';
import { format } from 'date-fns';

interface AppointmentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    advisorId: '',
    subject: '',
    description: '',
    startTime: '',
    endTime: '',
    appointmentType: 'Consultation',
  });

  const { data: advisors = [] } = useAdvisors();
  const createAppointment = useCreateAppointment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAppointment.mutateAsync({
        advisorId: parseInt(formData.advisorId),
        subject: formData.subject,
        description: formData.description || undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        appointmentType: formData.appointmentType,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Appointment creation failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-set end time when start time changes (1 hour later)
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime: startTime ? new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) : '',
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

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
                <option value="Consultation">Danışmanlık</option>
                <option value="Academic">Akademik</option>
                <option value="Career">Kariyer</option>
                <option value="Personal">Kişisel</option>
              </select>
            </div>

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





