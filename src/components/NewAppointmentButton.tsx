import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NewAppointmentButtonProps {
  onClick: () => void;
}

// Only students book appointments; advisors and admins do not see the floating button
const NewAppointmentButton: React.FC<NewAppointmentButtonProps> = ({ onClick }) => {
  const { user } = useAuth();

  if (user?.role !== 'Student') return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg z-40"
      title="Yeni Randevu"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
};

export default NewAppointmentButton;
