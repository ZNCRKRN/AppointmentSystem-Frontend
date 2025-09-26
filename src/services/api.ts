import axios from 'axios';
import type { 
  LoginRequest, 
  LoginResponse, 
  Appointment, 
  Advisor, 
  Student, 
  Availability,
  CreateAppointmentRequest,
  CreateAvailabilityRequest
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
    const response = await api.post('/Auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/Auth/register', userData);
    return response.data;
  },
};

// Appointments API
export const appointmentsAPI = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get('/Appointment');
    return response.data;
  },
  
  getById: async (id: number): Promise<Appointment> => {
    const response = await api.get(`/Appointment/${id}`);
    return response.data;
  },
  
  create: async (appointment: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await api.post('/Appointment', appointment);
    return response.data;
  },
  
  update: async (id: number, appointment: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.put(`/Appointment/${id}`, appointment);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Appointment/${id}`);
  },
};

// Advisors API
export const advisorsAPI = {
  getAll: async (): Promise<Advisor[]> => {
    const response = await api.get('/Advisor');
    return response.data;
  },
  
  getById: async (id: number): Promise<Advisor> => {
    const response = await api.get(`/Advisor/${id}`);
    return response.data;
  },
};

// Students API
export const studentsAPI = {
  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/Student');
    return response.data;
  },
  
  getById: async (id: number): Promise<Student> => {
    const response = await api.get(`/Student/${id}`);
    return response.data;
  },
};

// Availability API
export const availabilityAPI = {
  getAll: async (): Promise<Availability[]> => {
    const response = await api.get('/Availability');
    return response.data;
  },
  
  getByAdvisorId: async (advisorId: number): Promise<Availability[]> => {
    const response = await api.get(`/Availability/advisor/${advisorId}`);
    return response.data;
  },
  
  create: async (availability: CreateAvailabilityRequest): Promise<Availability> => {
    const response = await api.post('/Availability', availability);
    return response.data;
  },
  
  update: async (id: number, availability: Partial<Availability>): Promise<Availability> => {
    const response = await api.put(`/Availability/${id}`, availability);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/Availability/${id}`);
  },
};

export default api;





