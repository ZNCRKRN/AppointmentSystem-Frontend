import { useQuery } from '@tanstack/react-query';
import { advisorsAPI } from '../services/api';

export const useAdvisors = () => {
  return useQuery({
    queryKey: ['advisors'],
    queryFn: advisorsAPI.getAll,
  });
};

export const useAdvisor = (id: number) => {
  return useQuery({
    queryKey: ['advisor', id],
    queryFn: () => advisorsAPI.getById(id),
    enabled: !!id,
  });
};





