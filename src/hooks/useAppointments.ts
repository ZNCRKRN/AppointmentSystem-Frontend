import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI } from '../services/api';
import type { AppointmentListParams, CreateAppointmentRequest, UpdateAppointmentRequest } from '../types';

export const useAppointments = (params?: AppointmentListParams) => {
  return useQuery({
    queryKey: ['appointments', params ?? {}],
    queryFn: () => appointmentsAPI.getAll(params),
  });
};

export const useAppointment = (id: number) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointment: CreateAppointmentRequest) => appointmentsAPI.create(appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, appointment }: { id: number; appointment: UpdateAppointmentRequest }) =>
      appointmentsAPI.update(id, appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => appointmentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// Status transitions: confirm (advisor), cancel (student or advisor), complete (advisor)
export type AppointmentAction = 'confirm' | 'cancel' | 'complete';

export const useAppointmentAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: AppointmentAction }) => {
      switch (action) {
        case 'confirm':
          return appointmentsAPI.confirm(id);
        case 'cancel':
          return appointmentsAPI.cancel(id);
        case 'complete':
          return appointmentsAPI.complete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
