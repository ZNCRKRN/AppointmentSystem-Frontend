// Shapes mirror the API DTOs (camelCase JSON).

export type Role = 'Admin' | 'Advisor' | 'Student';

// Appointment status values used by the API. "Scheduled" is the initial state.
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'Student' | 'Advisor';
  studentNumber?: string;
  department?: string;
  grade?: string;
  specialization?: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  studentNumber?: string | null;
  department?: string | null;
  grade?: string | null;
  specialization?: string | null;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  user: User;
}

export interface Appointment {
  id: number;
  advisorId: number;
  advisorName: string;
  studentId: number;
  studentName: string;
  subject: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  appointmentType: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  advisorId: number;
  subject: string;
  description?: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
}

export interface UpdateAppointmentRequest {
  subject?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  appointmentType?: string;
  notes?: string;
}

export interface AppointmentListParams {
  page?: number;
  pageSize?: number;
  status?: AppointmentStatus;
}

export interface Advisor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  specialization?: string | null;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  studentNumber: string;
  department: string;
  grade?: string | null;
}

export interface Availability {
  id: number;
  advisorId: number;
  advisorName: string;
  dayOfWeek: number; // 0 = Sunday
  startTime: string; // "HH:mm:ss"
  endTime: string;
  isRecurring: boolean;
  specificDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
  advisorId?: number; // set by an Admin creating availability on behalf of an advisor
}

export interface AvailableSlotsRequest {
  advisorId: number;
  date: string; // "yyyy-MM-dd"
  durationMinutes: number;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  department?: string | null;
}
