import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  Appointment,
  AppointmentListParams,
  UpdateAppointmentRequest,
  Advisor,
  Student,
  Availability,
  CreateAppointmentRequest,
  CreateAvailabilityRequest,
  AvailableSlot,
  AvailableSlotsRequest,
} from '../types';

const API_BASE_URL = 'http://localhost:5249/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/Auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/Auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/Auth/forgot-password', { email });
  },

  resetPassword: async (request: ResetPasswordRequest): Promise<void> => {
    await api.post('/Auth/reset-password', request);
  },
};

// Appointments API
export const appointmentsAPI = {
  getAll: async (params?: AppointmentListParams): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/Appointment', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/Appointment/${id}`);
    return response.data;
  },

  create: async (appointment: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await api.post<Appointment>('/Appointment', appointment);
    return response.data;
  },

  update: async (id: number, appointment: UpdateAppointmentRequest): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/Appointment/${id}`, appointment);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Appointment/${id}`);
  },

  confirm: async (id: number): Promise<void> => {
    await api.post(`/Appointment/${id}/confirm`);
  },

  cancel: async (id: number): Promise<void> => {
    await api.post(`/Appointment/${id}/cancel`);
  },

  complete: async (id: number): Promise<void> => {
    await api.post(`/Appointment/${id}/complete`);
  },
};

// Advisors API
export const advisorsAPI = {
  getAll: async (): Promise<Advisor[]> => {
    const response = await api.get<Advisor[]>('/Advisor');
    return response.data;
  },

  getById: async (id: number): Promise<Advisor> => {
    const response = await api.get<Advisor>(`/Advisor/${id}`);
    return response.data;
  },
};

// Students API (list is admin-only)
export const studentsAPI = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get<Student[]>('/Student');
    return response.data;
  },
};

// Availability API (advisor-owned schedule and slot lookup)
export const availabilityAPI = {
  getAll: async (): Promise<Availability[]> => {
    const response = await api.get<Availability[]>('/Availability');
    return response.data;
  },

  create: async (availability: CreateAvailabilityRequest): Promise<Availability> => {
    const response = await api.post<Availability>('/Availability', availability);
    return response.data;
  },

  update: async (id: number, availability: Partial<CreateAvailabilityRequest>): Promise<Availability> => {
    const response = await api.put<Availability>(`/Availability/${id}`, availability);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/Availability/${id}`);
  },

  getSlots: async (request: AvailableSlotsRequest): Promise<AvailableSlot[]> => {
    const response = await api.post<AvailableSlot[]>('/Availability/available-slots', request);
    return response.data;
  },
};

export default api;
