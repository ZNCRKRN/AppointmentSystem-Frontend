import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityAPI } from '../services/api';
import type { CreateAvailabilityRequest } from '../types';

export const useAvailabilities = () => {
  return useQuery({
    queryKey: ['availabilities'],
    queryFn: availabilityAPI.getAll,
  });
};

// Free slots for an advisor on a given day ("yyyy-MM-dd"); used by the booking form
export const useAvailableSlots = (advisorId: number | null, date: string | null, durationMinutes = 30) => {
  return useQuery({
    queryKey: ['slots', advisorId, date, durationMinutes],
    queryFn: () => availabilityAPI.getSlots({ advisorId: advisorId!, date: date!, durationMinutes }),
    enabled: !!advisorId && !!date,
  });
};

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availability: CreateAvailabilityRequest) => availabilityAPI.create(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
};

export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => availabilityAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
};
