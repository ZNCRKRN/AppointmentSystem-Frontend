import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminAPI.getUsers,
  });
};

// Deleting a user also removes their appointments, so appointment lists are refreshed too
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['advisors'] });
    },
  });
};

export const useApproveAdvisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminAPI.approveAdvisor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['advisors'] });
    },
  });
};
