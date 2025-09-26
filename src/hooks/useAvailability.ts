import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityAPI } from '../services/api';
import { Availability, CreateAvailabilityRequest } from '../types';

export const useAvailabilities = () => {
  return useQuery({
    queryKey: ['availabilities'],
    queryFn: availabilityAPI.getAll,
  });
};

export const useAdvisorAvailabilities = (advisorId: number) => {
  return useQuery({
    queryKey: ['availabilities', 'advisor', advisorId],
    queryFn: () => availabilityAPI.getByAdvisorId(advisorId),
    enabled: !!advisorId,
  });
};

export const useCreateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (availability: CreateAvailabilityRequest) => availabilityAPI.create(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, availability }: { id: number; availability: Partial<Availability> }) =>
      availabilityAPI.update(id, availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
};

export const useDeleteAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => availabilityAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availabilities'] });
    },
  });
};





